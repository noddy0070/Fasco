import express from 'express';
const apiMiddleWare=(req:express.Request,res:express.Response,next:express.NextFunction)=>{
    console.log("API Middleware");
    console.log("Request URL:", req.url);
    console.log("Request Method:", req.method);
    console.log("Request Body:", req.body); 
    next();
}

export default apiMiddleWare;