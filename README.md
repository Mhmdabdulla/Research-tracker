# 📑 Research Paper Tracker

A professional-grade dashboard for academics and researchers to manage research lifecycles. Built with a focus on **Clean Architecture**, **SOLID principles**, and **Type-safe Data Fetching**.

---

## ✨ Key Features

* **Smart Tracking:** Move papers through 7 distinct reading stages (Abstract → Fully Read).
* **Live Analytics:** Automated funnel charts, domain-stage breakdowns, and citation impact scatter plots.
* **Advanced Filtering:** Server-side search, multi-domain filtering, and citation sorting on the fly.
* **Data Integrity:** End-to-end safety with **Zod** (Frontend) and **Mongoose DTOs** (Backend).
* **Optimized Performance:** **RTK Query** handles all server-state, reducing unnecessary re-renders and redundant API calls.

---

## 🏗️ Architecture & Design Patterns

This project is engineered to scale using industry-standard patterns rather than basic CRUD logic.

### 🛡️ The Backend (SOLID & Layered)
* **Repository Pattern:** `MongoPaperRepository` encapsulates all Mongoose logic. The rest of the app remains database-agnostic.
* **Dependency Injection:** Services receive repositories via constructor injection, making the logic 100% testable and decoupled.
* **Polymorphic Error Handling:** A custom `AppError` hierarchy ensures consistent, semantic API responses (`NotFoundError`, `ValidationError`, etc.).
* **DTO Pattern:** Strict separation between Database Models and Data Transfer Objects (DTOs) to prevent internal schema leaking.



### 🎨 The Frontend (State & UX)
* **RTK Query:** Sophisticated server-state management with **Tag-based Cache Invalidation**. Updating a paper stage automatically triggers a background analytics re-fetch.
* **Type-Safe Forms:** `React Hook Form` seamlessly integrated with `Zod` for schema-first validation and type inference.
* **Declarative UI:** Built using `shadcn/ui` primitives for a polished, accessible interface.
* **UX Optimization:** Debounced server-side search and "Updating..." states ensure a smooth experience without layout shifts.



---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Redux Toolkit (RTK Query), Tailwind CSS |
| **UI / Charts** | shadcn/ui (Radix), Recharts, Framer Motion |
| **Backend** | Node.js (ES2022), Express v5, TypeScript |
| **Database** | MongoDB + Mongoose v7 |
| **Validation** | Zod (Frontend) & Express-Validator (Backend) |
| **Security** | Helmet, CORS Whitelisting, HTTP Status Codes |

---

## ⚡ Quick Start

### 1. Backend (Node/Express)
```bash
cd backend
npm install
# Setup .env with MONGODB_URI & PORT
npm run dev

### 2. Frontend (React/Vite)
```bash
cd frontend
npm install
# Setup .env with VITE_API_BASE_URL
npm run dev

## 🔗 Live Demo

**View the live application here:** [👉 Research Paper Tracker Live](https://research-tracker-zeta.vercel.app)

> **Note:** The initial load might take a few seconds as the backend wakes up from a cold start on Render.

---
