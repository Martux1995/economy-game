import { Router } from 'express'

import Auth from '../controllers/auth';

import AdminGameController from '../controllers/adminGame';
import AdminGeneralController from '../controllers/adminGeneral';
import AuthController from '../controllers/auth';

const AdminRouter = Router();

AdminRouter.use(Auth.checkAuth);

// RUTAS ADMIN GENERAL

// AdminRouter.get('/teachers',                    Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.getAllGames);
// AdminRouter.get('/teachers/:teacherId',         Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.getGameById);
// AdminRouter.post('/teachers/:teacherId',        Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.updateCity);
// AdminRouter.put('/teachers/',                   Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.createCity);
// AdminRouter.delete('/teachers/:teacherId',      Auth.isTeacher, (req, res) => res.json({ok: false, msg:"To be implemented"}) );//GameController.deleteCity);

AdminRouter.put('/students/',                   Auth.isAdmin,   AdminGeneralController.addNewStudents);
AdminRouter.post('/students/:studentId',        Auth.isAdmin,  AdminGeneralController.updateStudent);
// AdminRouter.put('/:gameId/groups',           Auth.isAdmin,   AdminGameController.addNewGroups);
AdminRouter.get('/users',                       Auth.isAdmin, AdminGeneralController.getAllUsers);
AdminRouter.post('/users/:userId/desactivate',  Auth.isAdmin, AdminGeneralController.desactivateUser);
AdminRouter.post('/users/:userId/activate',     Auth.isAdmin, AdminGeneralController.activateUser);
AdminRouter.post('/users/generate',             Auth.isAdmin, AdminGeneralController.createAccounts);
AdminRouter.put('/teachers/',                   Auth.isAdmin,   AdminGeneralController.addNewTeacher);
AdminRouter.post('/teachers/:teacherId',        Auth.isAdmin,  AdminGeneralController.updateTeacher);

// RUTAS ADMIN GAME

AdminRouter.put('/games/',                      Auth.isAdmin, AdminGameController.createNewGame);
AdminRouter.get('/games',                       Auth.isAdmin, AdminGameController.getAllGames);
AdminRouter.post('/games/:gameId/finish',       Auth.isAdmin, AdminGameController.finishGameById);
AdminRouter.post('/games/:gameId/begin',        Auth.isAdmin, AdminGameController.beginGameById);
AdminRouter.get('/games/:gameId',               Auth.isAdmin, AdminGameController.getDataGameById);
AdminRouter.get('/games/:gameId/players',       Auth.isAdmin, AdminGameController.getPlayersByGameId);
AdminRouter.get('/games/:gameId/groups',        Auth.isAdmin, AdminGameController.getGroupsByGameId);
AdminRouter.get('/games/:gameId/cities',        Auth.isAdmin, AdminGameController.getCitiesByGameId);
AdminRouter.get('/games/:gameId/products',      Auth.isAdmin, AdminGameController.getProductsByGameId);
// AdminRouter.get('/games/:gameId/record',     Auth.isAdmin, AdminGameController.getRecordByGameId);
AdminRouter.get('/games/:gameId/students/notPlayer',    Auth.isAdmin, AdminGameController.getAllStudentsNotPlayer);
AdminRouter.put('/games/:gameId/students/:studentId',   Auth.isAdmin, AdminGameController.createStudentPlayer);
AdminRouter.put('/games/:gameId/students/',     Auth.isAdmin, AdminGameController.createNewPlayer);

AdminRouter.post('/games/:gameId/groups/:groupId/students/:playerId/', Auth.isAdmin, AdminGameController.addPlayerToGroup);

AdminRouter.post('/games/players/:playerId/desactivate',    Auth.isAdmin, AdminGameController.desactivatePlayerByGame);
AdminRouter.post('/games/players/:playerId/activate',       Auth.isAdmin, AdminGameController.activatePlayerByGame);
AdminRouter.post('/games/groups/:groupId/desactivate',      Auth.isAdmin, AdminGameController.desactivateGroupByGame);
AdminRouter.post('/games/groups/:groupId/activate',         Auth.isAdmin, AdminGameController.activateGroupByGame);
AdminRouter.post('/games/cities/:cityId/desactivate',       Auth.isAdmin, AdminGameController.desactivateCityByGame);
AdminRouter.post('/games/cities/:cityId/activate',          Auth.isAdmin, AdminGameController.activateCityByGame);
AdminRouter.post('/games/products/:productId/desactivate',  Auth.isAdmin, AdminGameController.desactivateProductByGame);
AdminRouter.post('/games/products/:productId/activate',     Auth.isAdmin, AdminGameController.activateProductByGame);

