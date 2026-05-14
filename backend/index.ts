import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import express from 'express';
import apiRoutes from './routes/main.route.ts';
import cors from 'cors';
import apiMiddleWare from './middleware/api.middleware.ts';
import setupSwagger from './config/swagger.ts';
dotenv.config({quiet: true});
console.log("App started");
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}))
app.use(express.json())
setupSwagger(app);
app.use('/api',apiMiddleWare,apiRoutes)
mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@ac-k61j8tu-shard-00-00.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-01.ttocs5k.mongodb.net:27017,ac-k61j8tu-shard-00-02.ttocs5k.mongodb.net:27017/?ssl=true&replicaSet=atlas-t2n02a-shard-0&authSource=admin&appName=base`
).then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log("Error connecting to MongoDB", err);
})
.finally(()=>{
    console.log("Connection attempt finished");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});