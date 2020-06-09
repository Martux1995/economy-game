import { Router } from 'express'

import DataController from '../controllers/data'
import AuthController from '../controllers/auth';

const DataRouter = Router();

DataRouter.get('/time',                 DataController.getServerTime);

DataRouter.get('/carreras/',                         AuthController.checkAuth, DataController.getAllCarreras);
DataRouter.get('/carreras/:idCarrera',               AuthController.checkAuth, DataController.getCarreraById);
DataRouter.put('/carreras/',                         AuthController.checkAuth, AuthController.isAdmin, DataController.createCarrera);
DataRouter.post('/carreras/:idCarrera',              AuthController.checkAuth, AuthController.isAdmin, DataController.updateCarrera);
DataRouter.post('/carreras/:idCarrera/desactivate',  AuthController.checkAuth, AuthController.isAdmin, DataController.desactivateCarrera);
DataRouter.post('/carreras/:idCarrera/activate',     AuthController.checkAuth, AuthController.isAdmin, DataController.activateCarrera);


DataRouter.get('/roles/',        AuthController.checkAuth, DataController.getAllRoles);
DataRouter.get('/roles/:idRol',  AuthController.checkAuth, DataController.getRolById);

export default DataRouter;
