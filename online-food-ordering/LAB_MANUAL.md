# Lab Manual: Online Food Ordering System
## A Complete Web Development Project Using MVC Architecture, Bootstrap, and REST Principles

---

## Course Information
- **Course Name:** Web Development & REST API Design
- **Level:** Undergraduate
- **Duration:** 4 Weeks (4 Phases, 1 Week Each)
- **Prerequisites:** Basic HTML/CSS, Introduction to Web Development, familiarity with at least one programming language

---

## Project Overview

In this lab, you will build a **complete Online Food Ordering System** that demonstrates industry-standard web development practices. The system allows customers to browse a restaurant's menu, add items to a cart, and place orders. You will work through four phases, each enforcing specific learning objectives.

### Project Learning Goals
By the end of this project, you will:
1. Understand and apply **MVC (Model-View-Controller)** architecture principles
2. Use **Bootstrap 5** to create responsive, professional web interfaces
3. Design and implement **RESTful APIs** adhering to HTTP standards
4. Write **clear, semantic URIs** that follow REST conventions
5. Evaluate your API design for **statelessness** and **idempotency**
6. Deploy a fully functional, scalable web application

---

## Phase 1: Models & View Generators (Scaffolding)
**Duration:** 1 Week | **Objective:** Build the data foundation and auto-generate basic CRUD templates

### Learning Objectives
- Understand **MVC pattern**: Models define data, Views display it, Controllers handle business logic
- Use **ORM (Object-Relational Mapping)** to map database tables to application models
- Leverage framework **code generators** to reduce boilerplate and ensure consistency
- Create plain-HTML scaffolded views as a foundation for Phase 2

### Architecture Overview
```
Project Root/
├── models/
│   ├── MenuItem.js (or .rb, .py, .cs depending on your framework)
│   └── Order.js
├── controllers/ (or routes/)
│   ├── MenuItemController
│   └── OrderController
├── views/
│   ├── menuitems/
│   │   ├── index.html
│   │   ├── show.html
│   │   ├── create.html
│   │   └── edit.html
│   └── orders/
│       ├── index.html
│       ├── show.html
│       ├── create.html
│       └── edit.html
├── config/
│   └── database.js (connection settings)
└── public/ (static assets)
```

### Detailed Instructions

#### Step 1.1: Choose Your MVC Framework
Select **one** of the following frameworks:
- **Node.js + Express** → Use `express-generator` or manual setup
- **Python + Django** → Use `django-admin startproject` and `django-admin startapp`
- **Ruby + Rails** → Use `rails new` and `rails generate scaffold`
- **C# + ASP.NET Core** → Use `dotnet new` templates
- **PHP + Laravel** → Use `laravel new` and `php artisan make:model`

**Why?** Each framework provides built-in tools to generate models, controllers, and views. This enforces the MVC pattern and saves time.

#### Step 1.2: Create the Database Models

##### Model 1: MenuItem
```
Fields:
  - id (Primary Key, auto-increment)
  - name (String, required)
  - description (Text)
  - price (Decimal, required)
  - category (String, e.g., "Pizza", "Burger", "Dessert")
  - available (Boolean, default: true)
  - image_url (String, optional)
  - created_at (Timestamp)
  - updated_at (Timestamp)

Relationships:
  - Has Many Orders (through OrderItem)
```

##### Model 2: Order
```
Fields:
  - id (Primary Key, auto-increment)
  - customer_name (String, required)
  - customer_email (String, required)
  - customer_address (Text, required)
  - total_price (Decimal, required)
  - status (String, enum: "Pending", "Confirmed", "Delivered", default: "Pending")
  - created_at (Timestamp)
  - updated_at (Timestamp)

Relationships:
  - Has Many MenuItems (through OrderItem)
  - Has One Address (optional)
```

##### Model 3: OrderItem (Junction Table)
```
Fields:
  - id (Primary Key, auto-increment)
  - order_id (Foreign Key)
  - menu_item_id (Foreign Key)
  - quantity (Integer, required)
  - price_at_time_of_order (Decimal)
  - created_at (Timestamp)
  - updated_at (Timestamp)
```

#### Step 1.3: Generate CRUD Routes & Controllers

Using your framework's built-in generators, scaffold the controllers and routes:

**Express.js Example:**
```bash
# Manual setup (Express has no built-in scaffold generator):
mkdir routes controllers views
# Create routes/menuitems.js, routes/orders.js manually
# Create controllers/menuitemController.js, etc.
```

**Django Example:**
```bash
python manage.py startapp menuitems
python manage.py startapp orders
# Create models in each app's models.py
python manage.py makemigrations
python manage.py migrate
```

**Rails Example:**
```bash
rails generate scaffold MenuItem name:string description:text price:decimal category:string available:boolean image_url:string
rails generate scaffold Order customer_name:string customer_email:string customer_address:text total_price:decimal status:string
rails db:migrate
```

#### Step 1.4: Scaffold Plain-HTML CRUD Views

Generate default CRUD templates using your framework:

