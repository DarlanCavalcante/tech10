// API Base URL
const API_URL = window.location.origin;

// Cart state
let cart = [];

// DOM Elements
let productsGrid;
let cartModal;
let checkoutModal;
let successModal;
let cartItemsDiv;
let cartCountSpan;
let cartTotalSpan;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeDOM();
    loadProducts();
    setupEventListeners();
    loadCartFromStorage();
});

function initializeDOM() {
    productsGrid = document.getElementById('products-grid');
    cartModal = document.getElementById('cart-modal');
    checkoutModal = document.getElementById('checkout-modal');
    successModal = document.getElementById('success-modal');
    cartItemsDiv = document.getElementById('cart-items');
    cartCountSpan = document.getElementById('cart-count');
    cartTotalSpan = document.getElementById('cart-total');
}

function setupEventListeners() {
    // Cart button
    document.getElementById('cart-btn').addEventListener('click', openCart);
    
    // Close buttons for modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Clear cart
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    
    // Checkout
    document.getElementById('checkout-btn').addEventListener('click', openCheckout);
    document.getElementById('cancel-checkout').addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });
    
    // Checkout form
    document.getElementById('checkout-form').addEventListener('submit', submitOrder);
    
    // Close success modal
    document.getElementById('close-success').addEventListener('click', () => {
        successModal.style.display = 'none';
    });
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        const products = await response.json();
        displayProducts(products);
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('loading').textContent = 'Erro ao carregar produtos. Tente novamente.';
    }
}

// Display products in grid
function displayProducts(products) {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stockClass = product.stock === 0 ? 'out-of-stock' : (product.stock < 5 ? 'low-stock' : '');
    const stockText = product.stock === 0 ? 'Fora de estoque' : `Estoque: ${product.stock} unidades`;
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    card.innerHTML = `
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            <p class="product-description">${escapeHtml(product.description)}</p>
            <p class="product-price">R$ ${product.price.toFixed(2)}</p>
            <p class="product-stock ${stockClass}">${stockText}</p>
            <button 
                class="btn btn-primary add-to-cart-btn" 
                data-product-id="${product.id}"
                ${product.stock === 0 ? 'disabled' : ''}
            >
                ${product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
            </button>
        </div>
    `;
    
    // Add event listener instead of inline onclick
    const button = card.querySelector('.add-to-cart-btn');
    if (button && !button.disabled) {
        button.addEventListener('click', (event) => {
            addToCart(product.id, event);
        });
    }
    
    return card;
}

// Add product to cart
async function addToCart(productId, event) {
    try {
        const response = await fetch(`${API_URL}/api/products/${productId}`);
        const product = await response.json();
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
            } else {
                alert('Quantidade máxima em estoque atingida!');
                return;
            }
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock
            });
        }
        
        updateCart();
        saveCartToStorage();
        
        // Show feedback
        if (event && event.target) {
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✓ Adicionado!';
            btn.style.background = '#27ae60';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 1000);
        }
        
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert('Erro ao adicionar produto ao carrinho');
    }
}

// Update cart display
function updateCart() {
    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalSpan.textContent = total.toFixed(2);
}

// Open cart modal
function openCart() {
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart">Seu carrinho está vazio</div>';
    } else {
        displayCartItems();
    }
    cartModal.style.display = 'block';
}

// Display cart items
function displayCartItems() {
    cartItemsDiv.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        // Escape HTML to prevent XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">R$ ${item.price.toFixed(2)} x ${item.quantity} = R$ ${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-product-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-product-id="${item.id}">+</button>
                </div>
                <button class="remove-btn" data-product-id="${item.id}">Remover</button>
            </div>
        `;
        
        // Add event listeners instead of inline onclick
        const decreaseBtn = cartItem.querySelector('.decrease-btn');
        const increaseBtn = cartItem.querySelector('.increase-btn');
        const removeBtn = cartItem.querySelector('.remove-btn');
        
        decreaseBtn.addEventListener('click', () => decreaseQuantity(item.id));
        increaseBtn.addEventListener('click', () => increaseQuantity(item.id));
        removeBtn.addEventListener('click', () => removeFromCart(item.id));
        
        cartItemsDiv.appendChild(cartItem);
    });
}

// Increase quantity
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item && item.quantity < item.maxStock) {
        item.quantity++;
        updateCart();
        displayCartItems();
        saveCartToStorage();
    } else {
        alert('Quantidade máxima em estoque atingida!');
    }
}

// Decrease quantity
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity--;
        if (item.quantity === 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            displayCartItems();
            saveCartToStorage();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart">Seu carrinho está vazio</div>';
    } else {
        displayCartItems();
    }
    saveCartToStorage();
}

// Clear cart
function clearCart() {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        cart = [];
        updateCart();
        cartItemsDiv.innerHTML = '<div class="empty-cart">Seu carrinho está vazio</div>';
        saveCartToStorage();
    }
}

// Open checkout
function openCheckout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Display checkout items
    const checkoutItemsDiv = document.getElementById('checkout-items');
    checkoutItemsDiv.innerHTML = '';
    
    cart.forEach(item => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
        `;
        checkoutItemsDiv.appendChild(checkoutItem);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkout-total').textContent = total.toFixed(2);
    
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'block';
}

// Submit order
async function submitOrder(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    
    const orderData = {
        customerName,
        customerEmail,
        items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }))
    };
    
    try {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar pedido');
        }
        
        const order = await response.json();
        
        // Clear cart
        cart = [];
        updateCart();
        saveCartToStorage();
        
        // Show success
        document.getElementById('order-id').textContent = order.id;
        checkoutModal.style.display = 'none';
        successModal.style.display = 'block';
        
        // Reset form
        document.getElementById('checkout-form').reset();
        
        // Reload products to update stock
        loadProducts();
        
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        alert('Erro ao finalizar pedido: ' + error.message);
    }
}

// Local storage functions
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}
