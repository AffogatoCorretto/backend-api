import { createHmac } from "crypto";

export const authMiddleware = async (c, next) => {
    c.res.headers.set('Access-Control-Allow-Origin', '*');
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.res.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    
    if (c.req.method === 'OPTIONS') {
      return c.text(null, 204);
    }
    
    if (c.req.path === '/') {
        await next();
        return;
    }

    const authHeader = c.req.header('Authorization'); 

    if (c.req.method === 'POST' && c.req.path.split("/")[1] === "WBkI9gfCUk"){
      if(authHeader.split(' ')[1] === "srg8oaa74l4Ia3Imal4INo0AOXH76mWl"){
        await next();
      }
      return c.json({ error: 'Unauthorized' }, 401);
    }
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  
    const hashFromClient = authHeader.split(' ')[1];
    const secret = c.env.SECRET; 

    let dataToHash;
    if (c.req.method === 'GET') {
        const queryParams = new URLSearchParams(c.req.query());
        const sortedParams = [...queryParams.entries()].sort((a, b) => a[0].localeCompare(b[0]));
        dataToHash = new URLSearchParams(sortedParams).toString(); 
    } else if (c.req.method === 'POST') {
        const body = await c.req.json();
        dataToHash = JSON.stringify(body || {});
    }

    console.log(dataToHash)

    const hashFromServer = createHmac('sha256', secret).update(dataToHash).digest('hex');
    console.log(hashFromServer);
  
    if (hashFromClient !== hashFromServer) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await next();
  };