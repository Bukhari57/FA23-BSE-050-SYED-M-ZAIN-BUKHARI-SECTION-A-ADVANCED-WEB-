# Committee Management System API

Base URL: `http://localhost:5000/api`

## Auth
- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `POST /auth/logout`

## Dashboard
- `GET /dashboard`

## Committees
- `GET /committees?page=1&limit=10&status=active&search=gold`
- `POST /committees`
- `GET /committees/:id`
- `PATCH /committees/:id`
- `DELETE /committees/:id`
- `POST /committees/:id/rotate-payout`

## Members
- `GET /members?page=1&limit=20&committee=<committeeId>`
- `POST /members` (`multipart/form-data` supported with `profileImage`)
- `GET /members/:id`
- `PATCH /members/:id`
- `DELETE /members/:id`

## Payments
- `GET /payments?page=1&limit=20&committee=<id>&status=pending`
- `POST /payments`
- `GET /payments/:id`
- `PATCH /payments/:id`
- `DELETE /payments/:id`

## Transactions
- `GET /transactions`
- `POST /transactions`

## Notifications
- `GET /notifications`
- `PATCH /notifications/:id/read`

## Reports
- `GET /reports`
- `POST /reports/generate`
  - Body:
    - `type`: `monthly | committee | financial | custom`
    - `format`: `pdf | xlsx`
    - `startDate`, `endDate`
    - optional `committeeId`

## Settings
- `PATCH /settings/profile`
- `PATCH /settings/notifications`
- `PATCH /settings/change-password`

## Admin (admin/super_admin)
- `GET /admin/users`
- `PATCH /admin/users/:id`
- `PATCH /admin/committees/:id/approve`
- `GET /admin/audit-logs`

## Standard Response

```json
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Security
- JWT access token in `Authorization: Bearer <token>`
- Refresh token via API body
- Password hashing with bcrypt
- Request validation via `express-validator`
- Rate limit applied to `/api/*`
- Helmet, HPP, XSS clean, and Mongo sanitization middleware
