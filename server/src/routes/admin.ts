import { Router } from 'express'

import Auth from '../controllers/auth';

import AdminGameController from '../controllers/adminGame';
import AdminGeneralController from '../controllers/adminGeneral';

const AdminRouter = Router();

AdminRouter.use(Auth.checkAuth);

// RUTAS ADMIN GENERAL

AdminRouter.get('/teachers',               Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.getAllGames);
AdminRouter.get('/teachers/:teacherId',    Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.getGameById);
AdminRouter.post('/teachers/:teacherId',   Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.updateCity);
AdminRouter.put('/teachers/',              Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.createCity);
AdminRouter.delete('/teachers/:teacherId', Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.deleteCity);


// RUTAS ADMIN GAME

//AdminRouter.get('/', GameController.getAllGames);
//AdminRouter.get('/:gameId', GameController.getGameById);
//AdminRouter.post('/:gameId/cities/:cityId', GameController.updateCity);
//AdminRouter.put('/:gameId/cities/', GameController.createCity);
//AdminRouter.delete('/:gameId/cities/:cityId', GameController.deleteCity);

//AdminRouter.get('/:gameId/cities/', GameController.getAllGameCities);
//AdminRouter.get('/:gameId/cities/:cityId', GameController.getGameCityById);
//AdminRouter.post('/:gameId/cities/:cityId', GameController.updateCity);
//AdminRouter.put('/:gameId/cities/', GameController.createCity);
//AdminRouter.delete('/:gameId/cities/:cityId', GameController.deleteCity);

//AdminRouter.get('/:gameId/cities/:cityId/products/', GameController.getAllGameCityProducts);
//AdminRouter.get('/:gameId/cities/:cityId/products/:productId', GameController.getGameCityProductById);
//AdminRouter.post('/:gameId/cities/:cityId/products/:productId', GameController.updateCityProduct);
//AdminRouter.put('/:gameId/cities/:cityId/products/', GameController.addCityProduct);
//AdminRouter.delete('/:gameId/cities/:cityId/products/:productId', GameController.deleteCityProduct);

//AdminRouter.get('/:gameId/products/', GameController.getAllProducts);
//AdminRouter.get('/:gameId/products/:productId', GameController.getProductById);
//AdminRouter.post('/:gameId/products/:productId', GameController.updateProduct);
//AdminRouter.put('/:gameId/products/', GameController.createProduct);
//AdminRouter.delete('/:gameId/products/:productId', GameController.deleteProduct);

//AdminRouter.get('/:gameId/players/', GameController.getAllplayers);
//AdminRouter.get('/:gameId/players/:playerId', GameController.getPlayerById);
//AdminRouter.post('/:gameId/players/:playerId', GameController.updatePlayer);
//AdminRouter.put('/:gameId/players/', GameController.addPlayer);
//AdminRouter.delete('/:gameId/players/:playerId', GameController.deletePlayer);

//AdminRouter.get('/:gameId/groups/', GameController.getAllGroups);
//AdminRouter.get('/:gameId/groups/:groupId', GameController.getGroupById);
//AdminRouter.post('/:gameId/groups/:groupId', GameController.updateGroup);
//AdminRouter.put('/:gameId/groups/', GameController.createGroup);
//AdminRouter.delete('/:gameId/groups/:groupId', GameController.deleteGroup);

//AdminRouter.get('/:gameId/groups/:groupId/trades',           GameController.getGroupCityTrades);
//AdminRouter.get('/:gameId/groups/:groupId/trades/:tradeId',  GameController.getGroupCityTradeById);

export default AdminRouter;