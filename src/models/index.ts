export interface Collection {
    
    name : string , 

    description : string,

    layer_count : number ,

    media : CollectionMedia[],
    
    created_by : string, 

    date_created : Date,

    date_updated : Date,
}


export interface CollectionMedia {

    layer_num : number, 

    max_num_of_media? : number, 
    
    values : string[],

}