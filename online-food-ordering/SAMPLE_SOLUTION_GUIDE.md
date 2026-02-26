# Sample Solution Guide
## Online Food Ordering System — What a Complete Submission Looks Like

---

## Overview

This guide shows instructors and advanced students what a **complete, high-quality submission** should include across all 4 phases, with examples and explanations.

---

## Phase 1: Scaffolding & Models — Expected Output

### 1.1 Project Structure

```
online-food-ordering/
├── models/
│   ├── index.js              # Database config and associations
│   ├── MenuItem.js           # MenuItem model
│   ├── Order.js              # Order model
│   └── OrderItem.js          # Junction table
├── routes/
│   ├── menuitems.js          # MenuItem CRUD routes
│   └── orders.js             # Order CRUD routes
├── controllers/              # (Optional: if using MVC pattern)
│   ├── menuitemController.js
│   └── orderController.js
├── views/
│   ├── menuitems/
│   │   ├── index.html        # List all items (plain HTML)
│   │   ├── show.html         # View single item (plain HTML)
│   │   ├── create.html       # Create form (plain HTML)
│   │   └── edit.html         # Edit form (plain HTML)
│   └── orders/
│       ├── index.html        # List all orders (plain HTML)
│       ├── show.html         # View single order (plain HTML)
│       ├── create.html       # Create form (plain HTML)
│       └── edit.html         # Edit form (plain HTML)
├── public/                   # Static assets (empty at Phase 1)
├── config/
│   └── database.js           # Database connection
├── app.js                    # Main application file
├── package.json              # Dependencies
├── .gitignore                # Git ignore rules
└── README.md                 # Setup instructions
```

### 1.2 Sample Models

**MenuItem Model (Node.js/Sequelize):**
```javascript
// models/MenuItem.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('MenuItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true }
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    image_url: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'MenuItems',
    timestamps: true,
  });
};
```

**Order Model:**
```javascript
// models/Order.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    customer_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Delivered', 'Cancelled'),
      defaultValue: 'Pending',
    },
  }, {
    tableName: 'Orders',
    timestamps: true,
  });
};
```

**OrderItem Junction Table:**
```javascript
// models/OrderItem.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Orders', key: 'id' }
    },
    menu_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'MenuItems', key: 'id' }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    price_at_time_of_order: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'OrderItems',
    timestamps: true,
  });
};
```

### 1.3 Sample CRUD Routes

**Express.js Routes (menuitems.js):**
```javascript
// routes/menuitems.js
const express = require('express');
const router = express.Router();
const { MenuItem } = require('../models');

// GET /menuitems - List all items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.findAll();
    res.render('menuitems/index', { items });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

// GET /menuitems/:id - Show single item
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).render('error', { error: 'Item not found' });
    res.render('menuitems/show', { item });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

// GET /menuitems/create - Create form
router.get('/create', (req, res) => {
  res.render('menuitems/create');
});

// POST /menuitems - Create item
router.post('/', async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.redirect(`/menuitems/${item.id}`);
  } catch (err) {
    res.status(400).render('menuitems/create', { error: err.message });
  }
});

// GET /menuitems/:id/edit - Edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).render('error', { error: 'Item not found' });
    res.render('menuitems/edit', { item });
  } catch (err) {
    res.status(500).render('error', { error: err.message });
  }
});

// PUT /menuitems/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).render('error', { error: 'Item not found' });
    await item.update(req.body);
    res.redirect(`/menuitems/${item.id}`);
  } catch (err) {
    res.status(400).render('menuitems/edit', { item: req.body, error: err.message });
  }
});

// DELETE /menuitems/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).send('Item not found');
    await item.destroy();
    res.redirect('/menuitems');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
```

### 1.4 Sample Plain-HTML View

**menuitems/index.html (plain HTML, no Bootstrap):**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Menu Items</title>
</head>
<body>
  <h1>Menu Items</h1>
  <a href="/menuitems/create">Create New Item</a>
  
  <table border="1">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Price</th>
        <th>Category</th>
        <th>Available</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <% items.forEach(item => { %>
        <tr>
          <td><%= item.id %></td>
          <td><%= item.name %></td>
          <td>$<%= item.price %></td>
          <td><%= item.category %></td>
          <td><%= item.available ? 'Yes' : 'No' %></td>
          <td>
            <a href="/menuitems/<%= item.id %>">View</a>
            <a href="/menuitems/<%= item.id %>/edit">Edit</a>
            <form method="POST" action="/menuitems/<%= item.id %>?_method=DELETE" style="display:inline;">
              <button type="submit">Delete</button>
            </form>
          </td>
        </tr>
      <% }); %>
    </tbody>
  </table>
