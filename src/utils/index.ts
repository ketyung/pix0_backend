import express from 'express';


export function getClientIp (req : express.Request){

    let xForwardedFor = req.headers['x-forwarded-for'] !== undefined ? 
    (req.headers['x-forwarded-for'][0]).replace(/:\d+$/, '') : undefined;
    let ip = xForwardedFor || req.socket.remoteAddress;
    return ip;
}


export const randomInt = (min : number, max : number) =>{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); 
}
