import express from 'express';
import logger from '../utils/logger.ts';

const apiMiddleWare = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    logger.info({ method: req.method, url: req.url }, 'incoming request');
    next();
};

export default apiMiddleWare;