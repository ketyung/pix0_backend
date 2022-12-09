import { Minter, MinterGroup } from "../models";
import { MongoClient, ObjectID } from "./collection";
import { DB } from "./collection";
import { MONGO_URI } from "./config";
import * as collection from './collection';

const COLLECTION_MINTER_GROUP = "xnft_collection_minter_group";
const COLLECTION_MINTER_GROUP_MINTER = "xnft_collection_minter_group_minter";


export async function minterGroupExists ( collection_id : string, 
    name : string ): Promise<boolean>{
    
    const client = new MongoClient(MONGO_URI);
  
    try {
   
    
        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MINTER_GROUP);
        const query = { group_id : ObjectID(collection_id), name : name };

        let g = await ss.findOne(query);
    
        return (g !== null && g !== undefined);          
    }
    finally {
        await client.close();
    }
    
}


export async function minterExists ( group_id : string, 
    wallet_address : string  ): Promise<boolean>{
    
    const client = new MongoClient(MONGO_URI);
  
    try {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MINTER_GROUP_MINTER);
        const query = { group_id : ObjectID(group_id), wallet_address : wallet_address };

        let g = await ss.findOne(query);
    
        return (g !== null && g !== undefined);          
    }
    finally {
        await client.close();
    }
    
}



/**
 * Add a minter group 
 * @param media - a struct of {media: CollectionMedia, collection_id : string, creator : string} 
 * @param completion 
 */
 export async function addMinterGroup(
    group : MinterGroup, 
    completion?: (err?: Error, res? : MinterGroup)=>void){

    const client = new MongoClient(MONGO_URI);
   
    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MINTER_GROUP);
        

        if ( !await collection.collectionExists(group.collection_id)) {

            if ( completion ) {

                completion(new Error("The specified collection does NOT exist!"));
                return;
            }
        }

        if ( await minterGroupExists(group.collection_id, group.name)) {

            if ( completion ) {

                completion(new Error(`The specified group ${group.name} already exists!`));
                return;
            }
        }

        let grp = group;
        grp.date_created = new Date();
        grp.date_updated = new Date();

        await ss.insertOne(grp, async (err? : Error, _res? : string)=> {
         
            await client.close();

            if ( completion ){
                completion(err, grp);
            }
        });

    }
    finally {
        await client.close();
    }
}


/**
 * Add a minter group 
 * @param media - a struct of {media: CollectionMedia, collection_id : string, creator : string} 
 * @param completion 
 */
 export async function addMintersToGroup(
    minters : Minter [],
    completion?: (err?: Error, res? : Minter[])=>void){

    const client = new MongoClient(MONGO_URI);
   
    try {

        const database = client.db(DB);
        const ss = database.collection(COLLECTION_MINTER_GROUP_MINTER);
    
        await ss.insertMany(minters, async (_err? : Error, _res? : string)=> {
         
            await client.close();

            if ( completion ){
                completion(_err, minters);
            }
        });

    }
    finally {
        await client.close();
    }
}
