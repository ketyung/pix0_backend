import { Router, Response} from 'express';
import * as paths from './paths';
import * as c from './ds/collection';

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
.get(paths.GET_COLLECTION, async (_req, res)=>{

    let data  = c.getCollection(_req.params.name, _req.params.created_by);
    completion(res, data);
});




export default routes;