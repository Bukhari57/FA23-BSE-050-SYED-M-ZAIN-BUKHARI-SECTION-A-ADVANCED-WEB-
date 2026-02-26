# REST API Documentation Template
## For Online Food Ordering System

This is a **template** document that students should use as a starting point to document their REST API, specifically focusing on **Idempotency** and **HTTP Method Compliance**.

---

## Instructions

1. **Copy this file** in your repository: `REST_API_DOCUMENTATION.md`
2. **Fill in each section** with details about your specific API
3. **Test each endpoint** using curl or Postman before documenting
4. **Explain idempotency** for each operation in clear terms
5. **Keep this documentation up-to-date** as you build your API

---

## API Overview

**Base URL:** `http://localhost:3000/api/v1`  
**Authentication:** JWT Token (as `Authorization: Bearer <token>`)  
**Content-Type:** `application/json`

---

## HTTP Methods & Idempotency Reference

| Method | Definition | Idempotent | Use Case |
|--------|-----------|-----------|----------|
| **GET** | Retrieve a resource | ✅ YES | Fetch data without modification |
| **POST** | Create a new resource | ❌ NO | Create new entities |
| **PUT** | Full resource replacement | ✅ YES | Update entire resource |
| **PATCH** | Partial resource update | ❌ NO | Update specific fields |
| **DELETE** | Remove a resource | ✅ YES | Delete and ensure deleted |

**Idempotency Definition:** An operation is **idempotent** if calling it multiple times produces the same result as calling it once.

---

## Menu Items Endpoints

### GET /menuitems
**Description:** Retrieve all menu items with optional filtering  
**HTTP Method:** GET  
**Authentication:** Not required  
**Idempotent:** ✅ **YES**

**Why Idempotent?**  
Calling GET multiple times returns the same list of menu items. No data is modified. The operation is safe to retry without side effects.

**Query Parameters:**
- `category` (string, optional): Filter by category, e.g., `?category=pizza`
- `available` (boolean, optional): Filter by availability, e.g., `?available=true`
- `limit` (integer, optional): Limit results, default 20
- `offset` (integer, optional): Pagination offset, default 0

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/menuitems?category=pizza&limit=10"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "description": "Classic tomato and cheese",
      "price": 9.99,
      "category": "pizza",
      "available": true,
      "image_url": "/images/pizza.jpg"
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

---

### GET /menuitems/:id
**Description:** Retrieve a single menu item by ID  
**HTTP Method:** GET  
**Authentication:** Not required  
**Idempotent:** ✅ **YES**

**Why Idempotent?**  
Fetching the same item 100 times returns identical data. No side effects.

