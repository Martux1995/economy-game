import { Router } from 'express'

import DataController from '../controllers/data'
import AuthController from '../controllers/auth';

const DataRouter = Router();

DataRouter.use(AuthController.checkAuth);

DataRouter.get('/carreras/',             DataController.getAllCarreras);
DataRouter.get('/carreras/:idCarrera',   DataController.getCarreraById);
DataRouter.put('/carreras/',             DataController.createCarrera);
DataRouter.post('/carreras/:idCarrera',  DataController.updateCarrera);

DataRouter.get('/roles/',        DataController.getAllRoles);
DataRouter.get('/roles/:idRol',  DataController.getRolById);

export default DataRouter;
