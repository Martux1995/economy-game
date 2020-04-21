import { Router } from 'express'

import GameController from '../controllers/game'

const GameRouter = Router();

GameRouter.get('/', GameController.getAllGames);
GameRouter.get('/:gameId', GameController.getGameById);
//GameRouter.post('/:gameId/cities/:cityId', GameController.updateCity);
//GameRouter.put('/:gameId/cities/', GameController.createCity);
//GameRouter.delete('/:gameId/cities/:cityId', GameController.deleteCity);

GameRouter.get('/:gameId/cities/', GameController.getAllGameCities);
GameRouter.get('/:gameId/cities/:cityId', GameController.getGameCityById);
//GameRouter.post('/:gameId/cities/:cityId', GameController.updateCity);
//GameRouter.put('/:gameId/cities/', GameController.createCity);
//GameRouter.delete('/:gameId/cities/:cityId', GameController.deleteCity);

GameRouter.get('/:gameId/cities/:cityId/products/', GameController.getAllGameCityProducts);
GameRouter.get('/:gameId/cities/:cityId/products/:productId', GameController.getGameCityProductById);
//GameRouter.post('/:gameId/cities/:cityId/products/:productId', GameController.updateCityProduct);
//GameRouter.put('/:gameId/cities/:cityId/products/', GameController.addCityProduct);
//GameRouter.delete('/:gameId/cities/:cityId/products/:productId', GameController.deleteCityProduct);

GameRouter.get('/:gameId/products/', GameController.getAllProducts);
GameRouter.get('/:gameId/products/:productId', GameController.getProductById);
//GameRouter.post('/:gameId/products/:productId', GameController.updateProduct);
//GameRouter.put('/:gameId/products/', GameController.createProduct);
//GameRouter.delete('/:gameId/products/:productId', GameController.deleteProduct);

GameRouter.get('/:gameId/players/', GameController.getAllplayers);
GameRouter.get('/:gameId/players/:playerId', GameController.getPlayerById);
//GameRouter.post('/:gameId/players/:playerId', GameController.updatePlayer);
//GameRouter.put('/:gameId/players/', GameController.addPlayer);
//GameRouter.delete('/:gameId/players/:playerId', GameController.deletePlayer);

GameRouter.get('/:gameId/groups/', GameController.getAllGroups);
GameRouter.get('/:gameId/groups/:groupId', GameController.getGroupById);
//GameRouter.post('/:gameId/groups/:groupId', GameController.updateGroup);
//GameRouter.put('/:gameId/groups/', GameController.createGroup);
//GameRouter.delete('/:gameId/groups/:groupId', GameController.deleteGroup);

GameRouter.get('/:gameId/groups/:groupId/trades',           GameController.getGroupCityTrades);
GameRouter.get('/:gameId/groups/:groupId/trades/:tradeId',  GameController.getGroupCityTradeById);

GameRouter.put('/:gameId/play/:groupId/trade/:cityId', GameController.doTrade);   

export default GameRouter;