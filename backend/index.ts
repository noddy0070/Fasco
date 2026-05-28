import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/main.route.ts';
import cors from 'cors';
import apiMiddleWare from './middleware/api.middleware.ts';
import setupSwagger from './config/swagger.ts';
import logger from './utils/logger.ts';

dotenv.config({ quiet: true });
logger.info('App started');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());

// ── NoSQL injection sanitization (Express 5 compatible) ──────────────────────
// express-mongo-sanitize v2 tries to assign req.query which is read-only in
// Express 5. We sanitize body/params in place and skip req.query reassignment.
const sanitizeValue = (val: unknown): unknown => {
    if (val === null || typeof val !== 'object') return val;
    if (Array.isArray(val)) return val.map(sanitizeValue);
    const obj = val as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        if (!key.startsWith('$') && !key.includes('.')) {
            out[key] = sanitizeValue(obj[key]);
        }
    }
    return out;
};
app.use((req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }
    if (req.params && typeof req.params === 'object') {
        for (const key of Object.keys(req.params)) {
            req.params[key] = sanitizeValue(req.params[key]) as string;
        }
    }
    next();
});

// ── Rate limiting for auth routes ─────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/admin/auth/login', authLimiter);

setupSwagger(app);
app.use('/api', apiMiddleWare, apiRoutes);

// ── Centralized error handler ─────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'unhandled error');
    res.status(500).json({ message: 'Internal server error' });
});

// ── MongoDB connection ────────────────────────────────────────────────────────
mongoose.connect(
    `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ac-k61j8tu-shard-00-00.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-01.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-02.ttocs5k.mongodb.net:27017/?ssl=true&replicaSet=atlas-t2n02a-shard-0&authSource=admin&appName=base`,
    {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    },
).then(() => {
    logger.info('Connected to MongoDB');
}).catch((err) => {
    logger.error({ err }, 'Error connecting to MongoDB');
}).finally(() => {
    logger.info('Connection attempt finished');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger docs: http://localhost:${PORT}/api-docs`);
});