**Generate Templates for MenuItem:**
- `menuitems/index.html` — Display all menu items in a table or list
- `menuitems/show.html` — Show a single menu item with details
- `menuitems/create.html` — Form to create a new menu item
- `menuitems/edit.html` — Form to edit an existing menu item

**Generate Templates for Order:**
- `orders/index.html` — Display all orders in a table
- `orders/show.html` — Show order details with line items
- `orders/create.html` — Form to create an order (checkout)
- `orders/edit.html` — Form to edit order status (admin feature)

**What the Generated Views Should Include:**
- Plain HTML forms with text inputs, textareas, and submit buttons
- Basic table layouts to display data
- Links to Create, Read, Update, Delete operations
- No styling beyond browser defaults (this is intentional—Phase 2 adds Bootstrap)

**Example Generated View (Django):**
```html
<!-- menuitems/index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Menu Items</title>
</head>
<body>
    <h1>Menu Items</h1>
    <a href="/menuitems/create">Add New Item</a>
    <table border="1">
        <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Actions</th>
        </tr>
        {% for item in menuitems %}
        <tr>
            <td>{{ item.name }}</td>
            <td>${{ item.price }}</td>
            <td>{{ item.category }}</td>
            <td>
                <a href="/menuitems/{{ item.id }}/edit">Edit</a>
                <a href="/menuitems/{{ item.id }}">View</a>
                <a href="/menuitems/{{ item.id }}/delete">Delete</a>
            </td>
        </tr>
        {% endfor %}
    </table>
</body>
</html>
```

#### Step 1.5: Verify CRUD Operations Work

Test each operation:
- **CREATE:** Add a new menu item via the `/menuitems/create` form
- **READ:** View all items at `/menuitems` and a single item at `/menuitems/:id`
- **UPDATE:** Edit an item's details at `/menuitems/:id/edit`
- **DELETE:** Remove an item (confirm the record is gone from the database)

Do the same for Orders.

**Checklist for Phase 1:**
- [ ] Database models (MenuItem, Order, OrderItem) created and migrated
- [ ] Routes for CRUD operations defined in your framework
- [ ] Plain-HTML views generated for all CRUD operations
- [ ] Test: Create a new menu item and verify it appears in the list
- [ ] Test: Update a menu item and verify the change persists
- [ ] Test: Delete a menu item and verify it's removed
- [ ] Commit your code with message: "Phase 1: Scaffolded MVC models and CRUD views"

---

## Phase 2: Bootstrap Integration
**Duration:** 1 Week | **Objective:** Transform plain HTML into a professional, responsive web interface

### Learning Objectives
- Integrate **Bootstrap 5 CSS framework** for modern styling
- Understand and apply the **12-column responsive grid system**
- Implement **Cards** to display menu items in a grid layout
- Create a sticky **Navbar** with navigation links
- Style forms and buttons for accessibility and user experience
- Ensure responsiveness across mobile, tablet, and desktop devices

### Detailed Instructions

#### Step 2.1: Link Bootstrap CDN

In your base template (or every view), link Bootstrap 5 and FontAwesome:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Online Food Ordering</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom CSS (for Phase 2+) -->
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <!-- Your content -->
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

#### Step 2.2: Build the Navbar

Create a sticky navbar with:
- **Logo/Brand:** Your project name on the left
- **Navigation Links:** Home, Menu, Orders, Contact
- **Search Bar:** Filter items by name (CSS only, no JS required)
- **Cart Icon:** Placeholder for Phase 3 (interactive checkout)
- **Theme Toggle:** Dark/Light mode toggle (CSS only for now)

**Example Bootstrap Navbar:**
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

**Key Bootstrap Concepts:**
- `navbar navbar-expand-lg` — Navbar that collapses on small screens
- `sticky-top` — Keeps navbar at the top while scrolling
- `navbar-dark bg-dark` — Dark theme
- `ms-auto` — Moves items to the right (margin-start: auto)
- `btn btn-outline-light` — Light-outlined button

#### Step 2.3: Redesign Menu Items Grid (12-Column Layout)

Replace the plain table with a responsive **Card Grid**:

```html
<section class="py-5">
  <div class="container">
    <h1 class="mb-4">Our Menu</h1>
    
    <div class="row g-4">
      <!-- Each menu item is a card in a column -->
      {% for item in menuitems %}
      <div class="col-md-6 col-lg-4 col-xl-3">
        <div class="card h-100 shadow-sm">
          <!-- Card Image -->
          <img src="{{ item.image_url }}" class="card-img-top" alt="{{ item.name }}">
          
          <!-- Card Body -->
          <div class="card-body">
            <h5 class="card-title">{{ item.name }}</h5>
            <p class="card-text text-muted">{{ item.description }}</p>
            
            <!-- Price Badge -->
            <span class="badge bg-primary me-2">${{ item.price }}</span>
            <span class="badge bg-secondary">{{ item.category }}</span>
          </div>
          
          <!-- Card Footer with Actions -->
          <div class="card-footer bg-white">
            <a href="/menuitems/{{ item.id }}" class="btn btn-sm btn-outline-primary">View</a>
            <a href="/menuitems/{{ item.id }}/edit" class="btn btn-sm btn-warning">Edit</a>
            <a href="/menuitems/{{ item.id }}/delete" class="btn btn-sm btn-danger">Delete</a>
          </div>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
</section>
```

