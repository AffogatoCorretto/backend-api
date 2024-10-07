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
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  
    const hashFromClient = authHeader.split(' ')[1];
    const secret = c.env.NEXTAUTH_SECRET; 

    let dataToHash;
    if (c.req.method === 'GET') {
        const queryParams = new URLSearchParams(c.req.query());
        const sortedParams = [...queryParams.entries()].sort((a, b) => a[0].localeCompare(b[0]));
        dataToHash = new URLSearchParams(sortedParams).toString(); 
    } else if (c.req.method === 'POST') {
        const body = await c.req.json();
        dataToHash = JSON.stringify(body || {});
    }

    const hashFromServer = createHmac('sha256', secret).update(dataToHash).digest('hex');
  
    if (hashFromClient !== hashFromServer) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await next();
  };