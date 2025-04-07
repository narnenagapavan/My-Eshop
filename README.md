# 🛒 MY-Eshop

A web-based e-commerce management application that helps in managing shop users and their employees. This system uses **MongoDB** for backend storage and provides intuitive features like user registration, OTP verification, shop ID generation, employee management, and more.

---

## 📌 Features

### 🔐 User Management
- View all registered users.
- Register new users with:
  - First Name, Last Name
  - Shop Name & Address
  - Gender
  - Phone Number (OTP verification using Twilio)
  - Email verification
  - Password & Confirm Password
- Twilio integration for phone number OTP verification (Limited due to cost constraints).
- Automatically generate a unique **Shop ID** for each registered shop.
- Edit and Delete options for each user.
- Editable fields include:
  - First Name
  - Last Name
  - Shop Name
  - Phone Number
  - Email

### 👥 Employee Management
- Add and manage employees under each shop.
- Register new employees with:
  - First Name, Last Name
  - Date of Birth, Gender
  - Phone Number (OTP verification)
  - Job Title (Store Manager, Sales Associate, Inventory Manager, Cashier, Customer Service Representative)
  - Date of Joining
  - Password & Confirm Password
  - Terms and Conditions agreement
- Edit and Delete options for each employee.
- Editable fields include:
  - Job Role
  - Salary
  - Phone Number

---

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js / Express.js
- **Database**: MongoDB
- **Authentication & Verification**: Twilio (OTP for phone number verification)
- **Hosting**: (Add if hosted on platforms like Vercel, Render, etc.)

---

## 🚧 Limitations

- **Twilio Phone Verification** is limited to verified numbers due to pricing constraints as a student.
- Currently no email OTP verification (could be added in future updates).

---

## 📂 Folder Structure

