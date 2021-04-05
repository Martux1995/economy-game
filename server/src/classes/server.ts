import express from 'express';
import http from 'http';
import morgan from 'morgan';

export default class Server {

    public app: express.Application;

    private server:http.Server;

    constructor () {
        this.app = express();
        this.server = http.createServer(this.app);
        if (process.env.NODE_ENV != 'production')
            this.app.use(morgan('dev'));
    }

    getServer() {
        return this.server;
    }

    start(cb: Function) {
        this.server.listen(process.env.PORT, cb());
    }
}