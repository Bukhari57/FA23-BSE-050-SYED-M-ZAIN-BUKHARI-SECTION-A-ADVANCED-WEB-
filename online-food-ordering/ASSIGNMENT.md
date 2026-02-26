# Assignment: Online Food Ordering System
## Complete Submission Requirements & Grading Criteria

---

## Assignment Overview

**Title:** Build a RESTful Online Food Ordering Web Application

**Objective:** Implement a full-stack web application demonstrating MVC architecture, Bootstrap integration, REST principles, and semantic URI design.

**Total Points:** 100

**Submission Deadline:** End of Week 4

---

## Assignment Requirements by Phase

### Phase 1: Scaffolding & Models (20 Points)

**Objective:** Create the data foundation and auto-generate CRUD templates.

#### Requirements

1. **Database Models (8 points)**
   - [ ] `MenuItem` model with fields: id, name, description, price, category, available, image_url, timestamps
   - [ ] `Order` model with fields: id, customer_name, customer_email, customer_address, total_price, status, timestamps
   - [ ] `OrderItem` junction model linking Orders to MenuItems with quantity and price_at_order_time
   - [ ] All models include proper data types and constraints (required fields, unique indexes, etc.)
   - [ ] Database migrations created and applied successfully

2. **CRUD Routes & Controllers (7 points)**
   - [ ] MenuItem - List (GET /menuitems)
   - [ ] MenuItem - Show (GET /menuitems/:id)
   - [ ] MenuItem - Create Form (GET /menuitems/create)
   - [ ] MenuItem - Create Action (POST /menuitems)
   - [ ] MenuItem - Edit Form (GET /menuitems/:id/edit)
   - [ ] MenuItem - Update (PUT /menuitems/:id)
   - [ ] MenuItem - Delete (DELETE /menuitems/:id)
   - [ ] Order - List (GET /orders)
   - [ ] Order - Show (GET /orders/:id)
   - [ ] Order - Create Form (GET /orders/create)
   - [ ] Order - Create Action (POST /orders)
   - [ ] Order - Edit (PUT /orders/:id)
   - [ ] Order - Delete (DELETE /orders/:id)
   - All routes tested and functional

3. **Code Generation & Templates (5 points)**
   - [ ] Used framework's scaffold generator (or equivalent) — evidence in git history
   - [ ] 8 plain-HTML views auto-generated (create, read, update, delete for MenuItems & Orders)
   - [ ] Views are unstyled (plain HTML only at this phase)
   - [ ] All CRUD operations work end-to-end (can add, view, edit, delete items)

**Submission:** Code pushed to GitHub with commit message `"Phase 1: Scaffolded MVC models and CRUD views"`

---

### Phase 2: Bootstrap Integration (25 Points)

**Objective:** Transform plain HTML into a responsive, professional interface.

#### Requirements

1. **Bootstrap Integration (5 points)**
   - [ ] Bootstrap 5 CDN linked in base template (or imported via npm)
   - [ ] FontAwesome icons included
   - [ ] No custom CSS that breaks Bootstrap (minimal custom CSS)
   - [ ] All pages use Bootstrap classes
   - [ ] Navbar present on all pages

2. **Responsive Grid & Layout (10 points)**
   - [ ] 12-column grid system implemented correctly
   - [ ] Menu items displayed in responsive cards:
     - 4 columns on large screens (≥1200px)
     - 3 columns on medium screens (≥992px)
     - 2 columns on tablets (≥768px)
     - 1 column on mobile (<768px)
   - [ ] Cards include image, title, description, price, category, action buttons
   - [ ] Each card responds to hover (scale, shadow, color change)
   - [ ] Layout tested and responsive on mobile, tablet, desktop

3. **Navigation & Components (5 points)**
   - [ ] Sticky navbar with: logo, nav links, search bar, cart button, theme toggle
   - [ ] Navbar collapses to hamburger menu on small screens
   - [ ] Dropdown menus work (Bootstrap dropdowns or Bootstrap-compatible)
   - [ ] Footer present on all pages
   - [ ] Breadcrumbs or clear navigation path visible

4. **Forms Styling (3 points)**
   - [ ] Create/Edit forms styled with Bootstrap (form-control, form-select, form-check)
   - [ ] Forms have proper spacing (margin-bottom, padding)
   - [ ] Submit buttons styled with Bootstrap button classes
   - [ ] Form validation messages displayed (success, error states)

5. **Visual Polish (2 points)**
   - [ ] Consistent color scheme across all pages
   - [ ] Typography is readable (font sizes, line heights)
   - [ ] Buttons have hover effects (color, shadow, cursor)
   - [ ] Tables (orders list) are styled with Bootstrap (table-striped, table-hover, etc.)

**Submission:** Code pushed with commit message `"Phase 2: Bootstrap 5 integration and responsive design"`

---

