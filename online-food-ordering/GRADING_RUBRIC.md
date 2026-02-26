# Grading Rubric: Online Food Ordering System

**Course:** Web Development & REST API Design  
**Assignment:** Online Food Ordering System (Full Stack Project)  
**Total Points:** 100 + 5 Bonus

---

## Phase 1: Scaffolding & Models — 20 Points

### Database Models (8 points)

**Full Credit (8/8)**
- MenuItem model complete with: id, name, description, price, category, available, image_url, created_at, updated_at
- Order model complete with: id, customer_name, customer_email, customer_address, total_price, status, created_at, updated_at
- OrderItem junction table properly defined with: id, order_id, menu_item_id, quantity, price_at_time_of_order
- All fields have appropriate data types (string, decimal, boolean, timestamp)
- Primary keys, foreign keys, and constraints properly defined
- Migrations created and successfully applied to database
- Evidence in git history showing scaffold command or model creation

**Partial Credit (4-7/8)**
- Models mostly complete but missing 1-2 fields (2-3 points deduction)
- Missing OrderItem model or improper junction table structure (3 points deduction)
- Models defined but migrations not applied or failed (2 points deduction)
- Data types not quite right but functional (1 point deduction)

**No Credit (0/8)**
- Models missing or non-functional
- No database setup attempted

---

### CRUD Routes & Controllers (7 points)

**Full Credit (7/7)**
- All 13 required routes implemented and tested:
  - MenuItem: index, show, create (form), create (POST), edit (form), update, delete
  - Order: index, show, create (form), create (POST), update, delete
- Routes follow framework conventions (Express, Django, Rails, etc.)
- Controllers/handlers properly retrieve data from models
- All CRUD operations work end-to-end without errors

**Partial Credit (4-6/7)**
- 10-12 routes implemented (1-2 points deduction per missing route)
- Routes implemented but some don't work properly (1-2 points deduction)
- Routes work but not following framework conventions (1 point deduction)

**No Credit (0/7)**
- Routes missing or non-functional

---

### Code Generation & Templates (5 points)

**Full Credit (5/5)**
- Evidence of using framework's scaffold generator (git history, file generation timestamps)
- 8 plain-HTML views generated successfully (no Bootstrap at this phase)
- Views include:
  - menuitems/index, menuitems/show, menuitems/create, menuitems/edit
  - orders/index, orders/show, orders/create, orders/edit
- All views are pure HTML with form elements and tables (no styling)
- All CRUD operations work in browser without errors

**Partial Credit (3-4/5)**
- Templates generated but incomplete (1 point deduction per missing)
- Templates have some styling (should be plain HTML) (1 point deduction)
- Most CRUD operations work but 1-2 have issues (1 point deduction)

**No Credit (0/5)**
- Templates missing or not generated

**Phase 1 Subtotal: ___/20**

---

## Phase 2: Bootstrap Integration — 25 Points

### Bootstrap Integration (5 points)

**Full Credit (5/5)**
- Bootstrap 5 CSS linked via CDN or npm in all pages
- FontAwesome icons properly linked
- All pages utilize Bootstrap classes
- Navbar present and functional on all pages
- No broken styling or overridden Bootstrap defaults

**Partial Credit (3-4/5)**
- Bootstrap linked but not used consistently across pages (1 point deduction)
- FontAwesome missing but not critical (1 point deduction)
- Minimal custom CSS overrides Bootstrap (1 point deduction)

**No Credit (0/5)**
- Bootstrap not linked or not used

---

### Responsive Grid & Layout (10 points)

**Full Credit (10/10)**
- Menu items displayed in responsive cards using Bootstrap grid:
  - 4 columns on large/XL screens (≥1200px)
  - 3 columns on medium/large screens (≥992px)
  - 2 columns on tablets (≥768px)
  - 1 column on mobile (<768px)
- Grid implemented with `col-lg-3 col-md-4 col-sm-6` or equivalent
- Cards include all required elements:
  - Image with proper aspect ratio
  - Title and description
  - Price badge with styling
  - Category badge
  - Action buttons (View, Edit, Delete)
- Card hover effects present (scale, shadow, color change)
- Tested on actual devices or DevTools (evidence provided)
- Gutters/spacing properly applied

