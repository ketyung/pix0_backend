import express from 'express';
import routes from './routes';
import { getClientIp } from './utils';
import { decodeJwtToken, isAllowedUser } from './utils/jwt';
//const bodyParser = require('body-parser');
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


const isValidJwtToken = (token : string) : { valid : boolean, error? : string}=>{

   
    let decoded_token = decodeJwtToken(token);

    if ( decoded_token && isAllowedUser(decoded_token.user)) {
        return { valid : true };
    }

    return { valid : false, error :"Invalid token"};

}

const checkAccess = async (req : express.Request, res : express.Response, _next : express.NextFunction) =>{

    if ( req.path.indexOf("get_jwt") !== -1 ) {
        _next();
        return;
    }

    if (req.headers !== undefined ) {

        let token = req.headers['access_token'];
        
        let aTok = (token instanceof Array) ? token[0] : token;
        
        let valid = isValidJwtToken(aTok);
        if ( valid.valid ) {
            _next();
        }
        else {

            res.status(401).json({error: "Unauthorized!", message : valid.error}).end();
        }
    }
    else {
        res.status(422).json(
            process.env.NODE_ENV === "production" ?
            {status : "unauthorized"} :
            {error: "Undefined cookies!", status : "unauthorized"});
    }
    
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
        this.server.use(express.json({limit: '50mb'}));
        this.server.use(express.urlencoded({limit: '50mb'}));
      
        /*
        this.server.use( bodyParser.json({limit: '50mb'}) );
        this.server.use(bodyParser.urlencoded({
            limit: '50mb',extended: true, parameterLimit:50000
        }));
        */

        this.server.use(cookieParser());
        this.server.use (logger);
        this.server.use(mongoSanitize());

        if (process.env.REQUIRE_TO_CHECK_ACCESS) {
            this.server.use(checkAccess);
        }
         
      
    }

    routes() {
        this.server.use(routes);
    }
}

export default new App().server;