# OUTRAN Commerce System

Premium full stack ecommerce scaffold for the OUTRAN Tank Cover System for Himalayan 450.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs a Next.js 15, React, TypeScript, TailwindCSS, Framer Motion, Lenis, Zustand, Axios, and Tanstack Query storefront.

## Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
copy backend\.env.example backend\.env
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

FastAPI REST API with SQLAlchemy models for products, categories, subcategories, images, variants, materials, colors, sizes, inventory, orders, order items, shipping addresses, coupons, settings, reviews, banners, and journal posts. Customer checkout is guest-only.

## Deployment Shape

- Frontend: Vercel
- Backend: Ubuntu VPS with Nginx reverse proxy
- Database: MySQL
- Media: Cloudinary
- Payments: Razorpay
