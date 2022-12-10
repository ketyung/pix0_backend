const R_B58_DICT = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';
const base58 = require('base-x')(R_B58_DICT);

export const constructOfferId = (address : string, seq_num : string ) =>{

    let prefix = Buffer.from([0x0074]);

    let oid = Buffer.concat([prefix, Buffer.from(address), Buffer.from(seq_num)]);

    console.log("oid:x:", oid.toString("hex"));
    const ooid = base58.encode(oid);
    console.log("ooid:::", ooid.toUpperCase() );

}


