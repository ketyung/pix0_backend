import { Router, Response} from 'express';
import * as paths from './paths';
import * as c from './ds/collection';
import * as cm from './ds/collection_media';
import * as cmg from './ds/collection_minter_group';
import * as toff from './ds/token_offer';
import { obtainJwtToken } from './utils/jwt';

const completion = (res : Response, data? : any, error? : Error) =>{

    if ( error !== undefined) {
        res.status(400).json({error:  "Error!", details :  error ? error.message : "404"});
    }
    else {

        res.status(200).json(data);
    }
}


process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

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
.get(paths.GET_COLLECTIONS_BY_STATUS, async (_req, res)=>{

    let data  = await c.getCollectionsByStatus(_req.params.status, 
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
.get(paths.DELETE_COLLECTION, async (req, res)=>{
    

    await c.deleteCollection(req.params.collection_id, req.params.creator, (e, s)=>{
        completion(res, s, e);
    });
   
})

.post(paths.ADD_COLLECTION_MEDIA, async (req, res)=>{
    
    await cm.addCollectionMedia(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
})
.post(paths.UPDATE_COLLECTION_MEDIA, async (req, res)=>{
    
    await cm.updateCollectionMedia(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
})
.get(paths.DELETE_COLLECTION_MEDIA, async (req, res)=>{
    
    await cm.deleteCollectionMedia(req.params.media_id, req.params.created_by, (e, s)=>{
        completion(res, s, e);
    });
   
})
.get(paths.RANDOM_MEDIA_FOR_MINTING, async (req, res)=>{
    
    await cm.randomMediaForMinting(req.params.collection_id, req.params.minted_by, (e, s)=>{
        completion(res, s, e);
    });
   
})
.get(paths.AVAILABLE_MINT_COUNT, async (req, res)=>{
    
    await cm.availableMintCount(req.params.collection_id, (e, s)=>{
        completion(res, s, e);
    });
   
})
.get(paths.REMOVE_MINT_INFO, async (req, res)=>{
    
    await cm.removeMintInfoOf(req.params.media_id, req.params.minted_by, (e, s)=>{
        completion(res, s, e);
    });
   
})
.get(paths.GET_COLLECTION_MEDIA_BY, async (_req, res)=>{

    let data  = await cm.getCollectionMediaBy(
        _req.params.collection_id, _req.params.created_by,
        parseInt(_req.params.offset), parseInt(_req.params.limit));
    return res.json(data);
})
.get(paths.GET_COLLECTION_MEDIA_COUNT_BY, async (_req, res)=>{

    let data  = await cm.getCollectionMediaCountBy(_req.params.collection_id, _req.params.created_by);
    return res.json(data);
})
.get(paths.GET_ONE_COLLECTION_MEDIA, async (_req, res)=>{

    let data : any = await cm.getOneCollectionMedia(
        _req.params.collection_id);
    return res.json(data);
})
.post(paths.ADD_COLLECTION_MINTER_GROUP, async (req, res)=>{
    
    await cmg.addMinterGroup(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
})
.post(paths.ADD_MINTERS_TO_GROUP, async (req, res)=>{
    
    await cmg.addMintersToGroup(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
})
.post(paths.ADD_OFFER, async (req, res)=>{
    
    await toff.addOffer(req.body, (e, s)=>{
        completion(res, s, e);
    });
   
})
.get(paths.DELETE_OFFER_BY, async (req, res)=>{
    
    await toff.deleteOfferBy(req.params.offer_id, (e, s)=>{
        completion(res, s, e);
    });
   
})

.get(paths.GET_OFFERS, async (_req, res)=>{

    let data  = await toff.getOffersBy(
        parseInt(_req.params.type),
        _req.params.destination,
        parseInt(_req.params.offset), parseInt(_req.params.limit) );
    return res.json(data);
})
.get(paths.CHECK_HAS_OFFER, async (_req, res)=>{

    let data  = await toff.hasOffer(_req.params.token_id, 
        parseInt(_req.params.type), _req.params.destination  );
    return res.json(data);
})

;




export default routes;