</body>
</html>
```

### 1.5 Phase 1 Git Commits

```
commit abc123 "Phase 1: Initialize Express app and database config"
commit def456 "Phase 1: Create MenuItem and Order models with associations"
commit ghi789 "Phase 1: Generate CRUD routes for menuitems and orders"
commit jkl012 "Phase 1: Create plain HTML views for all CRUD operations"
commit mno345 "Phase 1: Test all CRUD operations, database seeding"
```

---

## Phase 2: Bootstrap Integration — Expected Output

### 2.1 Updated Views with Bootstrap

The same views are now enhanced with Bootstrap. Example transformation:

**Before (Plain HTML):**
```html
<table border="1">
  <tr>
    <th>Name</th>
    <th>Price</th>
  </tr>
  <!-- rows... -->
</table>
```

**After (Bootstrap):**
```html
<section class="py-5">
  <div class="container">
    <h1 class="mb-4">Our Menu</h1>
    
    <div class="row g-4">
      <% items.forEach(item => { %>
        <div class="col-lg-4 col-md-6 col-sm-12">
          <div class="card h-100 shadow-sm">
            <img src="<%= item.image_url %>" class="card-img-top" alt="<%= item.name %>">
            <div class="card-body">
              <h5 class="card-title"><%= item.name %></h5>
              <p class="card-text text-muted"><%= item.description %></p>
              <span class="badge bg-primary">$<%= item.price %></span>
              <span class="badge bg-secondary"><%= item.category %></span>
            </div>
            <div class="card-footer bg-white">
              <a href="/menuitems/<%= item.id %>" class="btn btn-sm btn-outline-primary">View</a>
              <a href="/menuitems/<%= item.id %>/edit" class="btn btn-sm btn-warning">Edit</a>
              <form method="POST" action="/menuitems/<%= item.id %>?_method=DELETE" style="display:inline;">
                <button class="btn btn-sm btn-danger" type="submit">Delete</button>
              </form>
            </div>
          </div>
        </div>
      <% }); %>
    </div>
  </div>
</section>
```

### 2.2 Navbar in Shared Layout/Header

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
  <div class="container-fluid">
    <a class="navbar-brand" href="/">🍔 FoodFlow</a>
    
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="/menuitems">Menu</a></li>
        <li class="nav-item"><a class="nav-link" href="/orders">Orders</a></li>
        <li class="nav-item"><a class="nav-link" href="/contact">Contact</a></li>
      </ul>
      <button class="ms-2 btn btn-outline-light">🛒 Cart</button>
    </div>
  </div>
</nav>
```

### 2.3 Custom CSS File

**public/css/style.css:**
```css
/* Custom theme */
:root {
  --primary-color: #7c5cff;
  --secondary-color: #00c2a8;
  --accent-color: #ff7a59;
}

body {
  font-family: 'Poppins', 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Card hover effects */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  border-radius: 12px;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: var(--primary-color);
  border: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #6b4dd6;
  transform: scale(1.05);
}
```

### 2.4 Responsive Testing Evidence

Students should provide:
- Screenshots of the app on mobile (375px), tablet (768px), and desktop (1200px)
- Chrome DevTools showing responsive widths
- Confirmation that navbar collapses on mobile
- Confirmation that cards are 1 column on mobile, 2 on tablet, 4 on desktop

---

## Phase 3: REST Principles — Expected Output

### 3.1 HTTP Method Implementation

**Express routes using correct methods:**

```javascript
// GET (safe, idempotent, no data modification)
app.get('/api/v1/menuitems', (req, res) => {
  // Retrieve data
});

// POST (creates new resource, not idempotent)
app.post('/api/v1/menuitems', (req, res) => {
  // Create new item
});

// PUT (replaces resource, idempotent)
app.put('/api/v1/menuitems/:id', (req, res) => {
  // Replace entire item
});

// DELETE (removes resource, idempotent)
app.delete('/api/v1/menuitems/:id', (req, res) => {
  // Delete item
});
```

