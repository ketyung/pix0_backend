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

    item_name_prefix? : string, 

    status? : Status,

    logo? : Buffer, 

    layer_count? : number ,

    media_list : CollectionMedia[],
    
    created_by : string, 

    date_created? : Date,

    date_updated? : Date,
}


export interface CollectionMedia {

    collection_id : string, 

    name : string, 

    created_by? : string, 

    max_num_of_media? : number, 
    
    medias : Media[],

    date_created? : Date,

    date_updated? : Date,
}

export enum MediaType {

    media_uri = 1 ,
    
    text = 2,

    shape = 3, 

    data_uri = 4, 

}

export interface Media {

    type : MediaType,

    layer_num : number, 

    value? : string, // value can be uri or another JSON string

    data_url? : Buffer, 

    // percentage of ocurrance
    poc? : number, 

    content_type? : string, 

    file_name? : string, 

    attributes?: MediaAttribute[],    
}


export interface MediaAttribute {

    trait_type? : string,

    value? : string,
    
    display_type? : string, 

}