import { MONGO_URI } from "./config";

const DB = "fin_superapp";
const COLLECTION = "tm_uri_mappers";
const { MongoClient } = require("mongodb");





export async function getShortUri(long_uri? : string) : Promise <any|undefined>{

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

