# 💰 TaxPal

A full-stack personal finance and tax management application built with **Angular**, **Node.js**, **Express.js**, and **MongoDB**. TaxPal helps users manage income, expenses, categories, and estimate taxes through a secure and user-friendly interface.

---

## 🚀 Features

### 🔐 Authentication
- User Registration
- User Login
- JWT-based Authentication
- Protected Routes

### 📊 Dashboard
- Overview of financial information
- Quick navigation to application modules

### 📂 Category Management
- Add Categories
- Edit Categories
- Delete Categories
- Income & Expense Categories
- Duplicate Category Prevention
- Automatic Category Creation from Transactions

### 💳 Transaction Management
- Add Transactions
- Edit Transactions
- Delete Transactions
- Category Selection
- Automatic Category Creation
- Transaction History

### 🧮 Tax Calculator
- Tax estimation module
- Backend tax calculation APIs

---

## 🛠 Tech Stack

### Frontend
- Angular
- TypeScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- JSON Web Token (JWT)

---


## 📁 Project Structure

```text
TaxPal-Batch-3
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── utils
│   │   └── server.js
│   └── package.json
│
├── frontend
│   ├── src
│   └── package.json
│
├── screenshots
│   ├── login.png
│   ├── signup.png
│   ├── dashboard.png
│   ├── categories.png
│   ├── transactions.png
│   ├── budget.png
│   └── tax-calculator.png
│
└── README.md
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/springboardmentor09881n-rgb/TaxPal-Batch-3.git
```

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:4200
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 📷 Screenshots

### Login
![Login](screenshots/login.png)

### Sign Up
![Sign Up](screenshots/signup.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Categories
![Categories](screenshots/categories.png)

### Transactions
![Transactions](screenshots/transactions.png)

### Budget
![Budget](screenshots/budget.png)

### Tax Calculator
![Tax Calculator](screenshots/tax-calculator.png)

---

## 🎯 Future Enhancements

- Budget Analytics
- Charts & Graphs
- Monthly Reports
- Search & Filter Transactions
- Export Reports
- Responsive Dashboard

---

## 👨‍💻 Team

Developed as part of the **Infosys Springboard Internship Project**.

---

## 📄 License

This project is intended for educational purposes.