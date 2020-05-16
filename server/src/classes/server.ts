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
        try {
            if (process.env.NODE_ENV == "production") {
                
                const serverOptions = {
                    key: fs.readFileSync(`${process.env.SSL_KEY}`, 'utf8'),
                    cert: fs.readFileSync(`${process.env.SSL_CERT}`, 'utf8')
                };
                
                return https.createServer(serverOptions, this.app).listen( port, cb() );
                
            } else {
                return http.createServer(this.app).listen(port, cb());
            }
        } catch (e) {
            return http.createServer(this.app).listen(port, cb());
        }
    }
}