**URL Parameters:**
- `id` (integer, required): Menu item ID

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/menuitems/1"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Margherita Pizza",
    "description": "Classic tomato and cheese",
    "price": 9.99,
    "category": "pizza",
    "available": true,
    "image_url": "/images/pizza.jpg",
    "created_at": "2026-02-25T10:00:00Z",
    "updated_at": "2026-02-25T10:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Menu item not found",
  "code": "ITEM_NOT_FOUND"
}
```

---

### POST /menuitems
**Description:** Create a new menu item (Admin only)  
**HTTP Method:** POST  
**Authentication:** Required (Admin role)  
**Idempotent:** ❌ **NO**

**Why NOT Idempotent?**  
Each POST request creates a **new** menu item. Calling POST three times with the same data creates three different items with different IDs.

**Mitigation:** Use **idempotency keys** to prevent accidental duplicates.

**Request Body:**
```json
{
  "name": "New Pizza",
  "description": "Fresh mozzarella and basil",
  "price": 10.99,
  "category": "pizza",
  "available": true,
  "image_url": "/images/new_pizza.jpg",
  "idempotency_key": "uuid-12345"
}
```

**Request:**
```bash
curl -X POST "http://localhost:3000/api/v1/menuitems" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Pizza",
    "description": "Fresh mozzarella and basil",
    "price": 10.99,
    "category": "pizza",
    "available": true
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 51,
    "name": "New Pizza",
    "description": "Fresh mozzarella and basil",
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
  "error": "Required field missing: name",
  "code": "VALIDATION_ERROR"
}
```

---

### PUT /menuitems/:id
**Description:** Update entire menu item (full replacement)  
**HTTP Method:** PUT  
**Authentication:** Required (Admin role)  
**Idempotent:** ✅ **YES**

**Why Idempotent?**  
Calling PUT with the same data multiple times results in the same state. Item is replaced to the exact state specified. 
- First PUT: Item becomes {name: "Pizza", price: 12.00}
- Second PUT (same data): Item is still {name: "Pizza", price: 12.00}
- Result is identical, so idempotent.

**URL Parameters:**
- `id` (integer, required): Menu item ID

**Request Body (full resource, all fields required):**
```json
{
  "name": "Updated Pizza",
  "description": "Updated description",
  "price": 11.99,
  "category": "pizza",
  "available": true,
  "image_url": "/images/updated_pizza.jpg"
}
```

**Request:**
```bash
curl -X PUT "http://localhost:3000/api/v1/menuitems/1" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Pizza",
    "description": "Updated description",
    "price": 11.99,
    "category": "pizza",
    "available": true,
    "image_url": "/images/updated_pizza.jpg"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Pizza",
    "description": "Updated description",
    "price": 11.99,
    "category": "pizza",
    "available": true,
    "updated_at": "2026-02-26T13:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Menu item not found",
  "code": "ITEM_NOT_FOUND"
}
```

**Testing Idempotency:**
1. Call PUT /menuitems/1 with {name: "Pizza", price: 12.00}
2. Call PUT /menuitems/1 again with the SAME data
3. Call PUT /menuitems/1 a third time with the SAME data
4. **Result:** Item is in identical state after each call ✅ Idempotent

---

### DELETE /menuitems/:id
**Description:** Delete a menu item  
**HTTP Method:** DELETE  
**Authentication:** Required (Admin role)  
**Idempotent:** ✅ **YES**

**Why Idempotent?**  
- First DELETE /menuitems/5: Item deleted, returns 204
- Second DELETE /menuitems/5: Item already deleted, returns 404 (or 204)
- Result is the same (item is deleted), so idempotent

The second DELETE doesn't "un-delete" or change the state; it confirms the item is gone.

**URL Parameters:**
- `id` (integer, required): Menu item ID

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/menuitems/1" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (204 No Content):**
```
(No body, just 204 status)
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Menu item not found",
  "code": "ITEM_NOT_FOUND"
}
```

**Testing Idempotency:**
1. Call DELETE /menuitems/1 → Returns 204 (item deleted)
2. Call DELETE /menuitems/1 again → Returns 404 or 204 (still deleted)
3. **Result:** Item is deleted after first call, and subsequent calls don't change state ✅ Idempotent

---

## Orders Endpoints

### GET /orders
**Description:** Retrieve all orders (customers see theirs, admins see all)  
**HTTP Method:** GET  
**Authentication:** Required  
**Idempotent:** ✅ **YES**

**Why?** GET never modifies state. Fetching orders 10 times returns the same list.

**Query Parameters:**
- `status` (string, optional): Filter by status (pending, confirmed, delivered)
- `limit` (integer, optional): Pagination

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/orders?status=pending" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "total_price": 29.97,
      "status": "confirmed",
      "created_at": "2026-02-25T15:30:00Z"
    }
  ]
}
```

---

### POST /orders
**Description:** Create a new order (checkout)  
**HTTP Method:** POST  
**Authentication:** Required  
**Idempotent:** ❌ **NO**

**Why NOT Idempotent?**  
Each POST creates a new order with a unique ID. 
- Call 1: Creates Order #100
- Call 2: Creates Order #101
- Call 3: Creates Order #102

Three different orders exist. **Not idempotent.**

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_address": "123 Main St",
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2
    },
    {
      "menu_item_id": 3,
      "quantity": 1
    }
  ]
}
```

**Request:**
```bash
curl -X POST "http://localhost:3000/api/v1/orders" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_address": "123 Main St",
    "items": [{"menu_item_id": 1, "quantity": 2}]
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 100,
    "customer_name": "John Doe",
    "total_price": 29.97,
    "status": "pending",
    "items": [...]
  }
}
```

---

### PUT /orders/:id
**Description:** Update order status  
**HTTP Method:** PUT  
**Authentication:** Required (Admin role)  
**Idempotent:** ✅ **YES**

**Why Idempotent?**  
- First PUT /orders/1 with {status: "confirmed"} → Order status = "confirmed"
- Second PUT /orders/1 with {status: "confirmed"} → Order status still "confirmed"
- State is identical, so idempotent.

**URL Parameters:**
- `id` (integer, required): Order ID

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
    "updated_at": "2026-02-26T14:00:00Z"
  }
}
```

---

### DELETE /orders/:id
**Description:** Delete/cancel an order  
**HTTP Method:** DELETE  
**Authentication:** Required (Admin/Order Owner)  
**Idempotent:** ✅ **YES**

