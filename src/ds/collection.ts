import { MONGO_URI } from "./config";
import { Collection } from "../models";
import * as collection_media from './collection_media';

export const DB = "xnft_collections";
const COLLECTION = "xnft_collection";

export const { MongoClient, ObjectID } = require("mongodb");

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



export async function getCollectionsByStatus(
    status : string, offset? : number, limit? : number ) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
      
        const query = { status :status, media_count: {$gt:0}  }; // filter by media count > 0

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
export async function collectionExists ( collection_id : string, 
    created_by? : string ): Promise<boolean>{
    
    const client = new MongoClient(MONGO_URI);
  
    try {
   
    
        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
        const query = created_by ? { _id : ObjectID(collection_id), created_by : created_by } :
        { _id : ObjectID(collection_id)} ;

        let collection = await ss.findOne(query);
    
        return (collection !== null && collection !== undefined);          
    }
    finally {
        await client.close();
    }
    
}


/*
 * Method for checking if a collection exists
 * by the specified id and the creator
*/
export async function updateCollectionMediaCount ( collection_id : string, 
    creator :string  ){
    const client = new MongoClient(MONGO_URI);
  
    try {
   
        let cnt = await collection_media.getCollectionMediaCountBy(collection_id, creator);


        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
        const query = { _id : ObjectID(collection_id), created_by : creator };
        const collection = await ss.findOne(query);

        collection.media_count = cnt.count; 
        collection.date_updated = new Date();

        await client.close();
       
        await updateCollection(collection);  
    }
    catch (e : any ) {
        console.log("updateMediaCountError:@x", e, new Date());
    }
    finally {
        await client.close();
    }
    
}


export async function deleteCollection(
    collection_id : string, 
    creator : string, 
    completion?: (err?: Error, res?: {deleted : boolean})=>void){


    const client = new MongoClient(MONGO_URI);

    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
    
        const query = { _id : ObjectID(collection_id) , 
         created_by : creator };
        
        await ss.deleteOne(query, async (err? : Error, _res? : string)=> {
        
            await client.close();
            await collection_media.deleteCollectionMediaBy(collection_id, (e)=>{
                if ( e instanceof Error){
                    console.error("Error deleting media:", e);
                }
                else {
                    console.log("deleting..media::", e, new Date());
                }
            });
       
            if ( completion ){
                completion(err, { deleted :true } );
            }
        });
    }
    finally {
        await client.close();
    }

}

