import { Router } from 'express';

import AuthController from '../controllers/auth';
import GameController from '../controllers/game';

const GameRouter = Router();

GameRouter.use(AuthController.checkAuth, AuthController.isPlayer, GameController.getGameData);

GameRouter.get('/cities/',                              GameController.getAllGameCities);
GameRouter.get('/cities/:cityId',                       GameController.getGameCityById);

GameRouter.get('/cities/:cityId/products/',             GameController.getAllGameCityProducts);
GameRouter.get('/cities/:cityId/products/:productId',   GameController.getGameCityProductById);

GameRouter.put('/cities/:cityId/trade',                 GameController.doTrade);   

GameRouter.get('/products/',                            GameController.getAllProducts);
GameRouter.get('/products/:productId',                  GameController.getProductById);

GameRouter.get('/truck/',                               GameController.getTruckInfo)
GameRouter.post('/truck/',                              GameController.changeProductStorage)

GameRouter.get('/blocks',                               GameController.getGroupRentedBlocks);
GameRouter.post('/blocks',                              GameController.rentNewBlocks);
GameRouter.post('/blocks/sublet',                       GameController.subletBlocks);

export default GameRouter;