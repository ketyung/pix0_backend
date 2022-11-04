require('dotenv').config();

export const MONGO_URI = 
"mongodb+srv://"+encodeURIComponent(process.env.MONGO_DB_USER) + ":"+
encodeURIComponent(process.env.MONGO_DB_USER_PASS)+
"@"+encodeURIComponent(process.env.MONGO_DB_HOST)+"/?retryWrites=true&w=majority";