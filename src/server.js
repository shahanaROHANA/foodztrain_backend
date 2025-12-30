// // server.js
// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import passport from 'passport';
// import { createServer } from 'http';
// import connectDB from './config/db.js';
// import { generalLimiter } from './middleware/rateLimitMiddleware.js';
// import socketService from './services/socketService.js';

// // ESM route imports (default exports)
// import authRoutes from './routes/authRoutes.js';
// import productRoutes from './routes/productRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';
// import paymentRoutes from './routes/paymentRoutes.js';
// import chatRoutes from "./routes/chatRoutes.js";
// import botRoutes from "./routes/botRoutes.js";
// import restaurantRoutes from './routes/restaurantRoutes.js';
// import cartRoutes from './routes/cartRoutes.js';
// import sellerRoutes from "./routes/sellerRoutes.js";
// import sellerDashboardRoutes from './routes/sellerDashboardRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import deliveryRoutes from "./routes/deliveryRoutes.js";
// import googleMapsRoutes from './routes/googleMapsRoutes.js';
// import simpleMapsRoutes from './routes/simpleMapsRoutes.js';
// import mapsRoutes from './routes/mapsRoutes.js';

// const app = express();
// const server = createServer(app);
// const PORT = process.env.PORT 

// // Connect DB
// connectDB();

// // Initialize Socket.IO
// socketService.initialize(server);

// // Initialize Passport
// app.use(passport.initialize());

// // CORS configuration
// const corsOptions = {
//   origin: [
    
//     process.env.DOMAIN || 'https://foodztrain-frontend-dq6o.vercel.app'
// ];
//   ], 
//   credentials: true 
// };

// // Apply CORS before body parsing
// app.use(cors(corsOptions));

// // Body parsing middleware (JSON)
// app.use(express.json());

// // API routes
// app.use('/api/auth', authRoutes);
// app.use('/api', generalLimiter); // Apply general rate limiting to other API routes
// app.use('/api/products', productRoutes);
// app.use('/api/restaurants', restaurantRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payment', paymentRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/bot', botRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/sellers', sellerRoutes);
// app.use('/api/seller/dashboard', sellerDashboardRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/delivery', deliveryRoutes);

// // Google Maps API endpoints
// app.use('/api', googleMapsRoutes);

// // Simplified Maps API endpoints
// app.use('/api/maps', simpleMapsRoutes);

// // Advanced Maps API endpoints
// app.use('/api/maps', mapsRoutes);

// // Health check
// app.get('/', (req, res) => res.send('🚆 TrainFood Backend is running (ESM)'));

// // Socket.IO connection stats endpoint
// app.get('/api/socket/stats', (req, res) => {
//   res.json(socketService.getConnectedUsersCount());
// });

// // Webhook route
// app.use('/webhook', paymentRoutes);

// // Error handler (must be last)
// app.use((err, req, res, next) => {
//   console.error('Server Error:', err);
//   res.status(500).json({ 
//     message: 'Server error',
//     error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Server started on port ${PORT}`);
//   console.log(`Socket.IO server initialized`);
// });

// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';
import socketService from './services/socketService.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import botRoutes from './routes/botRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import sellerDashboardRoutes from './routes/sellerDashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import googleMapsRoutes from './routes/googleMapsRoutes.js';
import simpleMapsRoutes from './routes/simpleMapsRoutes.js';
import mapsRoutes from './routes/mapsRoutes.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4009;

/* -------------------- DB -------------------- */
connectDB();

/* -------------------- SOCKET -------------------- */
socketService.initialize(server);

/* -------------------- PASSPORT -------------------- */
app.use(passport.initialize());

/* -------------------- CORS (FIXED & SAFE) -------------------- */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://foodztrain-frontend-dq6o.vercel.app'
];

app.use(
  cors({
    origin(origin, callback) {
      // allow Postman / server-side calls
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

/* -------------------- BODY PARSER -------------------- */
app.use(express.json());

/* -------------------- ROUTES -------------------- */
app.use('/api/auth', authRoutes);

app.use('/api', generalLimiter);
app.use('/api/products', productRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/seller/dashboard', sellerDashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryRoutes);

// Maps
app.use('/api', googleMapsRoutes);
app.use('/api/maps', simpleMapsRoutes);
app.use('/api/maps', mapsRoutes);

/* -------------------- HEALTH -------------------- */
app.get('/', (req, res) => {
  res.send('🚆 TrainFood Backend is running');
});

/* -------------------- SOCKET STATS -------------------- */
app.get('/api/socket/stats', (req, res) => {
  res.json(socketService.getConnectedUsersCount());
});

/* -------------------- WEBHOOK -------------------- */
app.use('/webhook', paymentRoutes);

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({
    message: 'Server error',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error'
  });
});

/* -------------------- START -------------------- */
server.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`✅ Socket.IO initialized`);
});
