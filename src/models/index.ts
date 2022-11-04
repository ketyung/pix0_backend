export interface CollectionId {

    title : string,

    owner : string,

    symbol : string, 
}

export interface ShortCorrectionInfo {

    collectionId : CollectionId,

    templateId? : number, 

    icon? : string, 
}
