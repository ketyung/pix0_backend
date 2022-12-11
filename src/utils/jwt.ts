const jwt = require('jsonwebtoken');

export interface User {

    email? : string,

    pass? : string, 
}


export function isAllowedUser ( user : User) : boolean {

    // Just a temporary solution for checking the
    // allowed API users. Non-production mode just for the 
    // testing and dev mode. A better solution is needed
    // for production mode in the future
    let list_of_users : User[] = JSON.parse(process.env.ALLOWED_USERS)  ;

    let found_user = list_of_users.filter((u)=>{

        return (u.email === user.email && 
        u.pass === user.pass);
    })

    return found_user.length === 1;

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
        {
            expiresIn: "2h",
        }
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
