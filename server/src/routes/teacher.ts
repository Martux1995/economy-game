import { Router } from 'express';

import AuthController from '../controllers/auth';
import TeacherController from '../controllers/teacher';

const TeacherRouter = Router();

TeacherRouter.use(AuthController.checkAuth, AuthController.isTeacher);

TeacherRouter.get('/games',                     TeacherController.getGames);
TeacherRouter.get('/games/:gameId',             TeacherController.getGameData);

TeacherRouter.get('/cities',                    TeacherController.getCities);
TeacherRouter.get('/cities/:cityId',            TeacherController.getCityDataById);
TeacherRouter.post('/cities/:cityId',           TeacherController.updateCityData)

TeacherRouter.get('/cities/:cityId/products',   TeacherController.getCityProducts);
TeacherRouter.post('/cities/:cityId/products',  TeacherController.updateProduct);

export default TeacherRouter;