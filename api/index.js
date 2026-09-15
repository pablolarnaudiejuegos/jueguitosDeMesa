import {handler} from '../server.js';
export default function api(req,res){const url=new URL(req.url,'http://localhost');const route=req.query?.route??url.searchParams.get('route');if(route)req.url='/api/'+(Array.isArray(route)?route.join('/'):route);return handler(req,res);}
