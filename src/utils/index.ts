import express from 'express';
import { ShortCorrectionInfo } from '../models';


export function getClientIp (req : express.Request){

    let xForwardedFor = req.headers['x-forwarded-for'] !== undefined ? 
    (req.headers['x-forwarded-for'][0]).replace(/:\d+$/, '') : undefined;
    let ip = xForwardedFor || req.socket.remoteAddress;
    return ip;
}


export const b64ToShortInfo = (b64str : string) : ShortCorrectionInfo => {

	let s = Buffer.from(b64str, "base64").toString();
	let a = JSON.parse(s);

	return {
		collectionId : {
			title : a[0],
			symbol :a[1],
			owner : a[2],
		},
		templateId : a[3],
		icon : a[4],
	};
}