**Partial Credit (6-9/10)**
- Grid responsive but breakpoints not quite right (1-2 points deduction)
- Cards missing 1-2 elements (image, badges, buttons) (1-2 points deduction)
- Hover effects missing or minimal (1 point deduction)
- Not tested responsively (1 point deduction)
- Spacing/alignment issues (1 point deduction)

**No Credit (0/10)**
- Grid not responsive or cards not implemented

---

### Navigation & Components (5 points)

**Full Credit (5/5)**
- Sticky navbar with:
  - Logo/brand on left
  - Navigation links (Home, Menu, Orders, Contact) centered or right-aligned
  - Search bar functional (CSS-based filtering or placeholder)
  - Shopping cart button with badge
  - Theme toggle (dark/light mode)
- Navbar collapses to hamburger menu on small screens
- Hamburger menu opens/closes properly
- Footer present on all pages with links/info
- Breadcrumbs or clear navigation path on detail pages

**Partial Credit (3-4/5)**
- Navbar present but missing 1-2 components (1-2 points deduction)
- Hamburger menu not working or missing (1 point deduction)
- Footer missing or minimal (1 point deduction)
- Navigation unclear (1 point deduction)

**No Credit (0/5)**
- No navbar or navigation structure

---

### Forms Styling (3 points)

**Full Credit (3/3)**
- All forms use Bootstrap form classes:
  - `form-control` for text inputs
  - `form-select` for dropdowns
  - `form-check` / `form-check-input` for checkboxes
- Proper spacing and layout:
  - `mb-3` or similar margin classes
  - Labels clearly associated with inputs
  - Related fields grouped logically
- Submit and Cancel buttons styled with Bootstrap button classes
- Form validation messages shown (success/error states)
- Forms responsive on mobile and desktop

**Partial Credit (1-2/3)**
- Forms use some Bootstrap classes but not consistently (1 point deduction)
- Forms functional but styling incomplete (1 point deduction)
- Validation messages missing (1 point deduction)

**No Credit (0/3)**
- Forms not styled or using Bootstrap

---

### Visual Polish (2 points)

**Full Credit (2/2)**
- Consistent color scheme across all pages (primary, secondary, accent colors)
- Typography is readable (font size, line height, contrast)
- Buttons have hover effects (color change, shadow, cursor: pointer)
- Tables use Bootstrap styling (table-striped, table-hover)
- Images load properly and have appropriate sizing
- No "ugly" or broken layouts anywhere

**Partial Credit (1/2)**
- Color scheme inconsistent (0.5 point deduction)
- Typography hard to read (0.5 point deduction)
- Buttons lack hover effects (0.5 point deduction)
- One or two visual inconsistencies (0.5 point deduction)

**No Credit (0/2)**
- Multiple visual issues, poor appearance

**Phase 2 Subtotal: ___/25**

---

## Phase 3: REST Principles & HTTP Methods — 25 Points

### HTTP Method Mapping (10 points)

**Full Credit (10/10)**
- All endpoints use correct HTTP method:
  - GET: all retrieval operations (list, show)
  - POST: all creation operations
  - PUT: all update/replacement operations
  - DELETE: all deletion operations
- No GET requests modify data
- No POST used for updates (PUT used instead)
- Proper HTTP status codes returned:
  - 200 OK for successful GET/PUT
  - 201 Created for successful POST
  - 204 No Content for successful DELETE
  - 404 Not Found for missing resources (tested)
  - 400 Bad Request for invalid input (tested)
- Verified with curl, Postman, or HTTP client

**Partial Credit (6-9/10)**
- 1-2 endpoints use wrong method (1-2 points deduction)
- Status codes mostly correct but 1-2 wrong (1 point deduction)
- Not tested or partially tested (1-2 points deduction)
- GET accidentally modifies state (2 points deduction)

**No Credit (0/10)**
- Multiple endpoints use wrong methods
- Status codes incorrect

---

### Statelessness Implementation (8 points)

**Full Credit (8/8)**
- Authentication implemented (JWT tokens OR secure sessions)
- Login endpoint exists and returns token:
  ```json
  { "token": "eyJhbGciOiJIUzI1NiIs..." }
  ```
- Protected endpoints require and validate token
- Token/session verification middleware applied to protected routes
- Token includes expiration time (exp claim in JWT)
- Each request is independent (no reliance on server-side state)
- No session storage dependency (stateless architecture)
- Clear documentation of how authentication works

