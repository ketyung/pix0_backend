import { Router, Response} from 'express';
import * as paths from './paths';
import * as s from './ds/shortener';

const completion = (res : Response, data? : any, error? : Error) =>{

    if ( data === undefined && error!== undefined) {
        res.status(400).json({error:  "Not found!", details :  error ? error.message : "404"});
    }
    else {

        res.status(200).json(data);
    }
}


const routes = Router();

routes
.get(paths.ROOT, (_req, res) => {
    return res.json({ message: 'Welcome To The REST API Endpoint', date : new Date().toLocaleString() });
})
.get(paths.SHORTEN_IT, async (_req, res)=>{

    await s.obtainShortUri(_req.params.value, (_e, s)=>{
        completion(res,s, _e);
    });
})
.get(paths.SHORTEN_ITV, async (_req, res)=>{

    await s.obtainShortUriOnly(_req.params.value, (_e, s)=>{
        completion(res,s, _e);
    });
});





export default routes;