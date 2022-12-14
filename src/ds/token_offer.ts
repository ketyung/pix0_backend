import { MongoClient } from "./collection";
import { MONGO_URI } from "./config";
import { DB } from "./collection";
import { Offer, OfferType } from "../models";


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

export async function deleteOfferBy(
    offer_id : string , 
    completion?: (err?: Error, res?: {deleted : boolean})=>void){

    const client = new MongoClient(MONGO_URI);

    try {

        const database = client.db(DB);
        const ss = database.collection(TOKEN_OFFER);
    
        const query = { offer_id : offer_id };
        
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
    destination? : string, 
    offset? : number, limit? : number ) : Promise <any|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(TOKEN_OFFER);
      
        const query = (destination && destination !== "any") 
        ? { type : type, destination : destination  } : 
        { type : type ,destination: { $exists: false }  }; // if the destination isn't specified or it's "any"
                                                           // it'll filter the data with NO destination
                                                           
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
    token_id : string, type : OfferType, destination? : string  ) : Promise <{has_offer : boolean}|undefined>{

    const client = new MongoClient(MONGO_URI);

    try 
    {
   
        const database = client.db(DB);
        const ss = database.collection(TOKEN_OFFER);

        const query = (destination && destination !== "any") ? 
          { "nft_token.NFTokenID" : token_id, type : type ,
        destination: destination  } :
        { "nft_token.NFTokenID" : token_id, type : type ,
        destination: { $exists: false }  };

        const rs = await ss
        .findOne(query);

    
        return { has_offer : rs !== null }; 

    } 
    finally {
        await client.close();
    }
}





