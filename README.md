# Tech10 - Loja de Tecnologia

Uma aplicação web completa de e-commerce com front-end e back-end integrados.

## 🚀 Funcionalidades

### Back-end (API REST)
- ✅ API RESTful com Express.js
- ✅ Gerenciamento de produtos (CRUD completo)
- ✅ Sistema de pedidos
- ✅ Controle de estoque
- ✅ CORS habilitado para integração front-end
- ✅ Armazenamento em memória (pode ser facilmente migrado para banco de dados)

### Front-end
- ✅ Interface moderna e responsiva
- ✅ Listagem de produtos
- ✅ Carrinho de compras
- ✅ Finalização de pedido
- ✅ Atualização de estoque em tempo real
- ✅ Persistência do carrinho no localStorage

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/DarlanCavalcante/tech10.git
cd tech10
```

2. Instale as dependências:
```bash
npm install
```

## ▶️ Executando a aplicação

Inicie o servidor:
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📡 API Endpoints

### Produtos

- **GET** `/api/products` - Lista todos os produtos
- **GET** `/api/products/:id` - Busca um produto específico
- **POST** `/api/products` - Cria um novo produto
- **PUT** `/api/products/:id` - Atualiza um produto
- **DELETE** `/api/products/:id` - Remove um produto

### Pedidos

- **GET** `/api/orders` - Lista todos os pedidos
- **GET** `/api/orders/:id` - Busca um pedido específico
- **POST** `/api/orders` - Cria um novo pedido
- **PATCH** `/api/orders/:id` - Atualiza status de um pedido

### Health Check

- **GET** `/api/health` - Verifica status da API

## 📦 Exemplos de uso da API

### Criar um produto
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Teste",
    "description": "Descrição do produto",
    "price": 99.99,
    "stock": 10
  }'
```

### Criar um pedido
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "João Silva",
    "customerEmail": "joao@email.com",
    "items": [
      {"productId": 1, "quantity": 2}
    ]
  }'
```

## 🛠️ Tecnologias Utilizadas

### Back-end
- Node.js
- Express.js
- CORS
- Body-parser

### Front-end
- HTML5
- CSS3
- JavaScript (Vanilla)

## 📂 Estrutura do Projeto

```
tech10/
├── public/
│   ├── index.html      # Página principal
│   ├── style.css       # Estilos
│   └── app.js          # JavaScript do front-end
├── server.js           # Servidor Express
├── package.json        # Dependências
└── README.md          # Documentação
```

## 🔐 Segurança

- CORS configurado para aceitar requisições
- Validação de dados nas requisições
- Verificação de estoque antes de processar pedidos

## 🚧 Melhorias Futuras

- [ ] Integração com banco de dados (MongoDB/PostgreSQL)
- [ ] Autenticação de usuários
- [ ] Painel administrativo
- [ ] Upload de imagens de produtos
- [ ] Sistema de pagamento
- [ ] Envio de e-mails de confirmação
- [ ] Histórico de pedidos do cliente

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👤 Autor

Darlan Cavalcante

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.