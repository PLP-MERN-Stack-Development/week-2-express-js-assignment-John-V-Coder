 Project Setup
Initialized Node.js project

Using npm init -y to create package.json.

Installed required dependencies

bash
Copy
Edit
npm install express body-parser uuid
🚀 Express.js Server Setup
Created a basic Express server using:

js
Copy
Edit
const express = require('express');
const app = express();
const port = 3000;
Server starts and listens on port 3000:

js
Copy
Edit
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
Root route / responds with “Hello, World!”:

js
Copy
Edit
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
🛒 RESTful API: Products Resource
The API manages a products array in-memory with the following fields:

id: unique identifier (generated using uuidv4())

name: product name

description: product description

price: number

category: category name

inStock: boolean

📥 Create
http
Copy
Edit
POST /api/products
Adds a new product after validating input.

📤 Read All
http
Copy
Edit
GET /api/products
Lists all products.

Supports filtering by category, pagination, and search by name using query params:

category

page and limit

search

🔍 Read One
http
Copy
Edit
GET /api/products/:id
Returns a single product by ID.

✏️ Update
http
Copy
Edit
PUT /api/products/:id
Updates a product by ID after validation.

❌ Delete
http
Copy
Edit
DELETE /api/products/:id
Deletes a product by ID.

📊 Product Statistics
http
Copy
Edit
GET /api/stats/products
Returns product count grouped by category.

🛡️ Middleware Implemented
Logger Middleware

js
Copy
Edit
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
JSON Body Parser

js
Copy
Edit
app.use(bodyParser.json());
Authentication Middleware

Requires header: x-api-key: 123456

js
Copy
Edit
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== '123456') {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  next();
});
Validation Middleware

Applied to POST and PUT routes to ensure valid product structure.

🧯 Error Handling
Custom Error Classes
NotFoundError used for missing product cases.

Global Error Handler
js
Copy
Edit
app.use((err, req, res, next) => {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});
🧪 Testing with Postman
Set base URL: http://localhost:3000

Add header to all requests:

vbnet
Copy
Edit
Key: x-api-key
Value: 123456
Use the following requests to test:

POST /api/products → Add product

GET /api/products → List all

GET /api/products/:id → Get one

PUT /api/products/:id → Update

DELETE /api/products/:id → Remove

GET /api/products?category=Phones&page=1&limit=2 → Pagination & filtering

GET /api/products?search=phone → Search

GET /api/stats/products → Stats