AdminRouter.get('/games/:gameId/reports',           Auth.isAdmin, AdminGameController.getReport);
AdminRouter.get('/games/:gameId/reports/groups',    Auth.isAdmin, AdminGameController.getAllGroupExcelReport);
AdminRouter.post('/games/:gameId/reports/groups',    Auth.isAdmin, AdminGameController.sendAllGroupExcelReport);


// RUTAS ADMIN GENERAL

AdminRouter.get('/general/carrers',                             Auth.isAdmin, AdminGeneralController.getAllCarrers);
AdminRouter.get('/general/carrers/:carrerId',                   Auth.isAdmin, AdminGeneralController.getCarrerById);
AdminRouter.get('/general/teachers',                            Auth.isAdmin, AdminGeneralController.getAllTeachers);
AdminRouter.get('/general/teachers/:teacherId',                 Auth.isAdmin, AdminGeneralController.getTeacherById);
AdminRouter.post('/general/teachers/:teacherId/desactivate',    Auth.isAdmin, AdminGeneralController.desactivateTeacher);
AdminRouter.post('/general/teachers/:teacherId/activate',       Auth.isAdmin, AdminGeneralController.activateTeacher);
AdminRouter.get('/general/students',                            Auth.isAdmin, AdminGeneralController.getAllStudents);
AdminRouter.get('/general/students/:studentId',                 Auth.isAdmin, AdminGeneralController.getStudentById);
AdminRouter.post('/general/students/:studentId/desactivate',    Auth.isAdmin, AdminGeneralController.desactivateStudent);
AdminRouter.post('/general/students/:studentId/activate',       Auth.isAdmin, AdminGeneralController.activateStudent);

AdminRouter.put('/:gameId/cities/',                             Auth.isAdmin, AdminGameController.createCity);
AdminRouter.put('/:gameId/products/',                           Auth.isAdmin, AdminGameController.createProduct);
AdminRouter.put('/:gameId/groups/',                             Auth.isAdmin, AdminGameController.createGroup);

AdminRouter.post('/:gameId/data/',                              Auth.isAdmin, AdminGameController.updateDataGame);
AdminRouter.post('/:gameId/configuration/',                     Auth.isAdmin, AdminGameController.updateDataConfiguration);


// AdminRouter.get('/:gameId', GameController.getGameById);
// AdminRouter.post('/:gameId/cities/:cityId', GameController.updateCity);
// AdminRouter.delete('/:gameId/cities/:cityId', GameController.deleteCity);

// AdminRouter.get('/:gameId/cities/', GameController.getAllGameCities);
// AdminRouter.get('/:gameId/cities/:cityId', GameController.getGameCityById);
// AdminRouter.post('/:gameId/cities/:cityId', GameController.updateCity);
// AdminRouter.put('/:gameId/cities/', GameController.createCity);
// AdminRouter.delete('/:gameId/cities/:cityId', GameController.deleteCity);

// AdminRouter.get('/:gameId/cities/:cityId/products/', GameController.getAllGameCityProducts);
// AdminRouter.get('/:gameId/cities/:cityId/products/:productId', GameController.getGameCityProductById);
// AdminRouter.post('/:gameId/cities/:cityId/products/:productId', GameController.updateCityProduct);
// AdminRouter.put('/:gameId/cities/:cityId/products/', GameController.addCityProduct);
// AdminRouter.delete('/:gameId/cities/:cityId/products/:productId', GameController.deleteCityProduct);

// AdminRouter.get('/:gameId/products/', GameController.getAllProducts);
// AdminRouter.get('/:gameId/products/:productId', GameController.getProductById);
// AdminRouter.post('/:gameId/products/:productId', GameController.updateProduct);
// AdminRouter.put('/:gameId/products/', GameController.createProduct);
// AdminRouter.delete('/:gameId/products/:productId', GameController.deleteProduct);

// AdminRouter.get('/:gameId/players/', GameController.getAllplayers);
// AdminRouter.get('/:gameId/players/:playerId', GameController.getPlayerById);
// AdminRouter.post('/:gameId/players/:playerId', GameController.updatePlayer);
// AdminRouter.put('/:gameId/players/', GameController.addPlayer);
// AdminRouter.delete('/:gameId/players/:playerId', GameController.deletePlayer);

// AdminRouter.get('/:gameId/groups/', GameController.getAllGroups);
// AdminRouter.get('/:gameId/groups/:groupId', GameController.getGroupById);
// AdminRouter.post('/:gameId/groups/:groupId', GameController.updateGroup);
// AdminRouter.put('/:gameId/groups/', GameController.createGroup);
// AdminRouter.delete('/:gameId/groups/:groupId', GameController.deleteGroup);

// AdminRouter.get('/:gameId/groups/:groupId/trades',           GameController.getGroupCityTrades);
// AdminRouter.get('/:gameId/groups/:groupId/trades/:tradeId',  GameController.getGroupCityTradeById);

export default AdminRouter;