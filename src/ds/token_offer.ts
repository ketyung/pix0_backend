import { MongoClient } from "./collection";
import { MONGO_URI } from "./config";
import { DB } from "./collection";
import { Offer, OfferCreator, OfferType } from "../models";
const assert = require('assert');
const crypto = require('crypto');




const numberToBytes = (n : number) => {
    // you can use constant number of bytes by using 8 or 4
    const len = Math.ceil(Math.log2(n) / 8);
    const byteArray = new Uint8Array(len);

    for (let index = 0; index < byteArray.length; index++) {
        const byte = n & 0xff;
        byteArray[index] = byte;
        n = (n - byte) / 256;
    }

    return byteArray;
}



const constructOfferId = (pubkey_hex: string, seq_num : number) =>{

    const pubkey = Buffer.from(pubkey_hex, 'hex');
    assert(pubkey.length == 33);

    // Calculate the RIPEMD160 hash of the SHA-256 hash of the public key
    //   This is the "Account ID"
    const pubkey_inner_hash = crypto.createHash('sha256').update(pubkey);
    const pubkey_outer_hash = crypto.createHash('ripemd160');
    pubkey_outer_hash.update(pubkey_inner_hash.digest());
    const account_id = pubkey_outer_hash.digest();

    console.log("acc_id::", account_id);

    const address_type_prefix = Buffer.from([0x0074]);
    const offer_id = Buffer.concat([address_type_prefix, account_id, numberToBytes(seq_num)]);

    let oid = Buffer.from(offer_id).toString('hex');
    console.log("oid::", oid);

    return oid;

}


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

        offer.offer_id = constructOfferId(offer.created_by.pubkey, offer.seq_num);

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
    param : {offer_id : string, 
    creator : OfferCreator}, 
    completion?: (err?: Error, res?: {deleted : boolean})=>void){

    const client = new MongoClient(MONGO_URI);

    try {

        const database = client.db(DB);
        const ss = database.collection(TOKEN_OFFER);
    
        const query = { offer_id : param.offer_id , 
         created_by : param.creator };
        
        await ss.remove(query, { justOne : true }, async (err? : Error, _res? : string)=> {
        
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

