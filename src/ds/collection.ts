import { MONGO_URI } from "./config";
import { Collection, CollectionMedia } from "../models";

const DB = "xnft_collections";
const COLLECTION = "xnft_collection";
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

/**
 * This method is meant for updating the collection
 * that has a single media only
 * @param collectionMedia 
 * @param collectionId 
 * @param creator 
 * @param completion 
 */
export async function updateSingleCollectionMedia(
    media : {collectionMedia : CollectionMedia,
    collectionId : string, 
    creator : string}, 
    completion?: (err?: Error, res? : Collection)=>void){


    const client = new MongoClient(MONGO_URI);
   
    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
        
        const query = { _id : ObjectID(media.collectionId), created_by : media.creator };
        
        let collection = await ss.findOne(query);

        if (collection.media_list === undefined) {
            collection.media_list = [];
        }
        collection.media_list[0] = media.collectionMedia;
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