**Key Bootstrap Grid Concepts:**
- `container` — Fixed-width container with padding
- `row g-4` — Row with 4-unit gutters (gaps) between columns
- `col-md-6 col-lg-4 col-xl-3` — Responsive columns:
  - Medium screens (≥768px): 2 columns (6/12)
  - Large screens (≥992px): 3 columns (4/12)
  - Extra-large screens (≥1200px): 4 columns (3/12)
- `card h-100` — Card with full height (Equal column heights)
- `shadow-sm` — Subtle drop shadow
- `card-body`, `card-footer` — Semantic card sections

#### Step 2.4: Style Forms (Create & Edit)

Upgrade the create/edit forms with Bootstrap styling:

```html
<section class="py-5">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h1>Add New Menu Item</h1>
        <form method="POST" action="/menuitems" class="mt-4">
          
          <!-- Name Field -->
          <div class="mb-3">
            <label for="name" class="form-label">Item Name</label>
            <input type="text" class="form-control" id="name" name="name" required>
          </div>
          
          <!-- Description Field -->
          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" id="description" name="description" rows="3"></textarea>
          </div>
          
          <!-- Price Field -->
          <div class="mb-3">
            <label for="price" class="form-label">Price ($)</label>
            <input type="number" class="form-control" id="price" name="price" step="0.01" required>
          </div>
          
          <!-- Category Dropdown -->
          <div class="mb-3">
            <label for="category" class="form-label">Category</label>
            <select class="form-select" id="category" name="category" required>
              <option value="">-- Select a category --</option>
              <option value="Pizza">Pizza</option>
              <option value="Burger">Burger</option>
              <option value="Salad">Salad</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>
          
          <!-- Available Checkbox -->
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="available" name="available" checked>
            <label class="form-check-label" for="available">Available</label>
          </div>
          
          <!-- Submit Buttons -->
          <div class="d-grid gap-2 d-sm-flex">
            <button type="submit" class="btn btn-primary">Save Item</button>
            <a href="/menuitems" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
```

**Key Bootstrap Form Concepts:**
- `form-control` — Standard input styling
- `form-select` — Styled dropdown
- `form-check` / `form-check-input` — Checkbox with proper spacing
- `mb-3` — Margin-bottom (3 units) for vertical spacing
- `d-grid gap-2 d-sm-flex` — Responsive button layout (stacked on mobile, flex on desktop)
- `required` — HTML5 validation attribute

#### Step 2.5: Style Order Listing & Checkout

Create a professional Orders page:

```html
<section class="py-5">
  <div class="container">
    <h1 class="mb-4">Your Orders</h1>
    
    <!-- Orders Table (Responsive on mobile) -->
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {% for order in orders %}
          <tr>
            <td>#{{ order.id }}</td>
            <td>{{ order.customer_name }}</td>
            <td>${{ order.total_price }}</td>
            <td>
              <!-- Status Badge -->
              {% if order.status == "Pending" %}
                <span class="badge bg-warning">{{ order.status }}</span>
              {% elif order.status == "Confirmed" %}
                <span class="badge bg-info">{{ order.status }}</span>
              {% else %}
                <span class="badge bg-success">{{ order.status }}</span>
              {% endif %}
            </td>
            <td>{{ order.created_at }}</td>
            <td>
              <a href="/orders/{{ order.id }}" class="btn btn-sm btn-outline-primary">View</a>
              <a href="/orders/{{ order.id }}/edit" class="btn btn-sm btn-warning">Edit</a>
            </td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </div>
</section>
```

#### Step 2.6: Add Custom CSS (Optional Enhancement)

Create `public/css/style.css` for custom branding:

```css
/* Custom Color Theme */
:root {
  --primary-color: #7c5cff;
  --secondary-color: #00c2a8;
  --accent-color: #ff7a59;
}

body {
  font-family: 'Poppins', 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.navbar {
  background: linear-gradient(90deg, #2c3e50, #34495e);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card {
  border: none;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

.btn-primary {
  background: var(--primary-color);
  border: none;
}

.btn-primary:hover {
  background: #6b4dd6;
  transform: scale(1.05);
}
```

#### Step 2.7: Test Responsiveness

Use your browser's DevTools to test:
1. **Mobile (375px):** Navbar collapses, cards stack vertically
2. **Tablet (768px):** 2 columns for cards
3. **Desktop (1200px+):** 4 columns for cards

**Checklist for Phase 2:**
- [ ] Bootstrap CDN linked in all views
- [ ] Navbar created with links, search bar, cart button
- [ ] Menu items displayed in a responsive card grid (4-3-2-1 columns)
- [ ] Create/Edit forms styled with Bootstrap (form-control, form-select, etc.)
- [ ] Orders table styled and responsive
- [ ] Cards have hover effects (scale, shadow)
- [ ] Theme toggle (CSS dark mode) implemented
- [ ] Tested responsiveness on mobile, tablet, desktop
- [ ] Commit your code with message: "Phase 2: Bootstrap 5 integration and responsive design"

