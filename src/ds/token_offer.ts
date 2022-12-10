import { MongoClient } from "./collection";
import { MONGO_URI } from "./config";
import { DB } from "./collection";
import { Offer, OfferCreator, OfferType } from "../models";


const TOKEN_OFFER = "xnft_token_offer";

/**
 * Add a collection media to the specified collection with collection
 * id and the creator. A collection media must have a unique name within
 * the collection
 * @param media - a struct of {media: CollectionMedia, collection_id : string, creator : string} 
 * @param completion 
 */
 export async function addOffer(
    offer : Offer, completion?: (err?: Error, res? : Offer )=>void){


    const client = new MongoClient(MONGO_URI);
   
    try {

        const database = client.db(DB);
        const ss = database.collection(TOKEN_OFFER);
        
        offer.date_created = new Date();

        await ss.insertOne(offer, async (err? : Error, _res? : string)=> {
         
            await client.close();

            if ( completion ){
                completion(err, offer);
            }
        });

    }
    finally {
        await client.close();
    }
}


export async function deleteOffer(
    param : {token_id : string, 
    type : OfferType,
    creator : OfferCreator}, 
    completion?: (err?: Error, res?: {deleted : boolean})=>void){

    const client = new MongoClient(MONGO_URI);

    try {

        const database = client.db(DB);
        const ss = database.collection(TOKEN_OFFER);
    
        const query = { "nft_token.NFTokenID" : param.token_id ,
         type : param.type,  
         created_by : param.creator };
        
        await ss.deleteOne(query, async (err? : Error, _res? : string)=> {
        
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



export async function getOffersBy(type : OfferType,
    offset? : number, limit? : number ) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(TOKEN_OFFER);
      
        const query = { type : type  };

        const rs = await ss
                .find(query)
                .sort ( { date_created : -1})
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



export async function hasOffer(
    token_id : string, type : OfferType ) : Promise <{has_offer : boolean}|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(TOKEN_OFFER);

        const query = { "nft_token.NFTokenID" : token_id, type : type  };

        const rs = await ss
        .findOne(query);

    
        return { has_offer : rs !== null }; 

    } 
    finally {
        await client.close();
    }
}





