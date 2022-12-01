const jwt = require('jsonwebtoken');

export interface User {

    email? : string,

    pass? : string, 
}


export function isAllowedUser ( user : User) : boolean {

    let list_of_users : User[] = JSON.parse(process.env.ALLOWED_USERS)  ;

   for ( var r= 0; r < list_of_users.length; r++){

        let u = list_of_users[r];

        if ( u.email === user.email && 
            u.pass === user.pass) {

            return true;
        }
    }

    return false;
}

export function obtainJwtToken(user : User ) {

    
    if (isAllowedUser(user)) {

        let t = getJwtToken(user);
        return t; 
    }
    
    return undefined;
    
}

export function getJwtToken(user : User ) {

    let tokenKey = process.env.JWT_TOKEN_KEY;
    
    const token = jwt.sign(
        {user : user}, 
        tokenKey,
        /*
        {
            expiresIn: "2h",
        }*/
    );

  
    return token;

}

export function decodeJwtToken(token? : string) : {user?: User,
 error? : string } | undefined{

    try {

        if ( token ) {
            const decodedToken = jwt.verify(token,process.env.JWT_TOKEN_KEY );
    
            return {user : decodedToken.user };
        }
    
    }
    catch (e : any) {

        return { error : e.message};
    }    
    return undefined; 

}
