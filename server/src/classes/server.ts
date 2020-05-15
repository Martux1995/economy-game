import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs'

export default class Server {

    public app: express.Application;

    constructor () {
        this.app = express();
    }

    start( cb: Function) {

        const port = process.env.PORT;

        if (process.env.NODE_ENV == "production") {

            const serverOptions = {
                key: fs.readFileSync(`${process.env.KEY_PATH}${process.env.KEY_FILE}`, 'utf8'),
                cert: fs.readFileSync(`${process.env.CERT_PATH}${process.env.CERT_FILE}`, 'utf8')
            };

            return https.createServer(serverOptions, this.app).listen( port, cb() );

        } else {
            return http.createServer(this.app).listen(port, cb());
        }

    }
}