**Why?** Same reasoning as MenuItem DELETE. Deleting twice = same state (deleted).

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/orders/1" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (204 No Content):**
```
(No body)
```

---

## Nested Resources: Order Items

### GET /orders/:id/items
**Description:** Retrieve all items in an order  
**HTTP Method:** GET  
**Authentication:** Required  
**Idempotent:** ✅ **YES**

**URL Parameters:**
- `id` (integer, required): Order ID

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/orders/1/items" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "item_id": 1,
      "name": "Margherita Pizza",
      "quantity": 2,
      "price_per_unit": 9.99
    }
  ]
}
```

---

### DELETE /orders/:id/items/:item_id
**Description:** Remove an item from an order  
**HTTP Method:** DELETE  
**Authentication:** Required (Admin/Order Owner)  
**Idempotent:** ✅ **YES**

**URL Parameters:**
- `id` (integer, required): Order ID
- `item_id` (integer, required): Menu Item ID

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/orders/1/items/3" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (204 No Content):**
```
(No body)
```

---

## Summary Table: Idempotency by Operation

| Endpoint | Method | Idempotent | Reason |
|----------|--------|-----------|--------|
| /menuitems | GET | ✅ YES | Reading doesn't modify state |
| /menuitems/:id | GET | ✅ YES | Reading doesn't modify state |
| /menuitems | POST | ❌ NO | Each POST creates NEW item |
| /menuitems/:id | PUT | ✅ YES | Replacing to same state is same result |
| /menuitems/:id | DELETE | ✅ YES | Deleting twice = same state (deleted) |
| /orders | GET | ✅ YES | Reading doesn't modify state |
| /orders/:id | GET | ✅ YES | Reading doesn't modify state |
| /orders | POST | ❌ NO | Each POST creates NEW order |
| /orders/:id | PUT | ✅ YES | Updating to same status is same result |
| /orders/:id | DELETE | ✅ YES | Deleting twice = same state (deleted) |
| /orders/:id/items | GET | ✅ YES | Reading doesn't modify state |
| /orders/:id/items/:item_id | DELETE | ✅ YES | Deleting twice = same state (deleted) |

---

## Testing Instructions

### Test with curl

```bash
# 1. Test GET (safe, idempotent)
curl -X GET "http://localhost:3000/api/v1/menuitems"

# 2. Test POST (creates new, not idempotent)
curl -X POST "http://localhost:3000/api/v1/menuitems" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pizza","price":9.99,"category":"pizza"}'

# 3. Test PUT (idempotent)
curl -X PUT "http://localhost:3000/api/v1/menuitems/1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Pizza","price":10.99,"category":"pizza"}'

# 4. Test DELETE (idempotent)
curl -X DELETE "http://localhost:3000/api/v1/menuitems/1"

# 5. Test DELETE again (should still work or return 404, both idempotent)
curl -X DELETE "http://localhost:3000/api/v1/menuitems/1"
```

### Test with Postman

1. Import the collection or create requests manually
2. For each endpoint:
   - Set HTTP method (GET, POST, PUT, DELETE)
   - Set URL and parameters
   - Add Authorization header for protected endpoints
   - Send request and verify response code and body
3. Export as JSON collection for submission

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` — Invalid input data
- `NOT_FOUND` — Resource doesn't exist
- `UNAUTHORIZED` — Missing authentication
- `FORBIDDEN` — Lacking permission
- `CONFLICT` — Business logic violation (e.g., duplicate)
- `SERVER_ERROR` — Internal server error

---

## Version History

**v1.0 (Current)**
- Initial API release
- Full CRUD for MenuItems and Orders
- Nested OrderItems resource
- JWT authentication

**Future Versions**
- v2.0: Planned changes (bulk operations, advanced filtering, etc.)

---

**End of Template**

---

## Student Checklist

Before submitting your REST_API_DOCUMENTATION.md:

- [ ] All endpoints documented with HTTP method, URL, description
- [ ] All endpoints include example request and response
- [ ] Idempotency explained for each operation (YES or NO with reasoning)
- [ ] Query parameters documented
- [ ] Authentication requirements clear
- [ ] Response codes documented (200, 201, 204, 400, 404, etc.)
- [ ] Testing instructions provided (curl examples)
- [ ] Summary table showing all endpoints
- [ ] At least 12 endpoints documented (more is better)

**Questions?** Review the REST Principles phase in the Lab Manual or ask your instructor.
