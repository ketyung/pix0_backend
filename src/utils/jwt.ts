const jwt = require('jsonwebtoken');

export function getJwtToken(value: string ) {

    let tokenKey = process.env.JWT_TOKEN_KEY;
    
    const token = jwt.sign(
        { token : value },
        tokenKey,
        {
            expiresIn: "2h",
        }
    );

  
    return token;

}

export function decodeJwtToken(token? : string) : {token?: string, error? : string } | undefined{

    try {

        if ( token ) {
            const decodedToken = jwt.verify(token,process.env.JWT_TOKEN_KEY );
    
            return {token : decodedToken.token};
        }
    
    }
    catch (e : any) {

        return { error : e.message};
    }    
    return undefined; 

}
