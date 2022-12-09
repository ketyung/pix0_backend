import { MongoClient, ObjectID } from "./collection";
import { DB } from "./collection";
import { CollectionMedia } from "../models";
import { MONGO_URI } from "./config";
import * as collection from './collection';
import { randomInt } from "../utils";



const COLLECTION_MEDIA = "xnft_collection_media";

async function internalUpdateCollectionMedia(
    media : CollectionMedia, 
    media_id : string,
    completion?: (err?: Error, res? :string )=>void){


    const client = new MongoClient(MONGO_URI);

    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
       
        media.date_updated = new Date();

        const query = { _id : ObjectID(media_id) };
        

        await ss.updateOne(query, { $set: media }, async (_err? : Error, _res? : string)=> {
        
            await client.close();
       
            if ( completion)
                completion(_err, _res);
        });
    }
    finally {
        await client.close();
    }

}



/**
 * Add a collection media to the specified collection with collection
 * id and the creator. A collection media must have a unique name within
 * the collection
 * @param media - a struct of {media: CollectionMedia, collection_id : string, creator : string} 
 * @param completion 
 */
 export async function addCollectionMedia(
    media : {media : CollectionMedia,
    collection_id : string, 
    creator : string}, 
    completion?: (err?: Error, res? : CollectionMedia)=>void){


    const client = new MongoClient(MONGO_URI);
   
    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
        
        if ( !await collection.collectionExists(media.collection_id, media.creator)) {

            if ( completion ) {

                completion(new Error(`The specified collection does NOT exist`));
                return;
            }
        }


       
        // check if the same name exists 
        if ( await collectionMediaExists(media.collection_id, media.media.name)) {

            if ( completion ){
                completion(new Error(`Media collection ${media.media.name} already exists!!`));
                return; 
            }
        }

        let _media = media.media;
        _media.collection_id = media.collection_id;
        _media.created_by = media.creator;
        _media.date_created = new Date();
        _media.date_updated = new Date();

        await ss.insertOne(_media, async (err? : Error, _res? : string)=> {
         
            await client.close();

            await collection.updateCollectionMediaCount(media.collection_id, media.creator);
     
            if ( completion ){
                completion(err, _media);
            }
        });

    }
    finally {
        await client.close();
    }
}



/**
 * Update a collection media to the specified collection with collection
 * id and the creator
 * @param media - a struct of {media: CollectionMedia, collection_id : string, creator : string} 
 * @param completion 
 */
 export async function updateCollectionMedia(
    media : {media : CollectionMedia,
    collection_id : string, 
    creator : string}, 
    completion?: (err?: Error, res? : CollectionMedia)=>void){


    const client = new MongoClient(MONGO_URI);

    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
        
        if ( !await collection.collectionExists(media.collection_id, media.creator)) {

            if ( completion ) {

                completion(new Error(`The specified collection does NOT exist`));
                return;
            }
        }

        
        if ( !await collectionMediaExists(media.collection_id, media.media.name)) {

            if ( completion ){
                completion(new Error(`Media collection ${media.media.name} does NOT exist!!`));
                return; 
            }
        }

        let _media = media.media;
        _media.date_updated = new Date();

        const query = { collection_id : media.collection_id , name : media.media.name,
        created_by : media.creator };
        

        await ss.updateOne(query, { $set: _media }, async (err? : Error, _res? : string)=> {
        
            await client.close();
       
            if ( completion ){
                completion(err, _media);
            }
        });
    }
    finally {
        await client.close();
    }

}


/**
 * Method used to remove the mint info if not successfully minted
 * @param media_id 
 * @param minted_by 
 */
export async function removeMintInfoOf( media_id : string, minted_by : string,
    completion?: (err?: Error, removed? : boolean)=>void ) {

    const client = new MongoClient(MONGO_URI);
  
    try {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
        const query = { _id : ObjectID(media_id)  };
        let media = await ss.findOne(query);
    
        if ( media !== null && media.mint_info !== undefined && 
            media.mint_info.minted_by === minted_by) {

            media.mint_info = undefined;

            await internalUpdateCollectionMedia(media, media_id,
                (e, r)=>{
                
                if ( completion ){

                    if (e){
                        completion(e, false);
                    }
                    else {

                        completion(undefined, true);
                    }
                }
            });

        }  
        else {

            if (completion)
                completion( new Error('No such collection media!'));
        }        
    }
    finally {
        await client.close();
    }
    

}