---

## Phase 3: REST Principles & Method Selection
**Duration:** 1 Week | **Objective:** Implement HTTP methods correctly and ensure API design follows REST constraints

### Learning Objectives
- Understand the **6 REST architectural constraints:** Client-Server, Statelessness, Uniform Interface, Caching, Layered System, Code-on-Demand
- Map UI actions to correct **HTTP methods:** GET, POST, PUT, DELETE
- Implement **statelessness** through authentication tokens or sessions
- Identify and implement **idempotent operations**
- Document your API design rationale

### Core REST Concepts Review

#### HTTP Methods
| Method | Purpose | Idempotent | Safe | Use Case |
|--------|---------|-----------|------|----------|
| **GET** | Retrieve a resource | ✅ Yes | ✅ Yes | Fetch menu items, view orders |
| **POST** | Create a new resource | ❌ No | ❌ No | Place an order, add menu item |
| **PUT** | Replace an entire resource | ✅ Yes | ❌ No | Update menu item (full replacement) |
| **PATCH** | Partially update a resource | ❌ No | ❌ No | Update order status only |
| **DELETE** | Remove a resource | ✅ Yes | ❌ No | Remove menu item, cancel order |

**Idempotency:** An operation is **idempotent** if calling it multiple times produces the same result as calling it once. Example: `PUT /menuitems/5` is idempotent because updating the same item with the same data twice results in the same state.

#### Statelessness
REST services must be **stateless**: each request contains all information needed to process it. The server doesn't store client context.

**Stateful (❌ Not REST):**
```
Client: "Log me in" → Server stores session in memory
Client: "Get my orders" → Server looks up session from memory
```

**Stateless (✅ REST-compliant):**
```
Client: "Log me in with credentials" → Server returns JWT token
Client: "Get my orders with JWT token in header" → Server validates token, serves orders
```

### Detailed Instructions

#### Step 3.1: Map UI Actions to HTTP Verbs

Create a table documenting all your application's endpoints:

| Action | HTTP Method | Endpoint | Response |
|--------|------------|----------|----------|
| View all menu items | GET | `/menuitems` | HTML list or JSON |
| View single menu item | GET | `/menuitems/:id` | HTML detail or JSON |
| Create menu item form | GET | `/menuitems/create` | HTML form |
| Submit new menu item | POST | `/menuitems` | Redirect or JSON |
| Edit menu item form | GET | `/menuitems/:id/edit` | HTML form |
| Update menu item | PUT | `/menuitems/:id` | HTML redirect or JSON |
| Delete menu item | DELETE | `/menuitems/:id` | 204 No Content or JSON |
| View all orders | GET | `/orders` | HTML list or JSON |
| View single order | GET | `/orders/:id` | HTML detail or JSON |
| Checkout form | GET | `/orders/create` | HTML form |
| Submit order | POST | `/orders` | Redirect or JSON |
| Update order status | PUT | `/orders/:id` | HTML redirect or JSON |
| Delete order | DELETE | `/orders/:id` | 204 No Content or JSON |

#### Step 3.2: Implement HTTP Methods in Routes

Update your routes to use correct HTTP verbs:

**Express.js Example:**
```javascript
// GET - Retrieve all menu items
router.get('/menuitems', (req, res) => {
  // Fetch from database
  res.render('menuitems/index', { items });
});

// GET - Show single menu item
router.get('/menuitems/:id', (req, res) => {
  const item = db.MenuItem.findById(req.params.id);
  res.render('menuitems/show', { item });
});

// GET - Show create form
router.get('/menuitems/create', (req, res) => {
  res.render('menuitems/create');
});

// POST - Create a new menu item
router.post('/menuitems', (req, res) => {
  const newItem = db.MenuItem.create(req.body);
  res.redirect(`/menuitems/${newItem.id}`);
});

// GET - Show edit form
router.get('/menuitems/:id/edit', (req, res) => {
  const item = db.MenuItem.findById(req.params.id);
  res.render('menuitems/edit', { item });
});

// PUT - Update a menu item
router.put('/menuitems/:id', (req, res) => {
  db.MenuItem.update(req.params.id, req.body);
  res.redirect(`/menuitems/${req.params.id}`);
});

// DELETE - Remove a menu item
router.delete('/menuitems/:id', (req, res) => {
  db.MenuItem.delete(req.params.id);
  res.sendStatus(204); // or redirect
});
```

