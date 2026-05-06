# Inventory Management System (IMS)

A modern portfolio-grade Inventory Management System built with React, Tailwind CSS, Node.js, Express, MySQL, JWT authentication, and premium SaaS dashboard UI.

## IMS Screenshots
<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 05 16 PM" src="https://github.com/user-attachments/assets/0f83aa9a-ac62-4c83-8ac8-026699fc80db" />

## Structure

- `frontend/` — React + Vite + Tailwind UI
- `backend/` — Express REST API with JWT auth and MySQL

## Setup

1. Install dependencies for backend:
   ```bash
   cd backend
   npm install
   ```

2. Install dependencies for frontend:
   ```bash
   cd ../frontend
   npm install
   ```

3. Configure backend environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Set `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`

4. Create the MySQL database and tables:
   - Use `backend/database.sql` or run the SQL manually.

5. Start backend and frontend:
   ```bash
   npm install
   npm run dev
   ```

6. Open the frontend app at the local Vite URL.

## Notes


- Backend API base path: `/api`
- Frontend uses JWT stored in localStorage for authentication
- Dashboard is designed for responsive and premium SaaS experience.
