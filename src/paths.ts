export const ROOT = "/";

export const ADD_NEW_COLLECTION = "/add_collection/";

export const GET_COLLECTION = "/collection/:name?/:created_by?";

export const GET_COLLECTION_BY_ID = "/collection_by/:creator?/:id?";

export const GET_COLLECTIONS_BY = "/collections/:created_by?/:offset?/:limit?";

export const GET_COLLECTION_MEDIA_BY = "/collection_media/:collection_id/:created_by?/:offset?/:limit?";

export const GET_COLLECTION_MEDIA_COUNT_BY = "/collection_media_count/:collection_id/:created_by?";

export const UPDATE_COLLECTION = "/update_collection/";

export const ADD_COLLECTION_MEDIA = "/add_collection_media/";

export const UPDATE_COLLECTION_MEDIA = "/update_collection_media/";

export const DELETE_COLLECTION_MEDIA = "/delete_collection_media/:media_id/:created_by?";

export const RANDOM_MEDIA_FOR_MINTING = "/random_media_for_minting/:collection_id/:minted_by?";

export const OBTAIN_JWT = "/get_jwt/:email?/:pass?";