**Django Example:**
```python
# urls.py
urlpatterns = [
    path('menuitems/', views.menuitem_list, name='list'),  # GET
    path('menuitems/create/', views.menuitem_create, name='create'),  # GET & POST
    path('menuitems/<int:id>/', views.menuitem_detail, name='detail'),  # GET
    path('menuitems/<int:id>/edit/', views.menuitem_edit, name='edit'),  # GET & PUT
    path('menuitems/<int:id>/delete/', views.menuitem_delete, name='delete'),  # DELETE
]

# views.py
def menuitem_list(request):
    # GET handler
    items = MenuItem.objects.all()
    return render(request, 'menuitems/list.html', {'items': items})

def menuitem_create(request):
    if request.method == 'GET':
        return render(request, 'menuitems/create.html')
    elif request.method == 'POST':
        item = MenuItem.objects.create(**request.POST)
        return redirect('detail', id=item.id)
```

#### Step 3.3: Enforce Statelessness with Authentication

Implement a **stateless authentication** mechanism:

**Option A: Session-based (semi-stateless)**
```javascript
// Login via POST
router.post('/login', (req, res) => {
  const user = db.User.findByEmail(req.body.email);
  if (user && user.password === hash(req.body.password)) {
    req.session.userId = user.id; // Store session ID (minimal state)
    res.redirect('/orders');
  }
});

// Protected route checks session
router.get('/orders', (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }
  const orders = db.Order.findByUserId(req.session.userId);
  res.render('orders/list', { orders });
});
```

**Option B: JWT Tokens (fully stateless) — Recommended**
```javascript
const jwt = require('jsonwebtoken');

// Login endpoint returns token
router.post('/login', (req, res) => {
  const user = db.User.findByEmail(req.body.email);
  if (user && user.password === hash(req.body.password)) {
    const token = jwt.sign({ userId: user.id }, 'SECRET_KEY', { expiresIn: '24h' });
    res.json({ token }); // Client stores token
  }
});

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route
router.get('/orders', authMiddleware, (req, res) => {
  const orders = db.Order.findByUserId(req.userId);
  res.json({ orders }); // Stateless: all info in request headers
});
```

**Key Concept:** With JWT, the server doesn't maintain session state. The client includes the token in every request, and the server validates it. The token contains all necessary information.

#### Step 3.4: Document Idempotent Operations

Create a document (`REST_API_DOCUMENTATION.md`) that lists which operations are idempotent:

```markdown
### Idempotent Operations (Safe to Retry)

#### PUT /menuitems/:id
- **Idempotent:** ✅ YES
- **Reason:** Updating the same menu item with the same data multiple times produces the same result.
- **Example:** Calling PUT /menuitems/5 with {name: "Pizza", price: 9.99} 10 times results in the same state.

#### DELETE /menuitems/:id
- **Idempotent:** ✅ YES
- **Reason:** Deleting an already-deleted resource returns 404, which is idempotent (same state: deleted).

#### POST /menuitems
- **Idempotent:** ❌ NO
- **Reason:** Each POST creates a NEW resource. Calling it 3 times creates 3 different menu items.
- **Mitigation:** Use idempotency keys or unique constraints (e.g., prevent duplicate items with same name).

#### GET /menuitems
- **Idempotent:** ✅ YES
- **Reason:** GET never modifies state. Calling it 100 times returns the same data.

#### PATCH /orders/:id
- **Idempotent:** ❌ NO (by definition)
- **Reason:** PATCH applies partial updates. Calling it twice with {status: "delivered"} might trigger different workflows.
- **Example:** First PATCH triggers email notification; second PATCH might not.
```

#### Step 3.5: Test REST Compliance

Use Postman or curl to test your endpoints:

```bash
# Test GET (safe, idempotent)
curl -X GET http://localhost:3000/menuitems

# Test POST (creates new resource, not idempotent)
curl -X POST http://localhost:3000/menuitems \
  -H "Content-Type: application/json" \
  -d '{"name":"Pizza","price":9.99,"category":"Pizza"}'

# Test PUT (replaces resource, idempotent)
curl -X PUT http://localhost:3000/menuitems/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Pizza","price":10.99}'

# Test DELETE (idempotent)
curl -X DELETE http://localhost:3000/menuitems/1
```

**Checklist for Phase 3:**
- [ ] All CRUD operations use correct HTTP methods (GET, POST, PUT, DELETE)
- [ ] Forms use POST for creation, PUT for updates
- [ ] DELETE endpoints properly remove resources
- [ ] Authentication implemented (JWT tokens or sessions)
- [ ] Statelessness verified: requests are independent
- [ ] Idempotent operations documented
- [ ] Created `REST_API_DOCUMENTATION.md` with idempotency analysis
- [ ] Tested endpoints with curl or Postman
- [ ] Commit your code with message: "Phase 3: REST principles and HTTP method implementation"

---

## Phase 4: Resource & URI Design
**Duration:** 1 Week | **Objective:** Design clean, semantic URIs following REST conventions

### Learning Objectives
- Understand **URI design best practices:** plural nouns, no verbs, hierarchical structure
- Design **resource-oriented APIs** instead of action-oriented
- Implement **nested resources** (e.g., /orders/:id/items)
- Document all endpoints in a **REST API specification**

### Detailed Instructions

#### Step 4.1: URI Design Rules

**Rule 1: Use Plural Nouns (Not Verbs)**