### 3.2 JWT Authentication Implementation

```javascript
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login endpoint
app.post('/api/v1/login', (req, res) => {
  const user = authenticateUser(req.body.email, req.body.password);
  if (user) {
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, {
      expiresIn: '24h'
    });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Middleware to check token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Protected endpoint
app.get('/api/v1/orders', authMiddleware, (req, res) => {
  // Fetch orders for authenticated user
});
```

### 3.3 REST_API_DOCUMENTATION.md with Idempotency

**Sample from student submission:**

```markdown
# REST API Documentation

## PUT /menuitems/:id
**Description:** Update a menu item
**Method:** PUT
**Authentication:** Required (Admin)
**Idempotent:** ✅ YES

**Why Idempotent?**
Calling PUT with the same data multiple times produces the same result.
- Call 1: Item updated to {name: "Pizza", price: 12.00}
- Call 2: Item updated to {name: "Pizza", price: 12.00} (same state)
- Call 3: Item updated to {name: "Pizza", price: 12.00} (same state)
Result: All calls produce identical state. ✅ Idempotent.

## POST /menuitems
**Description:** Create a new menu item
**Method:** POST
**Authentication:** Required (Admin)
**Idempotent:** ❌ NO

**Why NOT Idempotent?**
Each POST creates a NEW resource with a unique ID.
- Call 1: Creates Item #100
- Call 2: Creates Item #101
- Call 3: Creates Item #102
Result: Three different items exist. Different results each time. ❌ NOT idempotent.
```

### 3.4 Testing Evidence

**curl commands and output:**

```bash
$ curl -X GET http://localhost:3000/api/v1/menuitems
{
  "success": true,
  "data": [
    {"id": 1, "name": "Pizza", "price": 9.99}
  ]
}

$ curl -X POST http://localhost:3000/api/v1/menuitems \
  -H "Content-Type: application/json" \
  -d '{"name":"Burger","price":8.99}'
{
  "success": true,
  "data": {"id": 2, "name": "Burger", "price": 8.99}
}

$ curl -X PUT http://localhost:3000/api/v1/menuitems/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Pizza","price":10.99}'
{
  "success": true,
  "data": {"id": 1, "name": "Updated Pizza", "price": 10.99}
}

$ curl -X DELETE http://localhost:3000/api/v1/menuitems/1
HTTP/1.1 204 No Content
```

---

## Phase 4: URI Design — Expected Output

### 4.1 Complete REST API Endpoints List

**REST_API_SPECIFICATION.md excerpt:**

```markdown
# REST API Specification

## Base URL
http://localhost:3000/api/v1

## Authentication
JWT Token: Authorization: Bearer <token>

---

## Menu Items Endpoints

### GET /menuitems
- Description: Retrieve all menu items
- Method: GET
- Auth: Not required
- Query Params: category, limit, offset
- Response: 200 OK { success: true, data: [...] }

### GET /menuitems/:id
- Description: Retrieve single menu item
- Method: GET
- Auth: Not required
- URL Params: id
- Response: 200 OK { success: true, data: {...} } or 404

### POST /menuitems
- Description: Create new menu item
- Method: POST
- Auth: Required (Admin)
- Request Body: { name, description, price, category, available, image_url }
- Response: 201 Created { success: true, data: {...} }

### PUT /menuitems/:id
- Description: Update menu item
- Method: PUT
- Auth: Required (Admin)
- URL Params: id
- Request Body: { name, description, price, category, available, image_url }
- Response: 200 OK { success: true, data: {...} }

### DELETE /menuitems/:id
- Description: Delete menu item
- Method: DELETE
- Auth: Required (Admin)
- URL Params: id
- Response: 204 No Content

---

## Orders Endpoints
(Similar structure as above)

---

## Nested Resources: Order Items

### GET /orders/:id/items
- Description: Get all items in an order
- Method: GET
- Response: 200 OK with array of items

### POST /orders/:id/items
- Description: Add item to order
- Method: POST
- Request Body: { menu_item_id, quantity }

### DELETE /orders/:id/items/:item_id
- Description: Remove item from order
- Method: DELETE
- Response: 204 No Content
```

