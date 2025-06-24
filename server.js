// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = process.env.PORT || 3000;
const apiKeyRequired = process.env.API_KEY || '123456';
// In-memory storage
let products = [];

// Middleware: Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware: Parse JSON
app.use(bodyParser.json());

// Middleware: Authentication (API Key)
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== apiKeyRequired) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  next();
});

// Middleware: Validation for POST and PUT
function validateProduct(req, res, next) {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || typeof price !== 'number' || !category || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Validation failed: Missing or invalid product fields' });
  }
  next();
}

// Hello World Route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// CRUD Routes
app.get('/api/products', (req, res) => {
  const { category, page = 1, limit = 10, search } = req.query;
  let result = [...products];

  if (category) {
    result = result.filter(p => p.category === category);
  }

  if (search) {
    result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  const start = (page - 1) * limit;
  const end = start + Number(limit);
  res.json({ total: result.length, products: result.slice(start, end) });
});

app.get('/api/products/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new NotFoundError('Product not found'));
  res.json(product);
});

app.post('/api/products', validateProduct, (req, res) => {
  const newProduct = { id: uuidv4(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', validateProduct, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));
  products[index] = { id: req.params.id, ...req.body };
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));
  products.splice(index, 1);
  res.status(204).send();
});

// Product Statistics
app.get('/api/stats/products', (req, res) => {
  const stats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  res.json(stats);
});

// Error Classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

/*
🧪 Postman Testing Instructions:
1. Launch Postman
2. Set a header: Key = x-api-key, Value = 123456

3. Test routes:

GET Hello World:
GET http://localhost:3000/

GET all products:
GET http://localhost:3000/api/products

GET product by ID:
GET http://localhost:3000/api/products/<id>

POST create product:
POST http://localhost:3000/api/products
Body (JSON):
{
  "name": "Sample Product",
  "description": "This is a sample product",
  "price": 99.99,
  "category": "electronics",
  "inStock": true
}

PUT update product:
PUT http://localhost:3000/api/products/<id>
Body (JSON): same as above

DELETE product:
DELETE http://localhost:3000/api/products/<id>

FILTER by category:
GET http://localhost:3000/api/products?category=electronics

SEARCH by name:
GET http://localhost:3000/api/products?search=sample

PAGINATION:
GET http://localhost:3000/api/products?page=1&limit=2

PRODUCT STATS:
GET http://localhost:3000/api/stats/products
*/
