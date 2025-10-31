const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory data storage
let products = [
  {
    id: 1,
    name: 'Smartphone XYZ',
    description: 'Smartphone de última geração com 128GB',
    price: 1999.99,
    image: 'https://via.placeholder.com/300x200?text=Smartphone',
    stock: 10
  },
  {
    id: 2,
    name: 'Notebook ABC',
    description: 'Notebook potente para trabalho e jogos',
    price: 3499.99,
    image: 'https://via.placeholder.com/300x200?text=Notebook',
    stock: 5
  },
  {
    id: 3,
    name: 'Fone de Ouvido Bluetooth',
    description: 'Fone sem fio com cancelamento de ruído',
    price: 299.99,
    image: 'https://via.placeholder.com/300x200?text=Fone',
    stock: 20
  },
  {
    id: 4,
    name: 'Mouse Gamer',
    description: 'Mouse com RGB e alta precisão',
    price: 149.99,
    image: 'https://via.placeholder.com/300x200?text=Mouse',
    stock: 15
  },
  {
    id: 5,
    name: 'Teclado Mecânico',
    description: 'Teclado mecânico RGB para gamers',
    price: 399.99,
    image: 'https://via.placeholder.com/300x200?text=Teclado',
    stock: 8
  }
];

let orders = [];
let nextOrderId = 1;
let nextProductId = 6; // Next available product ID

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }
  res.json(product);
});

// Create new product
app.post('/api/products', (req, res) => {
  const { name, description, price, image, stock } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
  }

  const newProduct = {
    id: nextProductId++,
    name,
    description: description || '',
    price: parseFloat(price),
    image: image || 'https://via.placeholder.com/300x200?text=Produto',
    stock: stock || 0
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }

  const { name, description, price, image, stock } = req.body;
  
  products[productIndex] = {
    ...products[productIndex],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(price && { price: parseFloat(price) }),
    ...(image && { image }),
    ...(stock !== undefined && { stock: parseInt(stock) })
  };

  res.json(products[productIndex]);
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }

  products.splice(productIndex, 1);
  res.json({ message: 'Produto removido com sucesso' });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ message: 'Pedido não encontrado' });
  }
  res.json(order);
});

// Create new order
app.post('/api/orders', (req, res) => {
  const { customerName, customerEmail, items } = req.body;
  
  if (!customerName || !customerEmail || !items || items.length === 0) {
    return res.status(400).json({ message: 'Dados incompletos para criar pedido' });
  }

  // Validate products and stock
  let total = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    
    if (!product) {
      return res.status(404).json({ message: `Produto ${item.productId} não encontrado` });
    }
    
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Estoque insuficiente para ${product.name}` });
    }

    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      price: product.price,
      subtotal: product.price * item.quantity
    });

    total += product.price * item.quantity;
    
    // Update stock
    product.stock -= item.quantity;
  }

  const newOrder = {
    id: nextOrderId++,
    customerName,
    customerEmail,
    items: orderItems,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// Update order status
app.patch('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({ message: 'Pedido não encontrado' });
  }

  const { status } = req.body;
  
  if (status) {
    order.status = status;
  }

  res.json(order);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API está funcionando' });
});

// Serve frontend - removed catch-all route due to Express 5 compatibility
// Static files are served from the public directory via express.static middleware

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