### 4.2 API Design Rationale Document

**API_DESIGN_RATIONALE.md excerpt:**

```markdown
# API Design Rationale

## URI Design: Why Plural Nouns?

**Chosen:** /menuitems, /orders (plural)
**Alternative Rejected:** /menuitem, /order (singular)

**Reason:**
In REST, URIs represent resources (things), not actions. Resources are typically collections or sets of entities.
The plural form indicates that the endpoint manages a collection of resources.

**Convention:**
All major REST APIs follow this convention:
- GitHub: /repos, /users, /issues
- Twitter: /tweets, /users, /followers
- Stripe: /customers, /invoices, /products

**Benefits:**
- Consistency throughout the API
- Clear that we're managing a collection
- Easier to add sub-resources (e.g., /menuitems/1/reviews)

---

## URI Design: Why No Verbs?

**Chosen:** /menuitems (resource-oriented)
**Alternative Rejected:** /getMenuItems, /fetchMenus, /listItems (action-oriented)

**Reason:**
HTTP methods (GET, POST, PUT, DELETE) define the ACTION.
URIs define the RESOURCE.
Combining verbs in URIs violates REST principles.

**Examples:**
- ❌ /getMenuItems — Implies GET action
- ❌ /createOrder — Implies POST action
- ✅ /menuitems — Resource name, METHOD specifies action

**The Six REST Architectural Constraints:**

1. **Client-Server:** Separation of concerns. Client (UI) and Server (API) are independent.
   - Our implementation: Separate Express backend and EJS frontend

2. **Statelessness:** Each request contains all information needed; server stores no client context.
   - Our implementation: JWT tokens. No session storage on server.

3. **Uniform Interface:** Consistent API design using HTTP methods semantically.
   - Our implementation: GET for retrieval, POST for creation, PUT for updates, DELETE for removal

4. **Caching:** Responses should be cacheable where appropriate.
   - Our implementation: GET requests have cache-friendly response codes (200)

5. **Layered System:** Client doesn't know if connected directly to end server.
   - Our implementation: Can add proxy/load balancer without client knowing

6. **Code-on-Demand:** (Optional) Server can extend client functionality.
   - Our implementation: Not used in this project

---

## HTTP Method Selection: Why PUT for Updates?

**Chosen:** PUT /menuitems/:id (full replacement)
**Alternative Considered:** PATCH /menuitems/:id (partial update)

**Reason - Idempotency:**
- PUT is idempotent: Calling PUT 10 times with same data = same final state
- PATCH is NOT idempotent: Multiple PATCH calls might trigger different side effects

**Example:**
```
PUT /orders/1 with {status: "confirmed"}
- Called twice = order is confirmed after both calls ✅ Idempotent

PATCH /orders/1 with {status: "confirmed"}
- First call: Triggers email notification
- Second call: No email (already sent) — Different behavior ❌ Not idempotent
```

**Our Choice:** PUT ensures predictable, repeatable behavior.
```

---

## Code Quality — Expected Standards

### 3.1 Code Organization

```
Root/
├── models/        # All database models
├── routes/        # All API route handlers
├── views/         # All EJS templates
├── public/        # Static CSS, JS, images
├── controllers/   # (Optional) Business logic
├── middleware/    # Authentication, logging
├── config/        # Database, environment
└── app.js         # Entry point
```

### 3.2 File Naming

✅ Good:
- `models/MenuItem.js`
- `routes/menuitems.js`
- `views/menuitems/index.ejs`
- `controllers/menuitemController.js`
- `public/css/style.css`

❌ Bad:
- `model.js`
- `routes.js`
- `view.html`
- `controller.js`
- `styles.css`, `style123.css`

### 3.3 Comments & Documentation

✅ Good:
```javascript
// Fetch menu item by ID
// Returns 404 if not found
app.get('/menuitems/:id', async (req, res) => {
  const item = await MenuItem.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(item);
});
```

❌ Bad:
```javascript
// This gets the item
app.get('/menuitems/:id', async (req, res) => {
  const item = await MenuItem.findByPk(req.params.id); // Find item by id
  if (!item) { // Check if item exists
    return res.status(404).json({ error: 'Not found' }); // Item not found error
  }
  res.json(item); // Return item as JSON
});
```

