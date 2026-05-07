import express from 'express';
import authRoutes from './auth/auth.route.ts';
const router = express.Router();

router.use('/auth', authRoutes) 
router.get('/test', (req, res) => {
	console.log("TEST REQUEST RECEIVED");
	res.status(200).json({ message: "Test endpoint works" });
});


export default router;
