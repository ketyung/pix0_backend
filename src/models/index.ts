export enum Category {

    PFP_COLLECTION,

    NICE_QUOTE_COLLECTION,
}


export enum Status {

    PUBLISHED = 'P',

    NEW ='N', 

    DEACTIVATED = 'D',
}


export interface Collection {
    
    id? : string, 

    name : string , 

    description? : string,

    category? : Category,

    status? : Status,

    logo? : Buffer, 

    layer_count? : number ,

    media_list : CollectionMedia[],
    
    created_by : string, 

    date_created? : Date,

    date_updated? : Date,
}


export interface CollectionMedia {

    name? : string, 

    layer_num : number, 

    max_num_of_media? : number, 
    
    medias : Media[],

}

export enum MediaType {

    media_uri = 1 ,
    
    text = 2,

    shape = 3, 

    data_uri = 4, 

}

export interface Media {

    type : MediaType,

    value? : string, // value can be uri or another JSON string

    data_url? : Buffer, 

    // percentage of ocurrance
    poc? : number, 
    
}