# MERN Fashion E-Commerce Backend

Complete backend API for a fashion e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Product management
- Category management
- Shopping cart
- Order management
- Payment processing
- Product reviews and ratings
- Wishlist functionality

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── productController.js  # Product operations
│   ├── categoryController.js # Category operations
│   ├── cartController.js     # Cart management
│   ├── orderController.js    # Order operations
│   └── paymentController.js  # Payment processing
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   └── errorMiddleware.js    # Global error handler
├── models/
│   ├── user.js               # User schema
│   ├── product.js            # Product schema
│   ├── category.js           # Category schema
│   ├── cart.js               # Cart schema
│   ├── order.js              # Order schema
│   └── payment.js            # Payment schema
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── userRoutes.js         # User endpoints
│   ├── productRoutes.js      # Product endpoints
│   ├── categoryRoutes.js     # Category endpoints
│   ├── cartRoutes.js         # Cart endpoints
│   ├── orderRoutes.js        # Order endpoints
│   └── paymentRoutes.js      # Payment endpoints
├── utils/
│   ├── email.js              # Email service
│   └── response.js           # Response helpers
├── server.js                 # Main server file
├── package.json
├── .env                      # Environment variables
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required variables (see `.env` example above)

3. Start MongoDB:
```bash
mongod
```

4. Run the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/wishlist/add` - Add to wishlist
- `POST /api/users/wishlist/remove` - Remove from wishlist

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/review` - Add review

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/user/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/user/my-payments` - Get user payments
- `GET /api/payments` - Get all payments (admin)
- `PUT /api/payments/:id/status` - Update payment status
- `PUT /api/payments/:id/refund` - Refund payment

## Environment Variables

```
MONGO_URI=mongodb://localhost:27017/seyaFashionDB
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
```

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT token generation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **cookie-parser** - Cookie parsing

## Development Dependencies

- **nodemon** - Auto-restart on file changes

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

## Next Steps

1. Add email service integration (nodemailer)
2. Integrate payment gateways (Stripe, PayPal)
3. Add input validation (joi or express-validator)
4. Implement file upload (multer)
5. Add API documentation (Swagger/OpenAPI)
6. Add unit and integration tests (Jest)
7. Implement rate limiting
8. Add logging system
9. Set up CI/CD pipeline
10. Deploy to production (Heroku, AWS, etc.)

## License

ISC
