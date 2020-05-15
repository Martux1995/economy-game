import Express, { Request, Response } from 'express';

import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

import Server from './classes/server';

import ApiRouter from './apiRoutes';
import createWebSocketServer from './middleware/webSocket';

dotenv.config();

const server = new Server();

// BODY PARSER
//server.app.use( bodyParser.urlencoded({extended: true}) );
server.app.use( bodyParser.json() );

// ENABLE CORS
server.app.use( cors({ origin: true, credentials: true}))

// Carpeta Static y Views
server.app.set('view engine', 'ejs');
server.app.set('views', path.join(__dirname, '../view'));
server.app.use(Express.static(path.join(__dirname, '../view')));

/*
server.app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", '0');
  next();
})*/

// RUTAS API
server.app.use('/api', ApiRouter);

// RUTA FRONT (POR SI SE HACE SEPARADO O SE USA ANGULAR)
server.app.all('*', (req : Request, res: Response) => {
  res.render('index');
});

const serverInit = server.start((err:any) => {
  if (process.env.NODE_ENV != 'production')
    console.log(err || `Server ready in development mode on port ${process.env.PORT}.`);
});

const io = createWebSocketServer(serverInit);