❌ **Bad (action-oriented):**
```
GET /getMenuItems
POST /createOrder
PUT /updateMenuItem/5
DELETE /removeOrder/3
```

✅ **Good (resource-oriented):**
```
GET /menuitems
POST /orders
PUT /menuitems/5
DELETE /orders/3
```

**Why?** Resources are things (nouns), not actions (verbs). HTTP methods define the action.

**Rule 2: Use Hierarchical Structure for Nested Resources**

❌ **Bad:**
```
GET /orders/5/items
GET /orderItems?orderId=5
```

✅ **Good:**
```
GET /orders/5/items        # All items in order 5
GET /orders/5/items/10     # Specific item (ID 10) in order 5
POST /orders/5/items       # Add item to order 5
PUT /orders/5/items/10     # Update item in order 5
DELETE /orders/5/items/10  # Remove item from order 5
```

**Why?** Hierarchy shows relationships: "Give me items that belong to order 5."

**Rule 3: Use Identifiers, Not Aliases**

❌ **Bad:**
```
GET /menuitems/popular
GET /orders/by-customer/john
```

✅ **Good:**
```
GET /menuitems?category=popular
GET /orders?customerId=7
GET /orders/5
```

**Exception:** Filtering parameters (query strings) are acceptable.

**Rule 4: Use Lowercase and Hyphens for Multi-word Resources**

❌ **Bad:**
```
GET /MenuItems
GET /menu_items
GET /specialOffers
```

✅ **Good:**
```
GET /menu-items
GET /special-offers
```

**Why?** Consistency and convention. (Though `/menuitems` single word is also acceptable.)

#### Step 4.2: Design Your Complete API Endpoint List

Create a comprehensive **REST API Specification** document. Here's a template:

```markdown
# Online Food Ordering System — REST API Specification

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Menu Items Resource

### GET /menuitems
**Description:** Retrieve all menu items
**Method:** GET
**Auth Required:** No
**Query Parameters:**
  - `category` (optional): Filter by category (pizza, burger, etc.)
  - `available` (optional): Filter by availability (true/false)
  - `limit` (optional): Number of items to return (default: 20)
  - `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "description": "...",
      "price": 9.99,
      "category": "pizza",
      "available": true,
      "created_at": "2026-02-25T10:00:00Z"
    }
  ],
  "total": 50,
  "offset": 0,
  "limit": 20
}
```

---

### GET /menuitems/:id
**Description:** Retrieve a single menu item by ID
**Method:** GET
**Auth Required:** No
**URL Parameters:**
  - `id` (required): Menu item ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Margherita Pizza",
    "description": "Classic cheese and tomato",
    "price": 9.99,
    "category": "pizza",
    "available": true,
    "created_at": "2026-02-25T10:00:00Z",
    "updated_at": "2026-02-25T10:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Menu item not found"
}
```

---

### POST /menuitems
**Description:** Create a new menu item (Admin only)
**Method:** POST
**Auth Required:** Yes (Admin role)
**Request Body:**
```json
{
  "name": "New Pizza",
  "description": "Delicious pizza",
  "price": 10.99,
  "category": "pizza",
  "available": true,
  "image_url": "https://example.com/image.jpg"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 51,
    "name": "New Pizza",
    "description": "Delicious pizza",
    "price": 10.99,
    "category": "pizza",
    "available": true,
    "created_at": "2026-02-26T12:00:00Z",
    "updated_at": "2026-02-26T12:00:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required field: name"
}
```

---

### PUT /menuitems/:id
**Description:** Update an entire menu item (Admin only)
**Method:** PUT
**Auth Required:** Yes (Admin role)
**URL Parameters:**
  - `id` (required): Menu item ID
**Request Body:** (All fields required)
```json
{
  "name": "Updated Pizza",
  "description": "Updated description",
  "price": 11.99,
  "category": "pizza",
  "available": true,
  "image_url": "https://example.com/image.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Pizza",
    ...
  }
}
```

**Idempotency:** ✅ YES — Calling PUT multiple times with the same data produces the same result.

---

### DELETE /menuitems/:id
**Description:** Delete a menu item (Admin only)
**Method:** DELETE
**Auth Required:** Yes (Admin role)
**URL Parameters:**
  - `id` (required): Menu item ID

**Response (204 No Content):**
```
(No body, just HTTP 204 status)
```

**Idempotency:** ✅ YES — Deleting twice results in the same state (deleted).

---

## Orders Resource

### GET /orders
**Description:** Retrieve all orders (customer gets their own, admin gets all)
**Method:** GET
**Auth Required:** Yes
**Query Parameters:**
  - `status` (optional): Filter by status (pending, confirmed, delivered, cancelled)
  - `customerId` (optional, Admin only): Filter by customer
  - `limit` (optional): Number of items to return
  - `offset` (optional): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customerId": 5,
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "items": [],
      "totalPrice": 29.97,
      "status": "confirmed",
      "created_at": "2026-02-25T15:30:00Z",
      "updated_at": "2026-02-25T15:30:00Z"
    }
  ]
}
```

---

### GET /orders/:id
**Description:** Retrieve a single order with all items
**Method:** GET
**Auth Required:** Yes
**URL Parameters:**
  - `id` (required): Order ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerId": 5,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "items": [
      {
        "itemId": 1,
        "name": "Margherita Pizza",
        "quantity": 2,
        "pricePerUnit": 9.99,
        "subtotal": 19.98
      }
    ],
    "totalPrice": 29.97,
    "status": "confirmed",
    "created_at": "2026-02-25T15:30:00Z"
  }
}
```