**Partial Credit (5-7/8)**
- Authentication implemented but not fully stateless (2 points deduction)
- Token exists but no expiration (1 point deduction)
- Protected routes exist but not all marked (1 point deduction)
- Documentation missing or unclear (1 point deduction)

**No Credit (0/8)**
- No authentication or stateful architecture

---

### Idempotency Documentation (5 points)

**Full Credit (5/5)**
- Created `REST_API_DOCUMENTATION.md` file
- Documented idempotency for each major operation:
  - ✅ Idempotent: GET, PUT, DELETE (with clear explanation)
  - ❌ Not Idempotent: POST, PATCH (with clear explanation)
- Examples from YOUR application:
  - "PUT /menuitems/:id is idempotent because updating with same data = same state"
  - "POST /menuitems is not idempotent because each call creates new item"
  - "DELETE /menuitems/:id is idempotent: deleting twice = same state"
- Minimum 6 endpoint examples documented
- Clear, concise explanations

**Partial Credit (3-4/5)**
- Document exists but incomplete (1-2 points deduction)
- Idempotency mentioned but explanations lacking (1-2 points deduction)
- Few examples or generic examples (1 point deduction)

**No Credit (0/5)**
- No documentation file

---

### Testing & Verification (2 points)

**Full Credit (2/2)**
- Tested all endpoints with curl or Postman
- Postman collection exported OR curl commands provided
- Screenshot or log showing:
  - Successful GET (200)
  - Successful POST (201)
  - Successful PUT (200)
  - Successful DELETE (204 or 200)
- All response data correct and properly formatted

**Partial Credit (1/2)**
- Tested most endpoints but missing 1 (1 point deduction)
- Testing done but incomplete evidence (1 point deduction)

**No Credit (0/2)**
- No testing or verification provided

**Phase 3 Subtotal: ___/25**

---

## Phase 4: Resource & URI Design — 20 Points

### URI Design (8 points)

**Full Credit (8/8)**
- All endpoints use plural nouns (menuitems, orders, customers)
- No action verbs in URIs:
  - ❌ getMenuItems, createOrder, updateMenuItem, deleteOrder
  - ✅ /menuitems, /orders, /customers
- Hierarchical structure for nested resources:
  - ✅ /orders/:id/items (items belong to order)
  - ❌ /orderItems?orderId=5 (not hierarchical)
- Resource IDs not aliases:
  - ❌ /menuitems/popular, /menuitems/bestsellers
  - ✅ /menuitems?category=pizza (filtering OK)
- Lowercase with hyphens or single word (consistent):
  - ✅ /menu-items, /menuitems
  - ❌ /MenuItems, /menu_items (inconsistent)
- Base path includes version (optional but encouraged):
  - ✅ /api/v1/menuitems
  - ✅ /menuitems (acceptable)

**Partial Credit (5-7/8)**
- 1-2 endpoints use action verbs (1-2 points deduction)
- Nesting not quite hierarchical (1 point deduction)
- Inconsistent naming conventions (0.5-1 point deduction)
- No version prefix (0 points — optional)

**No Credit (0/8)**
- Multiple URIs use verbs or poor design

---

### Complete API Specification (7 points)

**Full Credit (7/7)**
- Created `REST_API_SPECIFICATION.md` with comprehensive documentation
- Includes for EACH endpoint (minimum 12):
  - ✅ HTTP method (GET, POST, PUT, DELETE)
  - ✅ Full URI path (/api/v1/menuitems/:id)
  - ✅ Clear description of functionality
  - ✅ Authentication requirement (None, JWT, Admin, etc.)
  - ✅ Query/URL parameters documented with types
  - ✅ Request body example (JSON) if applicable
  - ✅ Response status codes and bodies (200, 201, 400, 404, etc.)
  - ✅ Example request and response in JSON format
- Minimum endpoints documented:
  - GET /menuitems, GET /menuitems/:id
  - POST /menuitems, PUT /menuitems/:id, DELETE /menuitems/:id
  - GET /orders, GET /orders/:id
  - POST /orders, PUT /orders/:id, DELETE /orders/:id
  - GET /orders/:id/items, POST /orders/:id/items
  - Additional endpoints (login, filter, etc.)

