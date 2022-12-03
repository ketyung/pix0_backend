import { MONGO_URI } from "./config";
import { Collection, CollectionMedia } from "../models";

const DB = "xnft_collections";
const COLLECTION = "xnft_collection";
const COLLECTION_MEDIA = "xnft_collection_media";

const { MongoClient, ObjectID } = require("mongodb");

export async function getCollectionsBy(created_by : string
    , offset? : number, limit? : number ) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
      
        const query = { created_by : created_by };

        const rs = 
        await ss
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


export async function getCollection(name : string, created_by : string ) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
      
        const query = { name : name, created_by : created_by };
        const s = await ss.findOne(query);

        return s;

    } 
    finally {
        await client.close();
    }
}

export async function getCollectionBy( creator : string, id : string ) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
      
        const query = { _id : ObjectID(id), created_by : creator };
        const s = await ss.findOne(query);

        return s;

    } 
    finally {
        await client.close();
    }
}


export async function addCollection(collection : Collection,
    completion?: (err?: Error, res? : Collection)=>void){


    const client = new MongoClient(MONGO_URI);
   
    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
        
        let _collection = await getCollection(collection.name, collection.created_by);

        if (_collection === null || _collection === undefined) {

            collection.date_created = new Date();
            collection.date_updated = collection.date_created;

            await ss.insertOne(collection, async (err? : Error, _res? : string)=> {
         
                await client.close();
         
                if ( completion ){
                    completion(err, collection);
                }
            });

        }
        else {

            if (completion)
            {
                completion(new Error(`Collection ${collection.name} already exists!`));
            }
        }


    }
    finally {
        await client.close();
    }
}


export async function updateCollection(
    collection : Collection,
    completion?: (err?: Error, res? : Collection)=>void){


    const client = new MongoClient(MONGO_URI);
   
    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
        
        const query = { _id : ObjectID(collection.id) };
        
        collection.date_updated = new Date();
        
        await ss.updateOne(query, { $set: collection }, async (err? : Error, _res? : string)=> {
        
            await client.close();
       
            if ( completion ){
                completion(err, collection);
            }
        });
    }
    finally {
        await client.close();
    }
}


/*
 * Internal method for checking if a collection exists
 * by the specified id and the creator
*/
async function collectionExists ( collection_id : string, 
    created_by : string ): Promise<boolean>{
    
    const client = new MongoClient(MONGO_URI);
  
    try {
   
    
            const database = client.db(DB);
            const ss = database.collection(COLLECTION);
            const query = { _id : ObjectID(collection_id), created_by : created_by };
 
            let collection = await ss.findOne(query);
        
            return (collection !== null && collection !== undefined);          
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
        
        if ( !await collectionExists(media.collection_id, media.creator)) {

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
        
        if ( !await collectionExists(media.collection_id, media.creator)) {

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
