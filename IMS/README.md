# Inventory Management System (IMS)

A modern portfolio-grade Inventory Management System built with React, Tailwind CSS, Node.js, Express, MySQL, JWT authentication, and premium SaaS dashboard UI.

## IMS Screenshots

## DASHBOARD

<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 05 16 PM" src="https://github.com/user-attachments/assets/0f83aa9a-ac62-4c83-8ac8-026699fc80db" />

## PRODUCTS

<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 04 35 PM" src="https://github.com/user-attachments/assets/d361a6ae-f771-4a9a-aaa4-8cb12dc348d8" />

## CATEGORRIES

<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 04 44 PM" src="https://github.com/user-attachments/assets/952141be-8046-4b7b-a788-b5ea4b18d08b" />

## WAREHOUSE

<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 04 55 PM" src="https://github.com/user-attachments/assets/64aef5a6-b049-4547-89dd-cebb97c8f292" />

## SALES ORDER

<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 05 03 PM" src="https://github.com/user-attachments/assets/b7364592-c92b-40c0-907c-5d24faf13c74" />

## INVOICES

<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 05 08 PM" src="https://github.com/user-attachments/assets/0983f588-ace5-4e24-9e4f-ee503cbc1428" />

## GOODS IN/OUT

<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 05 24 PM" src="https://github.com/user-attachments/assets/d40c903f-effb-45ef-b6be-42425dcf2f81" />

## TRANSFERS

<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 05 28 PM" src="https://github.com/user-attachments/assets/a46eca9c-02c4-4c9e-936d-d182386da12a" />

## PURCHASE REQUESTS

<img width="1440" height="900" alt="Screenshot 2026-05-06 at 2 05 40 PM" src="https://github.com/user-attachments/assets/d6e2eabd-276d-4359-b8ef-30d454d198d9" />



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
