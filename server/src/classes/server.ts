import express from 'express';
import http from 'http';
//import https from 'https';
//import fs from 'fs'

export default class Server {

    public app: express.Application;

    private server:http.Server;

    constructor () {
        this.app = express();
        // try { 
        //     const serverOptions = {
        //         key: fs.readFileSync(`${process.env.SSL_KEY}`, 'utf8'),
        //         cert: fs.readFileSync(`${process.env.SSL_CERT}`, 'utf8')
        //     };
        //     this.server = https.createServer(serverOptions, this.app);
        // } catch (e) {
            // console.log( process.env.NODE_ENV === "production" ? e.message : e );
            this.server = http.createServer(this.app);
        // }
    }

    getServer() {
        return this.server;
    }

    start( cb: Function) {
        this.server.listen(process.env.PORT, cb());
        
    }
}