**Partial Credit (4-6/7)**
- Specification exists but incomplete (1-3 points deduction):
  - Missing request body examples (1 point)
  - Missing response examples (1 point)
  - Fewer than 10 endpoints documented (1-2 points)
  - Missing parameter documentation (1 point)
- Unclear descriptions (1 point deduction)

**No Credit (0/7)**
- No specification document

---

### Design Rationale Document (5 points)

**Full Credit (5/5)**
- Created `API_DESIGN_RATIONALE.md` file
- Explains EACH major design decision with clear reasoning:
  - **Plural Nouns:** "Follows RESTful convention. Resources are collections."
  - **No Verbs:** "HTTP methods define actions. URIs identify resources."
  - **Hierarchical Structure:** "Shows resource relationships. /orders/:id/items indicates items belong to an order."
  - **HTTP Methods Choice:** "Semantic meaning. PUT is idempotent, safe for updates."
  - **JWT/Sessions:** "Statelessness. Each request is independent, scales horizontally."
  - **Query Parameters for Filters:** "/menuitems?category=pizza retrieves filtered results without changing URI structure."
  - **Status Codes:** "HTTP standards. 201 for POST (resource created), 204 for DELETE (no content), 404 for not found."
- **Framework Choice:** Why Express/Django/Rails chosen
- **Database Design:** Why models designed this way
- **REST Constraints Cited:** References to actual REST constraints (Client-Server, Stateless, Uniform Interface, Caching, Layered, Code-on-Demand)
- Well-written, professional tone

**Partial Credit (3-4/5)**
- Document exists but explanations incomplete (1-2 points deduction)
- Generic or superficial explanations (1-2 points deduction)
- Missing framework/database rationale (1 point deduction)
- No REST constraint references (1 point deduction)

**No Credit (0/5)**
- No rationale document

**Phase 4 Subtotal: ___/20**

---

## Code Quality & Best Practices — 10 Points

### Code Organization (2 points)

**Full Credit (2/2)**
- Clear folder structure:
  - models/ (database models)
  - routes/ or controllers/ (route handlers)
  - views/ (templates/views)
  - public/ (static assets)
  - config/ (configuration)
- Files have logical names (menuitemController.js, order.js, etc.)
- No spaghetti code or jumbled files

**Partial Credit (1/2)**
- Structure mostly clear but missing organization (1 point deduction)
- Some files in wrong folders (0.5 point deduction)

**No Credit (0/2)**
- No organization, all files in root

---

### Naming Conventions (1 point)

**Full Credit (1/1)**
- Variables use camelCase or snake_case (consistent)
- Functions use clear verbs (getMenuItems, createOrder, validateEmail)
- Classes use PascalCase (MenuItem, OrderController)
- Files match their content (menuitemController.js for a controller)

**Partial Credit (0.5/1)**
- Mostly consistent but 1-2 inconsistencies (0.5 point deduction)

**No Credit (0/1)**
- Unclear or inconsistent naming throughout

---

### Comments & Documentation (2 points)

**Full Credit (2/2)**
- Code comments explain non-obvious logic
- Function/method docstrings describe purpose, parameters, return value
- Complex algorithms have explanatory comments
- No over-commented obvious code (e.g., "increment i" for i++)
- README.md includes setup instructions, how to run, API overview

**Partial Credit (1/2)**
- Some comments but not comprehensive (1 point deduction)
- README incomplete (1 point deduction)

**No Credit (0/2)**
- No comments or README

---

### Error Handling (2 points)

**Full Credit (2/2)**
- Try-catch blocks around risky operations (database, network)
- NULL checks before accessing properties
- Graceful error messages (not stack traces to user)
- Validation of user input (name required, email valid, price positive)
- 400/404/500 responses with error details

**Partial Credit (1/2)**
- Some error handling but incomplete (1 point deduction)
- Input validation missing (0.5-1 point deduction)

**No Credit (0/2)**
- Minimal or no error handling; crashes on bad input

---

### Git Workflow (2 points)

**Full Credit (2/2)**
- Minimum 20 commits throughout project
- Commit messages are clear and descriptive:
  - ✅ "Add MenuItem model with schema validation"
  - ❌ "fix stuff" or "update"
