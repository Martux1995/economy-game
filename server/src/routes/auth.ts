import { Router } from 'express'

import AuthController from '../controllers/auth'

const AuthRouter = Router();

AuthRouter.post('/login', AuthController.loginUser);

AuthRouter.post('/logout', AuthController.checkAuth, AuthController.logoutUser);

// Los tokens tienen duración de 1 hora, pero hay que renovarlos cada 30 min por si acaso.
AuthRouter.get('/renew', AuthController.checkAuth, AuthController.renewToken);

export default AuthRouter;