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
})
.get(paths.GET_COLLECTIONS_BY, async (_req, res)=>{

    let data  = c.getCollectionsBy(_req.params.created_by);
    completion(res, data);
})

.post(paths.ADD_NEW_COLLECTION, async (req, res)=>{
    
    // curl -d '{"name":"The Test Collection", "created_by":"ketyung@gmail.com", "media_list":[{"layer_num":0, "name":"BG0", "medias":[{"type":2,"value":"Test 1"},{"type":2,"value":"Test 2"}] }]}' -H "Content-Type: application/json" http://127.0.0.1:3333/add_collection 

    await c.addCollection(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
});




export default routes;