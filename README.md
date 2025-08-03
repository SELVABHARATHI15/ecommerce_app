#  README.md file
# Node.js E-Commerce Project

## Overview
This is a full-featured **E-Commerce Web Application** built using **Node.js**, **Express**, and **MongoDB**. The project includes essential online store functionalities such as user authentication, admin dashboard, product management, shopping cart, wishlist, order management, and customer portal settings. It also features a responsive front-end with HTML, CSS, and JavaScript.

## Features
- **User Authentication:** Secure login, registration, and JWT-based session handling.
- **Role-Based Access Control:** Admin and customer roles with dedicated dashboards.
- **Product Management:** Add, edit, delete, search, sort, and paginate products.
- **Shopping Cart:** Add, update, remove items, and view cart details.
- **Wishlist:** Save favorite products for later purchase.
- **Orders:** Place and track orders; admin can filter, group, and edit orders.
- **Customer Management:** View, update, block/unblock customers, and manage portal access.
- **Profile Management:** Update profile details and change password.
- **Admin Dashboard:** Real-time statistics, customer/product management, and order handling.
- **Search & Filters:** Product and customer search, sorting, and filtering options.
- **Responsive UI:** Optimized for desktop and mobile.

## Tech Stack
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Frontend:** HTML, CSS, JavaScript
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** MongoDB (NoSQL)
- **Environment Variables:** dotenv

## Installation

### Prerequisites
Ensure you have the following installed:
- Node.js (v14+ recommended)
- MongoDB
- npm or yarn

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecommerce-app.git
   cd ecommerce-app
````
````
2. Install dependencies:

    ```bash
   npm install
   ````

3. Configure environment variables in `.env`:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret
   ```

4. Start MongoDB server locally or connect to your cloud database.

5. Start the development server:

   ```bash
   npm start
   ```

   or (for auto-reload in development):

   ```bash
   npm run dev
   ```

## Usage

* Visit `http://localhost:5000` in your browser.
* Register as a new user or log in.
* Customers can browse products, add to cart/wishlist, and place orders.
* Admins can log in to the **Admin Dashboard** to manage products, customers, and orders.

## Project Structure

```
ecommerce-app/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── customerController.js
│   ├── orderController.js
│   ├── portalSettingsController.js
│   └── productController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── Cart.js
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── customerRoutes.js
│   ├── orderRoutes.js
│   └── productRoutes.js
├── public/ (Frontend HTML, CSS, JS)
├── .env
├── package.json
└── server.js
```
## Demo Video
You can watch the demo video here:  
[Click to View on Google Drive]([https://drive.google.com/file/d/17HWmwiov1KcI1mKP03Rg9blFETNglpSW/view?usp=drive_link](https://drive.google.com/drive/folders/1k15P0s3LNOiQcpnxXCy1reiYT1Ov3cnc?usp=drive_link))
