import { Router } from 'express'

import AuthController from '../controllers/auth'

const AuthRouter = Router();

AuthRouter.post('/login', AuthController.loginUser);

AuthRouter.post('/logout', AuthController.checkAuth, AuthController.logoutUser);

// Los tokens tienen duración de 1 hora, pero hay que renovarlos cada 30 min por si acaso.
AuthRouter.post('/renew', AuthController.checkAuth, AuthController.renewToken);

AuthRouter.get('/validate', AuthController.checkAuth, (req, res) => res.json({msg: "Token válido"}));

export default AuthRouter;