### 3.4 Error Handling

✅ Good:
```javascript
app.post('/orders', authMiddleware, async (req, res) => {
  try {
    // Validate input
    if (!req.body.customerName || !req.body.items) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: customerName, items'
      });
    }

    // Create order
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});
```

---

## Commit History — Expected Pattern

```
* abc1234 Phase 4: API design rationale and complete specification
* def5678 Phase 4: RESTful URI design with nested resources
* ghi9012 Phase 3: Idempotency documentation
* jkl3456 Phase 3: JWT authentication implementation
* mno7890 Phase 3: HTTP method mapping and REST principles
* pqr0123 Phase 2: Responsive card grid and Bootstrap theme
* stu4567 Phase 2: Navbar, forms, custom CSS
* vwx8901 Phase 2: Bootstrap integration
* yza2345 Phase 1: CRUD routes and controllers
* bcd6789 Phase 1: Models and database schema
* efg0123 Initial project setup with Express and Sequelize
```

Minimum: 20 commits throughout project  
Quality: Commits have descriptive messages

---

## README.md Template

**README.md (expected from students):**

```markdown
# Online Food Ordering System

A full-stack web application for ordering food online, built with Express.js, Sequelize, Bootstrap 5, and RESTful API design.

## Features

- Browse menu items with responsive card layout
- Create, read, update, delete (CRUD) menu items and orders
- Shopping cart functionality with local storage
- JWT-based authentication
- Fully responsive design (mobile, tablet, desktop)
- REST API with documented endpoints

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite (Sequelize ORM)
- **Frontend:** EJS templates, Bootstrap 5, JavaScript
- **Authentication:** JWT tokens
- **Static Assets:** CSS, JavaScript, Images

## Prerequisites

- Node.js v16+ ([download](https://nodejs.org/))
- npm (comes with Node.js)
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd online-food-ordering
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## Running the Application

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Visit **http://localhost:3000** in your browser.

## API Documentation

Full API documentation available in `REST_API_SPECIFICATION.md`

### Example: Get all menu items
```bash
curl http://localhost:3000/api/v1/menuitems
```

### Example: Create an order
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_address": "123 Main St",
    "items": [{"menu_item_id": 1, "quantity": 2}]
  }'
```

## Project Structure

- `models/` — Database models (MenuItem, Order, OrderItem)
- `routes/` — API route handlers
- `views/` — EJS templates
- `public/` — Static assets (CSS, JS, images)
- `REST_API_SPECIFICATION.md` — Complete API documentation
- `API_DESIGN_RATIONALE.md` — Design decisions and REST principles
- `REST_API_DOCUMENTATION.md` — Idempotency analysis

## Testing

```bash
# Run tests
npm test

# Test API with curl (examples in REST_API_SPECIFICATION.md)
curl http://localhost:3000/api/v1/menuitems
```

## Deployment

This app can be deployed to Heroku, AWS, Azure, etc.

## License

MIT

## Author

[Your Name]
```

---

## Summary of Excellent Submission

A **complete, high-quality submission** includes:

✅ **Phase 1:**
- Database models with proper creation, migration
- Functional CRUD routes
- Plain HTML views (no styling)
- Evidence in git history

✅ **Phase 2:**
- Bootstrap 5 fully integrated
- Responsive grid (4-3-2-1 columns)
- Navbar with menu, cart, theme toggle
- Custom CSS with animations
- Tested on mobile, tablet, desktop

✅ **Phase 3:**
- Correct HTTP methods (GET, POST, PUT, DELETE)
- JWT authentication implemented
- Idempotency documented for all operations
- API tested with curl/Postman
- Clear explanations of statelessness

✅ **Phase 4:**
- RESTful URIs (plural nouns, no verbs)
- Comprehensive API specification (12+ endpoints)
- Design rationale explaining each decision
- References to REST constraints
- Professional documentation

✅ **Code Quality:**
- Well-organized folder structure
- Clear naming conventions
- Comments and docstrings where needed
- Error handling and validation
- Minimum 20 git commits with descriptive messages
- README.md with setup instructions

✅ **Bonus (optional):**
- Advanced auth (OAuth, roles)
- API versioning
- Tests with 80%+ passing
- Cloud deployment with public URL

---

**End of Sample Solution Guide**
