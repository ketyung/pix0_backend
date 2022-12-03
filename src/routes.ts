import { Router, Response} from 'express';
import * as paths from './paths';
import * as c from './ds/collection';
import { obtainJwtToken } from './utils/jwt';

const completion = (res : Response, data? : any, error? : Error) =>{

    console.log("res::@completion:", error, data);
    
    if ( error !== undefined) {
        res.status(400).json({error:  "Error!", details :  error ? error.message : "404"});
    }
    else {

        res.status(200).json(data);
    }
}


const routes = Router();

routes
.get(paths.ROOT, (_req, res) => {
    return res.json({ message: 'Welcome To The REST API Endpoint Of Pix0', 
    date : new Date().toLocaleString() });
})
.get(paths.GET_COLLECTION, async (_req, res)=>{

    let data  = await  c.getCollection(_req.params.name, _req.params.created_by);
    return res.json(data);
})
.get(paths.GET_COLLECTION_BY_ID, async (_req, res)=>{

    let data  = await c.getCollectionBy(_req.params.creator, _req.params.id);
    return res.json(data);  
})
.get(paths.GET_COLLECTIONS_BY, async (_req, res)=>{

    let data  = await c.getCollectionsBy(_req.params.created_by, 
        parseInt(_req.params.offset), parseInt(_req.params.limit));
    return res.json(data);
    
})
.get(paths.OBTAIN_JWT, async (_req, res)=>{

    let data  = obtainJwtToken({email : _req.params.email, pass : _req.params.pass});
    return res.json({token : data});
    
})

.post(paths.ADD_NEW_COLLECTION, async (req, res)=>{
    
    // curl -d '{"name":"The Test Collection", "created_by":"ketyung@gmail.com", "media_list":[{"layer_num":0, "name":"BG0", "medias":[{"type":2,"value":"Test 1"},{"type":2,"value":"Test 2"}] }]}' -H "Content-Type: application/json" http://127.0.0.1:3333/add_collection 

    await c.addCollection(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
})
.post(paths.UPDATE_COLLECTION, async (req, res)=>{
    
    // curl -d '{"id": "638036e50fcb88dd343481d8", "name":"The Test 33x Collection", "created_by":"ketyung@gmail.com", "media_list":[{"layer_num":0, "name":"BG0", "medias":[{"type":2,"value":"Test 1"},{"type":2,"value":"Test 2"},{"type":2,"value":"Test 3"}] }]}' -H "Content-Type: application/json" http://127.0.0.1:3333/update_collection 

    await c.updateCollection(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
})
.post(paths.ADD_COLLECTION_MEDIA, async (req, res)=>{
    
    await c.addCollectionMedia(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
})
.post(paths.UPDATE_COLLECTION_MEDIA, async (req, res)=>{
    
    await c.updateCollectionMedia(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
})
.get(paths.GET_COLLECTION_MEDIA_BY, async (_req, res)=>{

    let data  = await c.getCollectionMediaBy(
        _req.params.collection_id, _req.params.created_by,
        parseInt(_req.params.offset), parseInt(_req.params.limit));
    return res.json(data);
})
.get(paths.GET_COLLECTION_MEDIA_COUNT_BY, async (_req, res)=>{

    let data  = await c.getCollectionMediaCountBy(_req.params.collection_id, _req.params.created_by);
    return res.json(data);
})
;




export default routes;