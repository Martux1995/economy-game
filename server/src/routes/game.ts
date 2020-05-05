import { Router } from 'express';

import AuthController from '../controllers/auth';
import GameController from '../controllers/game';

const GameRouter = Router();

GameRouter.use(AuthController.checkAuth, AuthController.isPlayer);

GameRouter.get('/:gameId/cities/',                              GameController.getAllGameCities);
GameRouter.get('/:gameId/cities/:cityId',                       GameController.getGameCityById);

GameRouter.get('/:gameId/cities/:cityId/products/',             GameController.getAllGameCityProducts);
GameRouter.get('/:gameId/cities/:cityId/products/:productId',   GameController.getGameCityProductById);

GameRouter.get('/:gameId/products/',                            GameController.getAllProducts);
GameRouter.get('/:gameId/products/:productId',                  GameController.getProductById);

GameRouter.put('/:gameId/play/:groupId/trade/:cityId',          GameController.doTrade);   

export default GameRouter;