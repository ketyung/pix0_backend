import express from 'express';
import routes from './routes';
import { getClientIp } from './utils';
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const cors = require('cors');

/**
 * Testing logger only
 * @param req 
 * @param _res 
 * @param _next 
 */
const logger = (req : express.Request, _res : express.Response, _next : express.NextFunction) =>{

    console.log( new Date(), "access to", req.path, "from", getClientIp(req));
    _next();
}


const allowlist = ['http://localhost:3000', 'http://localhost:3001'];

const corsOptionsDelegate = (req : express.Request, callback? : ( err? : Error, options? : {origin : boolean})=> void ) => {

  let orig = req.header('Origin');
  let inAllowed =( orig !== undefined && orig.indexOf("http://localhost") !== -1)  || allowlist.indexOf(orig) !== -1;
  
  let corsOptions =  { origin:  inAllowed }; 
  if ( callback)
    callback(undefined, corsOptions) // callback expects two parameters: error and options

}


const setHeaderAccessCtrls = (_req : express.Request, res : express.Response, _next : express.NextFunction) => {

    let orig =  _req.headers.origin;
    let inAllowed =( orig !== undefined && orig.indexOf("http://localhost") !== -1)  || allowlist.indexOf(orig) !== -1;
    if ( inAllowed ) {
        res.header("Access-Control-Allow-Origin", orig);
    }

    res.header("Access-Control-Allow-Credentials", 'true');
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    _next();
}


class App {
    public server;

    constructor() {
        this.server = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        //this.server.options('*', cors());

        this.server.use(cors(corsOptionsDelegate));
        this.server.use (setHeaderAccessCtrls);
        this.server.use(express.json());
        this.server.use(bodyParser.urlencoded({ extended: true }));
        this.server.use(bodyParser.json());
        this.server.use(cookieParser());
        this.server.use (logger);
        this.server.use(mongoSanitize());
      
    }

    routes() {
        this.server.use(routes);
    }
}

export default new App().server;