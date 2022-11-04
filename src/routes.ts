import { Router, Response, Request } from 'express';
import * as paths from './paths';

const routes = Router();

routes
.get(paths.ROOT, (_req, res) => {
    return res.json({ message: 'Welcome To The REST API Endpoint', date : new Date().toLocaleString() });
})
.get(paths.SHORTEN_IT, async (_req, res)=>{
    return res.json ({value : "test::"+ _req.params.value});
});

export default routes;