---

### POST /orders
**Description:** Create a new order (Checkout)
**Method:** POST
**Auth Required:** Yes
**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerAddress": "123 Main St",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2
    },
    {
      "menuItemId": 5,
      "quantity": 1
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "customerId": 5,
    "customerName": "John Doe",
    "items": [...],
    "totalPrice": 29.97,
    "status": "pending",
    "created_at": "2026-02-26T10:00:00Z"
  }
}
```

**Idempotency:** ❌ NO — Each POST creates a new order.

---

### PUT /orders/:id
**Description:** Update order status (Admin only)
**Method:** PUT
**Auth Required:** Yes (Admin role)
**URL Parameters:**
  - `id` (required): Order ID
**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "confirmed",
    ...
  }
}
```

**Idempotency:** ✅ YES — Updating to the same status multiple times is safe.

---

### DELETE /orders/:id
**Description:** Cancel/delete an order (Admin only)
**Method:** DELETE
**Auth Required:** Yes (Admin role)
**URL Parameters:**
  - `id` (required): Order ID

**Response (204 No Content):**
```
(No body)
```

---

## Nested Resources: Order Items

### GET /orders/:id/items
**Description:** Retrieve all items in an order
**Method:** GET
**Auth Required:** Yes
**URL Parameters:**
  - `id` (required): Order ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "itemId": 1,
      "name": "Margherita Pizza",
      "quantity": 2,
      "pricePerUnit": 9.99,
      "subtotal": 19.98
    }
  ]
}
```

---

### POST /orders/:id/items
**Description:** Add an item to an order (if order is still pending)
**Method:** POST
**Auth Required:** Yes
**URL Parameters:**
  - `id` (required): Order ID
**Request Body:**
```json
{
  "menuItemId": 3,
  "quantity": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE /orders/:id/items/:itemId
**Description:** Remove an item from an order
**Method:** DELETE
**Auth Required:** Yes
**URL Parameters:**
  - `id` (required): Order ID
  - `itemId` (required): Menu Item ID in the order

**Response (204 No Content):**

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**
- `200 OK` — Request succeeded
- `201 Created` — Resource created successfully
- `204 No Content` — Request succeeded, no body to return
- `400 Bad Request` — Invalid request data
- `401 Unauthorized` — Missing or invalid authentication
- `403 Forbidden` — Authenticated but lack permission
- `404 Not Found` — Resource doesn't exist
- `500 Internal Server Error` — Server error
```

#### Step 4.3: Implement Versioning (Optional)

Add API versioning to support future changes:

```
/api/v1/menuitems  — Version 1 (current)
/api/v2/menuitems  — Version 2 (future incompatible changes)
```

This allows you to evolve the API without breaking existing clients.

#### Step 4.4: Add Base Path/Prefix

Organize your routes with an `/api` prefix:

**Express.js Example:**
```javascript
const apiRoutes = express.Router();

apiRoutes.use('/menuitems', require('./routes/menuitems'));
apiRoutes.use('/orders', require('./routes/orders'));

app.use('/api/v1', apiRoutes);
```

This results in clean endpoints like `/api/v1/menuitems`, `/api/v1/orders`.

#### Step 4.5: Document Your Design Decisions

Create a `API_DESIGN_RATIONALE.md` document explaining:

```markdown
# API Design Rationale

## URIs: Why Plural Nouns?
- **Chosen:** `/menuitems` (plural) instead of `/menuitem` (singular)
- **Reason:** RESTful convention. Resources are treated as collections.
- **Consistency:** All endpoints use plural form for uniformity.

## Hierarchical Structure: Why Nested Resources?
- **Chosen:** `/orders/:id/items` instead of `/orderItems?orderId=5`
- **Reason:** Clearly shows resource relationships. An "item" belongs to an "order."
- **Navigation:** Easier to understand and navigate the API structure.

## Method Selection: Why PUT and DELETE?
- **GET /menuitems/:id** — Read-safe, idempotent
- **POST /menuitems** — Creates a new resource (not idempotent)
- **PUT /menuitems/:id** — Full replacement, idempotent (safe to retry)
- **DELETE /menuitems/:id** — Remove, idempotent (deleting twice = same state)

## Authentication Strategy: JWT Tokens
- **Chosen:** Stateless JWT tokens instead of server-side sessions
- **Reason:** Scalability. Server doesn't store state.
- **Implementation:** Client includes token in `Authorization: Bearer <token>` header.
- **Benefit:** Each request is independent; can scale horizontally.

## Error Handling: Consistent JSON Responses
- **Chosen:** All responses (success/error) return JSON with `success` field
- **Reason:** Predictable client-side handling
- **Example:** 
  ```json
  { "success": false, "error": "Invalid email", "code": "INVALID_INPUT" }
  ```

## Pagination: Offset/Limit Strategy
- **Chosen:** Query parameters `?offset=0&limit=20`
- **Reason:** Time-tested, client-friendly pagination
- **Alternative Considered:** Cursor-based pagination (better for large datasets)
```

**Checklist for Phase 4:**
- [ ] All URIs use plural nouns (menuitems, orders, not menuitem, order)
- [ ] No action verbs in URIs (no /getMenuItems, /createOrder)
- [ ] Hierarchical structure for nested resources (/orders/:id/items)
- [ ] Complete REST API specification document created
- [ ] API versioning implemented (/api/v1)
- [ ] All endpoints documented with request/response examples
- [ ] Idempotency clearly identified for each endpoint
- [ ] API design rationale document created
- [ ] Tested all endpoints with curl or Postman
- [ ] Commit your code with message: "Phase 4: RESTful URI design and API specification"

---

## Final Project Submission

### Deliverables Checklist
Students must submit:

1. **Source Code Repository**
   - Complete, functional codebase
   - `.gitignore` file (exclude node_modules, __pycache__, etc.)
   - README.md with setup and run instructions

2. **Phase 1 Artifacts**
   - Models (MenuItem.js, Order.js, etc.)
   - CRUD routes (menuitems routes, orders routes)
   - Plain-HTML scaffolded views (8 templates minimum)

3. **Phase 2 Artifacts**
   - Bootstrap-integrated views
   - Responsive grid layout (tested on mobile, tablet, desktop)
   - Styled forms and buttons
   - CSS file with custom theme

4. **Phase 3 Artifacts**
   - All routes use correct HTTP methods (GET, POST, PUT, DELETE)
   - Authentication system (JWT or sessions)
   - `REST_API_DOCUMENTATION.md` identifying idempotent operations
   - Curl/Postman test results (screenshot or log)

5. **Phase 4 Artifacts**
   - Complete `REST_API_SPECIFICATION.md` document
   - List of all endpoints with HTTP method, URI, description
   - `API_DESIGN_RATIONALE.md` explaining design decisions
   - Evidence of hierarchical resource structure

6. **Project Documentation**
   - `README.md` with installation and run instructions
   - `SETUP_GUIDE.md` with database setup
   - Screenshots of the application

### Submission Format
- Push code to GitHub (or provided Git repository)
- Tag final submission: `git tag -a v1.0 -m "Final project submission"`
- Include branch name and commit hash in submission form

### How to Run the Project

Students should provide clear instructions:

```markdown
# Online Food Ordering System — Setup & Run

## Prerequisites
- Node.js v16+ (or Python 3.9+, etc.)
- npm or yarn (or pip)
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
   # or: pip install -r requirements.txt
   ```

3. Set up the database:
   ```bash
   npm run db:setup
   # or: python manage.py migrate
   ```

4. Seed demo data:
   ```bash
   npm run db:seed
   ```

## Running the Application

```bash
npm start
# or: nodemon app.js
# or: python manage.py runserver
```

The application will be available at: **http://localhost:3000**

## API Endpoints

All endpoints are documented in `REST_API_SPECIFICATION.md`.

Example:
```bash
# Get all menu items
curl http://localhost:3000/api/v1/menuitems

# Create an order
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"John","customerEmail":"john@example.com",...}'
```

## Testing

Run the test suite:
```bash
npm test
# or: python manage.py test
```
```

