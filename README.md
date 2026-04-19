# 💊 Pharmacy Management System

A complete web-based solution for managing pharmacy inventory, customers, sales, and billing.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

---

## 📋 Project Overview

Pharmacy Management System is a full-stack web application built using **Node.js** and **Express.js** on the backend, with a **MySQL** relational database for persistent storage. It exposes a RESTful API for managing medicines, customers, and sales transactions — complete with automatic stock management and billing logic.

**Key Highlights:**
- ✅ Real-time inventory tracking with automatic stock deduction on sale
- ✅ Complete CRUD operations for Medicines, Customers, and Sales
- ✅ Stock validation — prevents overselling with insufficient inventory check
- ✅ Automatic stock restoration when a sale is deleted/reversed
- ✅ Clean RESTful API endpoints ready for frontend integration

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL (mysql2 package) |
| Middleware | CORS, Body-Parser, Express Static |
| Port | 3000 (default) |

---

## 📁 Project Structure

```
pharmacy-management/
├── server.js          # Main Express server & all API routes
├── public/            # Static frontend files
│   └── index.html     # Frontend UI
├── package.json       # Dependencies
└── README.md          # This file
```

---

## ⚙️ Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm (comes with Node.js)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/rounakm20/pharmacy-management.git
cd pharmacy-management
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup MySQL Database

Run the following SQL to create the database and tables:

```sql
CREATE DATABASE pharmacy_management;
USE pharmacy_management;

CREATE TABLE medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity INT DEFAULT 0,
  price DECIMAL(10,2),
  expiry DATE,
  supplier VARCHAR(255)
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255)
);

CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  medicine_id INT,
  quantity INT,
  total DECIMAL(10,2),
  sale_date DATE,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);
```

### Step 4: Configure Database Password

In `server.js`, update the MySQL password:

```javascript
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD_HERE',  // ← Change this
  database: 'pharmacy_management'
});
```

### Step 5: Start the Server

```bash
node server.js
```

Server will start at: **http://localhost:3000**

---

## 📡 API Reference

### Medicines — `/api/medicines`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | Get all medicines |
| GET | `/api/medicines/:id` | Get a single medicine |
| POST | `/api/medicines` | Add a new medicine |
| PUT | `/api/medicines/:id` | Update medicine details |
| DELETE | `/api/medicines/:id` | Delete a medicine |

### Customers — `/api/customers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get a single customer |
| POST | `/api/customers` | Add a new customer |
| PUT | `/api/customers/:id` | Update customer details |
| DELETE | `/api/customers/:id` | Delete a customer |

### Sales — `/api/sales`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales` | Get all sales with names |
| POST | `/api/sales` | Record a new sale (auto-deducts stock) |
| DELETE | `/api/sales/:id` | Delete a sale (auto-restores stock) |

---

## 📦 Request Body Examples

### POST `/api/medicines`
```json
{
  "name": "Paracetamol 500mg",
  "category": "Analgesic",
  "quantity": 100,
  "price": 5.50,
  "expiry": "2026-12-31",
  "supplier": "MedCorp Ltd"
}
```

### POST `/api/customers`
```json
{
  "name": "Rahul Sharma",
  "phone": "9876543210",
  "email": "rahul@example.com"
}
```

### POST `/api/sales`
```json
{
  "customer_id": 1,
  "medicine_id": 2,
  "quantity": 5,
  "total": 27.50,
  "sale_date": "2025-11-27"
}
```

---

## 🔄 Business Logic

| Operation | What Happens |
|-----------|-------------|
| New Sale | Checks stock → Rejects if insufficient → Deducts quantity |
| Delete Sale | Automatically restores stock back |
| Stock Validation | Returns 400 error with available quantity if overselling |
| Sales Report | Joins all 3 tables — returns names not just IDs |

---

## 📦 npm Dependencies

| Package | Purpose |
|---------|---------|
| express | Web framework & routing |
| mysql2 | MySQL database driver |
| cors | Cross-Origin Resource Sharing |
| body-parser | Parse JSON request bodies |

---

## 👨‍💻 Author

**Rounak Mishra**  
GitHub: [github.com/rounakm20](https://github.com/rounakm20)

---

*Made with ❤️ in India 🇮🇳*