### Phase 3: REST Principles & HTTP Methods (25 Points)

**Objective:** Design and implement RESTful API with correct HTTP method usage and statelessness.

#### Requirements

1. **HTTP Method Mapping (10 points)**
   - [ ] GET used for retrieve operations (list, show)
   - [ ] POST used for create operations
   - [ ] PUT used for full resource replacement (update)
   - [ ] DELETE used for removal
   - [ ] No GET requests modify data
   - [ ] No POST used for updates (use PUT)
   - [ ] Proper HTTP status codes returned:
     - 200 OK for successful GET/PUT
     - 201 Created for successful POST
     - 204 No Content for successful DELETE
     - 404 Not Found for missing resources
     - 400 Bad Request for invalid input

2. **Statelessness Implementation (8 points)**
   - [ ] Authentication via JWT tokens OR secure sessions (not relying on client's stored identity)
   - [ ] Each request contains sufficient information to process it independently
   - [ ] No application state stored on server per client
   - [ ] Token/session can be validated without additional context
   - [ ] Login endpoint returns token: `{ token: "eyJhbGc..." }`
   - [ ] Protected endpoints verify token before processing
   - [ ] Token includes expiration time
   - [ ] Middleware for authentication applied to protected routes

3. **Idempotency Documentation (5 points)**
   - [ ] Created `REST_API_DOCUMENTATION.md` file
   - [ ] Documented which operations are idempotent (GET, PUT, DELETE)
   - [ ] Documented which operations are NOT idempotent (POST, PATCH)
   - [ ] Explained reasoning for each:
     - Example: "PUT /menuitems/:id is idempotent because updating with same data = same state"
     - Example: "POST /menuitems is not idempotent because each call creates new item"
   - [ ] Listed specific endpoint examples from your application

4. **Testing & Verification (2 points)**
   - [ ] Tested all endpoints with curl or Postman
   - [ ] Export Postman collection OR provide curl command examples
   - [ ] Screenshot or log showing successful GET, POST, PUT, DELETE
   - [ ] Verified HTTP response codes match specification

**Submission:** Code pushed with commit message `"Phase 3: REST principles and HTTP method implementation"`

---

### Phase 4: Resource & URI Design (20 Points)

**Objective:** Design semantic, hierarchical URIs following REST conventions.

#### Requirements

1. **URI Design (8 points)**
   - [ ] All endpoints use plural nouns:
     - ✅ `/menuitems`, `/orders`, `/customers`
     - ❌ No `/getMenu`, `/createOrder`, `/menuitem`
   - [ ] No action verbs in URIs
   - [ ] Hierarchical structure for nested resources:
     - `/orders/:id/items` (items belong to an order)
     - NOT `/orderItems?orderId=5`
   - [ ] Resource identifiers used instead of aliases:
     - `/menuitems/5` (correct)
     - NOT `/menuitems/popular` or `/menuitems/bestsellers`
   - [ ] Lowercase and hyphens for multi-word (or single word):
     - `/menu-items` or `/menuitems` (consistent)
     - NOT `/MenuItems` or `/menu_items`
   - [ ] Base path includes version:
     - `/api/v1/menuitems` (optional but encouraged)

2. **Complete API Specification (7 points)**
   - [ ] Created `REST_API_SPECIFICATION.md` file
   - [ ] Includes for EACH endpoint:
     - HTTP method
     - Full URI
     - Description
     - Required authentication
     - Query/URL parameters
     - Request body (if applicable)
     - Response format (200, 201, 400, 404, etc.)
   - [ ] Minimum 12 endpoints documented:
     - GET /menuitems
     - GET /menuitems/:id
     - POST /menuitems
     - PUT /menuitems/:id
     - DELETE /menuitems/:id
     - GET /orders
     - GET /orders/:id
     - POST /orders
     - PUT /orders/:id
     - DELETE /orders/:id
     - GET /orders/:id/items
     - POST /orders/:id/items
   - [ ] Example request and response bodies shown in JSON

3. **Design Rationale Document (5 points)**
   - [ ] Created `API_DESIGN_RATIONALE.md` file
   - [ ] Explain EACH major design decision:
     - **Why plural nouns?** ("Convention. Resources are collections.")
     - **Why hierarchical URIs?** ("Shows relationships. Items belong to orders.")
     - **Why these HTTP methods?** ("Semantic meaning. PUT is idempotent.")
     - **Why JWT/sessions?** ("Statelessness. Each request is independent.")
     - **Why query parameters for filters?** ("/menuitems?category=pizza filters results.")
   - [ ] Justify framework choice
   - [ ] Justify database design
   - [ ] Cite REST principle constraints you followed (Client-Server, Statelessness, Uniform Interface, etc.)

**Submission:** Code pushed with commit message `"Phase 4: RESTful URI design and API specification"`

---

## Code Quality & Best Practices (10 Points)

- [ ] **Code Organization:** Proper folder structure (models/, routes/, views/, controllers/)
- [ ] **Naming Conventions:** Variables, functions, files use clear, consistent names
- [ ] **Comments & Documentation:** Code commented where logic is non-obvious; functions have docstrings
- [ ] **Error Handling:** Try-catch blocks, NULL checks, graceful error messages
- [ ] **Git Workflow:** Regular commits with clear, descriptive messages; minimum 20 commits
- [ ] **README.md:** Clear setup instructions, how to run, API overview
- [ ] **No Hard-Coding:** Database credentials, API keys in .env or config files
- [ ] **DRY Principle:** Code not duplicated; reusable components/functions
- [ ] **Security:** Input validation, no SQL injection, parameterized queries

**Deductions:**
- Missing error handling: -2 points
- Poor commit messages: -2 points
- Hardcoded secrets: -3 points
- No README or unclear setup: -3 points

---

## Bonus Opportunities (Up to 5 Extra Points)

- [ ] **API Versioning:** Implement `/api/v2` alongside v1 with backward compatibility (+2 points)
- [ ] **Advanced Authentication:** OAuth 2.0 or role-based access control (Admin vs. Customer) (+2 points)
- [ ] **Pagination & Filtering:** Full-featured search/filter with limit/offset (+2 points)
- [ ] **Tests:** Unit tests for models, integration tests for API endpoints (+3 points)
- [ ] **Deployment:** Deploy to cloud (Heroku, AWS, Azure) with public URL (+2 points)
- [ ] **API Documentation:** Swagger/OpenAPI spec generated and interactive (+2 points)

---

## Grading Rubric Summary

| Criterion | Points | Earned |
|-----------|--------|--------|
| Phase 1: Scaffolding & Models | 20 | ___ |
| Phase 2: Bootstrap Integration | 25 | ___ |
| Phase 3: REST Principles | 25 | ___ |
| Phase 4: URI Design | 20 | ___ |
| Code Quality & Best Practices | 10 | ___ |
| **Total** | **100** | **___ / 100** |
| Bonus (optional) | +5 | ___ |

---

## Submission Instructions

### 1. Prepare Your Repository

```bash
# Ensure you have all changes committed
git status

# Create final tag
git tag -a v1.0 -m "Final submission - Online Food Ordering System"

# Push all commits and tags
git push origin main --tags
```

### 2. Submit on Canvas/LMS

Provide:
- GitHub repository URL (ensure it's public or accessible to instructors)
- Commit hash of final submission
- Public URL (if deployed) or instructions to run locally
- Any known issues or incomplete features (honesty policy)

### 3. Checklist Before Submitting

- [ ] All code committed and pushed
- [ ] README.md includes setup and run instructions
- [ ] All 4 phases implemented
- [ ] At least one test successful (CRUD works end-to-end)
- [ ] No broken links or 404 errors
- [ ] All documents completed (LAB_MANUAL, REST_API_SPEC, API_DESIGN_RATIONALE)
- [ ] No sensitive data in repository (remove .env or use .env.example)
- [ ] All static assets load correctly (images, CSS, JS)

---

## Late Policy

- **On Time (by deadline):** Full points
- **1-2 days late:** -10% (90 points max)
- **3-5 days late:** -25% (75 points max)
- **After 5 days:** Not accepted without instructor permission

---

## Academic Integrity

All work must be your own. Violations of academic integrity policy will result in zero points and possible disciplinary action. You may:
- ✅ Use framework documentation
- ✅ Reference Stack Overflow for syntax help
- ✅ Use libraries (Bootstrap, FontAwesome, etc.)
- ✅ Consult classmates (discuss concepts, not code)
- ❌ Copy code from other students or online tutorials directly
- ❌ Use AI code generators without significant modification
- ❌ Misrepresent work as your own

If you use external sources, cite them in your code comments or README.

---

## Questions & Support

**Office Hours:** [Instructor availability]
**Email:** [Instructor email]
**Discussion Forum:** [Course platform]

---

## Sample Evaluation Comment

```
Grade: 95/100

Phase 1 (20/20): Excellent scaffolding. Proper model relationships and migrations.

Phase 2 (24/25): Outstanding Bootstrap integration. Great card layout with hover effects.
Minor: Navbar could use more polish on mobile (hamburger menu spacing).

Phase 3 (25/25): Perfect HTTP method usage. Clear JWT implementation. Idempotency well-documented.

Phase 4 (19/20): Well-designed URIs and comprehensive API spec. 
Minor: One endpoint could use better nested structure (/customers/:id/orders/add).

Code Quality (9/10): Clean code, good comments. Consider adding input validation functions.

Bonus (+2): Role-based access control implemented successfully.

Overall: Excellent work. You clearly understand REST principles and full-stack development.
Consider exploring API versioning for future projects.
```

---

**End of Assignment Document**
