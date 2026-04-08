import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import express from 'express';
dotenv.config({quiet: true});
console.log("App started");
const app = express();
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@base.ttocs5k.mongodb.net/test?retryWrites=true&w=majority`).then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log("Error connecting to MongoDB", err);
})
.finally(()=>{
    console.log("Connection attempt finished");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});