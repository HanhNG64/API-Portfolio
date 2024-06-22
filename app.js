const express = require('express');

const helmet = require('helmet');
const cors = require('cors');
const rateLimiter = require('express-rate-limit');

const userRouter = require('./routes/user');
const projectRouter = require('./routes/project');
const authRouter = require('./routes/auth');
const contactRouter = require('./routes/contact');
const checkAuth = require('./middleware/check-auth');
const errorHandler = require('./errors/errorHandle');

//API Initiation
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration and allow cross-origin queries
const options = {
  origin: 'https://portfolio-hanh-5qvr.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization',
};
app.use(cors(options));

// Secure HTTP headers against XSS attacks and allow cross-origin queries
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Rate limiter
const limiter = rateLimiter({
  max: 100, // Max requests
  windowMs: 1 * 60 * 5000, // Time
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
  standardHeaders: false,
  legacyHeaders: false,
});
app.use(limiter);

// Routage
app.get('/', (req, res) => res.send('Bienvenue ....'));
app.use('/api/users', checkAuth, userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/auth', authRouter);
app.use('/api/contacts', contactRouter);
app.use(errorHandler);

module.exports = app;
