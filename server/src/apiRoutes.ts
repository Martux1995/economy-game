import { Router, Request, Response } from 'express'

import DataRouter from './routes/data';
import GameRouter from './routes/game';

const ApiRouter = Router();

//ApiRouter.use('/auth',                AuthRouter);
//ApiRouter.use('/admin',               AdminRouter);
ApiRouter.use('/data',                DataRouter);
//ApiRouter.use('/games/:gameId/admin',  GameAdminRouter);
ApiRouter.use('/games',        GameRouter);

ApiRouter.all('/*', (req : Request, res: Response) => {
    res.status(404).json({code:404, msg: 'Ruta API no reconocida.'});
});

export default ApiRouter;
