# Online Food Ordering System

This Express.js application implements a simple online food ordering system with CRUD operations for menu items and orders. It demonstrates MVC architecture, Sequelize ORM, Bootstrap integration, and RESTful routing.

## Features
- MenuItem management (create, read, update, delete) including images, categories and icons
- Order management with multi-item cart and status tracking
- Responsive, animated UI using Bootstrap 5, Animate.css and custom CSS/JS
- Search/filter menu items dynamically
- Client-side cart with real-time updates and modal
- Dark mode toggle with smooth transitions
- SQLite database via Sequelize

## Setup

```bash
npm install
node app.js  # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting Around
- Use the **search bar** in the navbar to filter menu items by name or category as you type.
- Click **Add to Cart** on any item; the cart icon badge will update instantly and animate.
- Open the cart modal (shopping cart icon) to see current selections and proceed to checkout.
- Complete the checkout form with your name; the order is stored with a JSON array of items.
- Toggle **Dark Mode** using the switch; preference is remembered across sessions.

### Sample UI Snippet
```html
<!-- menu card example -->
<div class="col-md-4 mb-3 menu-card" data-name="Margherita Pizza" data-category="Pizza">
	<div class="card h-100">
		<img src="https://via.placeholder.com/300x200?text=Pizza" class="card-img-top">
		<div class="card-body">
			<h5 class="card-title"><i class="fas fa-pizza-slice"></i> Margherita Pizza</h5>
			<p class="card-text">Classic cheese & tomato</p>
			<p class="card-text fw-bold">$8.99</p>
			<button class="btn btn-gradient btn-sm add-to-cart" data-id="1" data-name="Margherita Pizza" data-price="8.99">Add to Cart</button>
		</div>
	</div>
</div>
```

## REST API Endpoints

| Method | URI                  | Description                     | Idempotent? |
|--------|----------------------|---------------------------------|-------------|
| GET    | /menuitems           | List menu items                 | yes         |
| GET    | /menuitems/new       | Show create form                | yes         |
| POST   | /menuitems           | Create item                     | no          |
| GET    | /menuitems/:id       | Show item details               | yes         |
| GET    | /menuitems/:id/edit  | Show edit form                  | yes         |
| PUT    | /menuitems/:id       | Update item                     | yes         |
| DELETE | /menuitems/:id       | Delete item                     | yes         |
| GET    | /orders              | List orders                     | yes         |
| GET    | /orders/new          | Show checkout/cart page         | yes         |
| POST   | /orders              | Create order (items JSON)       | no          |
| GET    | /orders/:id          | Show order details              | yes         |
| GET    | /orders/:id/edit     | Show order edit form            | yes         |
| PUT    | /orders/:id          | Update order (status/name)      | yes         |
| DELETE | /orders/:id          | Delete order                    | yes         |

## Notes
- The application is stateless; authentication tokens would be passed with each request if implemented.
- URIs use plural nouns and hierarchical association via `MenuItemId`.

### REST Principles
- All state needed by the server is carried in each request. No session data is stored server-side; in a production version, an Authorization header containing a token would accompany each API call.
- `PUT` and `DELETE` routes are idempotent: calling them multiple times has the same effect after the first execution. `GET` routes are naturally safe/idempotent. `POST /orders` and `POST /menuitems` create new resources and are therefore non-idempotent.

Feel free to extend with authentication, categories, or search!