- Commits track progression through phases
- No single massive commit with entire project

**Partial Credit (1/2)**
- Fewer than 20 commits (1 point deduction)
- Commit messages unclear or generic (1 point deduction)

**No Credit (0/2)**
- Very few commits or uninformative messages

---

### Security (1 point)

**Full Credit (1/1)**
- No hardcoded credentials in code
- Database passwords, API keys in .env file
- `.env` added to `.gitignore`
- SQL injection prevented (parameterized queries)
- No sensitive data logged

**Partial Credit (0.5/1)**
- Minor issue (0.5 point deduction)

**No Credit (0/1)**
- Hardcoded passwords or API keys in code

**Code Quality Subtotal: ___/10**

---

## Bonus Opportunities — Up to 5 Points

### Advanced Features (Choose 1-2)

**API Versioning** (+2 points)
- Implement `/api/v2` alongside v1
- Backward compatibility with v1
- Clear migration path for clients

**Advanced Authentication** (+2 points)
- OAuth 2.0 or third-party login (Google, GitHub)
- Role-based access control (Admin vs. Customer vs. Guest)
- Permissions tested

**Pagination & Advanced Filtering** (+2 points)
- Full-featured search with multiple fields
- Limit/offset pagination working
- Sort by price, rating, date, etc.

**Unit & Integration Tests** (+3 points)
- Tests for models (validation, relationships)
- Tests for routes (CRUD operations)
- Integration tests for full user workflows
- Minimum 10 tests, 80%+ passing

**Cloud Deployment** (+2 points)
- Deployed to Heroku, AWS, Azure, or similar
- Public URL provided and working
- Database persisted

**Swagger/OpenAPI Documentation** (+2 points)
- Auto-generated API documentation
- Interactive Swagger UI at /api/docs
- Spec file (swagger.json or openapi.yaml)

**Bonus Subtotal: ___/5 (max)**

---

## Overall Scoring

| Component | Points | Earned |
|-----------|--------|--------|
| Phase 1: Scaffolding | 20 | ___/20 |
| Phase 2: Bootstrap | 25 | ___/25 |
| Phase 3: REST Principles | 25 | ___/25 |
| Phase 4: URI Design | 20 | ___/20 |
| Code Quality | 10 | ___/10 |
| **TOTAL** | **100** | **___/100** |
| Bonus (optional) | +5 | ___/5 |
| **FINAL GRADE** | — | **___/105** |

---

## Instructor Notes

### Evaluating Phase 1
- Focus on completeness and functionality, not aesthetics
- Ensure models match assignment specs exactly (MenuItem, Order, OrderItem)
- Verify database has actual data (run seed script, check with SELECT queries)

### Evaluating Phase 2
- Test responsiveness in browser DevTools (mobile, tablet, desktop)
- Check for Bootstrap classes, not custom CSS hacks
- Verify all CRUD operations still work after Bootstrap changes

### Evaluating Phase 3
- Use curl or Postman to verify HTTP methods:
  - ```bash
    curl -X GET http://localhost:3000/api/v1/menuitems
    curl -X POST http://localhost:3000/api/v1/menuitems -H "Content-Type: application/json" -d '...'
    curl -X PUT http://localhost:3000/api/v1/menuitems/1 -H "Content-Type: application/json" -d '...'
    curl -X DELETE http://localhost:3000/api/v1/menuitems/1
    ```
- Check HTTP response codes in browser network tab or Postman
- Verify idempotency: PUT/DELETE the same resource twice, verify same result

### Evaluating Phase 4
- Compare student URIs against RESTful conventions
- Check that specification document is detailed and professional
- Verify rationale explains WHY not just WHAT

### Common Issues to Watch

**Phase 1**
- Models missing key fields
- CRUD routes don't work (POST doesn't create, DELETE doesn't remove)
- No evidence of using scaffold generator

**Phase 2**
- Bootstrap not actually used, just custom CSS
- Grid not responsive (same layout on mobile/desktop)
- No hover effects on cards

**Phase 3**
- POST used for updates (should be PUT)
- No authentication implemented
- Status codes always 200, even for errors

**Phase 4**
- URIs use verbs (/getMenu, /saveOrder)
- No specification document
- Rationale too vague ("we chose REST because it's good")

---

**End of Grading Rubric**