---

## Learning Outcomes Summary

Upon completing this project, students will have demonstrated:

✅ **MVC Mastery** — Proper separation of concerns and data modeling
✅ **Frontend Skills** — Bootstrap, responsive design, user experience
✅ **REST Competency** — HTTP methods, statelessness, URI design
✅ **Full-Stack Integration** — Backend API meets frontend seamlessly
✅ **Professional Practices** — Documentation, testing, code organization
✅ **Communication** — API design rationale and technical decision-making

---

## Additional Resources

### Recommended Reading
- [RESTful Web Services by Leonard Richardson & Sam Ruby](https://www.oreilly.com/library/view/restful-web-services/9780596529260/)
- [Bootstrap 5 Official Documentation](https://getbootstrap.com/docs/5.0/)
- [HTTP Methods Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [JWT Authentication Tutorial](https://jwt.io/introduction)

### Tools
- **API Testing:** [Postman](https://www.postman.com/)
- **Database:** [SQLite](https://www.sqlite.org/), [PostgreSQL](https://www.postgresql.org/)
- **Version Control:** [Git & GitHub](https://github.com/)
- **Code Editor:** [VS Code](https://code.visualstudio.com/)

### Example Repositories
- [Express.js + EJS + Sequelize](https://github.com/expressjs/express)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Rails API](https://guides.rubyonrails.org/api_app.html)

---

**End of Lab Manual**

**Questions?** Contact your instructor or visit office hours.
