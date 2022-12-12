export const ROOT = "/";

export const ADD_NEW_COLLECTION = "/add_collection/";

export const GET_COLLECTION = "/collection/:name?/:created_by?";

export const GET_COLLECTION_BY_ID = "/collection_by/:creator?/:id?";

export const GET_COLLECTIONS_BY = "/collections/:created_by?/:offset?/:limit?";

export const GET_COLLECTIONS_BY_STATUS = "/collections_by_status/:status/:offset?/:limit?";

export const GET_COLLECTION_MEDIA_BY = "/collection_media/:collection_id/:created_by?/:offset?/:limit?";

export const GET_ONE_COLLECTION_MEDIA = "/one_collection_media/:collection_id";

export const GET_COLLECTION_MEDIA_COUNT_BY = "/collection_media_count/:collection_id/:created_by?";

export const UPDATE_COLLECTION = "/update_collection/";

export const DELETE_COLLECTION = "/delete_collection/:collection_id/:creator";

export const ADD_COLLECTION_MEDIA = "/add_collection_media/";

export const UPDATE_COLLECTION_MEDIA = "/update_collection_media/";

export const DELETE_COLLECTION_MEDIA = "/delete_collection_media/:media_id/:created_by?";

export const RANDOM_MEDIA_FOR_MINTING = "/random_media_for_minting/:collection_id/:minted_by?";

export const AVAILABLE_MINT_COUNT = "/available_mint_count/:collection_id";

export const REMOVE_MINT_INFO = "/remove_mint_info/:media_id/:minted_by?";

export const ADD_COLLECTION_MINTER_GROUP = "/add_minter_group/";

export const ADD_MINTERS_TO_GROUP = "/add_minters_to_group/";

export const ADD_OFFER = "/add_offer/";

export const DELETE_OFFER_BY = "/delete_offer_by/:offer_id";

export const GET_OFFERS = "/offers/:type/:destination?/:offset?/:limit?";

export const CHECK_HAS_OFFER = "/has_offer/:type/:token_id/:destination?";

export const OBTAIN_JWT = "/get_jwt/:email?/:pass?";