export async function randomMediaForMinting ( collection_id : string,
    minted_by? : string,  completion?: (err?: Error, res? : CollectionMedia)=>void){
    
    const client = new MongoClient(MONGO_URI);
  
    try {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);

        const query = { collection_id : collection_id , mint_info: { $exists: false }  };

      
        let avail_medias = await ss.find(query).toArray();
        
        if ( avail_medias !== null) {

            if ( avail_medias.length > 0 ) {

                let r = randomInt(0,avail_medias.length -1 );
                let rmedia = avail_medias[r];

                rmedia.mint_info = {
                    minted_by : minted_by,
                    date_minted : new Date(),
                    minted : false, 
                };

                // mark it with a temporay mint info
                // so a concurrent next mint will not retrieve 
                // the same mint
                await internalUpdateCollectionMedia(rmedia, rmedia._id);

                if ( completion ){
                    completion(undefined, rmedia);
                }
            }
            else {

                if (completion) {

                    completion (new Error('No available media for minting in the collection'));
                }
            }

        }
        else {

            if (completion) {
                completion (new Error('No available media for minting in the collection'));
            }
    
        }
    }
    finally {
        await client.close();
    }
    
}

/*
export async function resetAllMintInfo ( collection_id : string,
    completion?: (err?: Error, res? : {done? : boolean})=>void){
    
    const client = new MongoClient(MONGO_URI);
  
    try {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
        const query = { collection_id : collection_id } ;//,mint_info: {$type: 'undefined'} };

      
        let avail_medias = await ss.find(query).toArray();

        for (var r=0; r < avail_medias.length; r++){

            let rmedia = avail_medias[r];
            rmedia.mint_info = undefined;

            await internalUpdateCollectionMedia(rmedia, rmedia._id);

        }

        if ( completion)
            completion(undefined, {done : true});
    }
    finally {
        await client.close();
    }
    
}*/


/**
 * @param media - a struct of {media: CollectionMedia, collection_id : string, creator : string} 
 * @param completion 
 */
 export async function deleteCollectionMedia(
    media_id : string, 
    creator : string, 
    completion?: (err?: Error, res?: {deleted : boolean})=>void){


    const client = new MongoClient(MONGO_URI);

    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
    
        const query = { _id : ObjectID(media_id) , 
         created_by : creator };
        
        await ss.deleteOne(query,  async (err? : Error, _res? : string)=> {
        
            await client.close();
       
            if ( completion ){
                completion(err, { deleted :true } );
            }
        });
    }
    finally {
        await client.close();
    }

}


/**
 * @param media - a struct of {media: CollectionMedia, collection_id : string, creator : string} 
 * @param completion 
 */
 export async function deleteCollectionMediaBy(
    collection_id : string, 
    completion?: (err?: Error, res?: {deleted : boolean})=>void){


    const client = new MongoClient(MONGO_URI);

    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
    
        const query = { collection_id : collection_id };
        
        await ss.deleteMany(query, async (err? : Error, _res? : any )=> {
        
            await client.close();
       
            if ( completion ){
                completion(err, _res );
            }
        });
    }
    finally {
        await client.close();
    }

}




export async function getCollectionMediaBy(
    collection_id : string, created_by : string,
    offset? : number, limit? : number ) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
      
        const query = { created_by : created_by, collection_id : collection_id };

        const rs = await ss
                .find(query)
                .sort ( { date_updated : -1})
                .skip(offset ?? 0)
                .limit(limit ?? 10)
                .toArray();

        const t = await ss.count(query);

        return {res : rs, total : t, offset : offset, limit : limit};

    } 
    finally {
        await client.close();
    }
}

export async function getOneCollectionMedia(
    collection_id : string ) : Promise <CollectionMedia|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
      
        const query = { collection_id : collection_id };

        const rs = await ss
                .findOne(query);

        return rs; 
    } 
    finally {
        await client.close();
    }
}


export async function getCollectionMediaCountBy(
    collection_id : string, created_by : string) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
      
        const query = { created_by : created_by, collection_id : collection_id };

        const t = await ss.count(query);
        return {count : t };

    } 
    finally {
        await client.close();
    }
}


/*
 * Internal method for checking if a collection exists
 * by the specified id and the creator
*/
async function collectionMediaExists ( collection_id : string, 
    name : string ): Promise<boolean>{
    
    const client = new MongoClient(MONGO_URI);
  
    try {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MEDIA);
        const query = { collection_id : collection_id, name : name  };

        let media = await ss.findOne(query);
    
        return (media !== null && media !== undefined);          
    }
    finally {
        await client.close();
    }
    
}





