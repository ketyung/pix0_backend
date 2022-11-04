import { MONGO_URI } from "./config";
import { b64ToShortInfo } from "../utils";
import { ShortCorrectionInfo } from "../models";

const DB = "tm_surl";
const COLLECTION = "tm_uri_mappers";
const { MongoClient } = require("mongodb");


export async function obtainShortUri(long_uri : string, completion?: (err?: Error, res? : string)=>void ) : Promise<{
    short_uri : string, long_uri : string
}>{

    const client = new MongoClient(MONGO_URI);
    
    try 
    {

        let shortUri = await getShortUri(long_uri);
        if ( shortUri === undefined || shortUri === null) {

            const database = client.db(DB);
            const ss = database.collection(COLLECTION);
            
            let shortInfo = b64ToShortInfo(long_uri);

            
            let _shortUri = await shortUriStr(shortInfo);

            let item = {
                short_uri : _shortUri,
                long_uri : long_uri, 
            }

            await ss.insertOne(item, async (err? : Error, _res? : string)=> {
                if ( completion ){
                    completion(err, _res);
                }
                await client.close();
            });

            return item;
        }


        return shortUri;
        
       

    } 
    catch(e : any) {

        console.error("Error::@obtainShortUri", e.message, new Date());
        if ( completion )
            completion(e);
    }
    finally {
    // Ensures that the client will close when you finish/error
        await client.close();
    }
}


async function shortUriStr ( shortInfo : ShortCorrectionInfo) {

    let sUri = shortInfo.collectionId.title.replace(/\s+/g, '_').toLowerCase();
    let i = 1;
    while ( await shortUriExists(sUri)) {

        sUri += "_"+i;
        i++;
    }

    return sUri;
}


async function getShortUri(long_uri : string) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
      
        const query = { long_uri : long_uri };
        const s = await ss.findOne(query);

        return s;

    } 
    finally {
        await client.close();
    }
}



async function shortUriExists(short_uri : string) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(COLLECTION);
      
        const query = { short_uri : short_uri };
        const s = await ss.findOne(query);

        return (s !== undefined && s !== null);

    } 
    finally {
        await client.close();
    }
}
