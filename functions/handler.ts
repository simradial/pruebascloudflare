import { Router } from 'itty-router';

import Test from './handlers/test';
import Time from './handlers/time';

const router = Router();

router
  .get('/api/test', Test)
  .get('/api/time', Time)
  .get('*', () => new Response('Not found', { status: 404 }));

export const handleRequest = (request:any)  => router.handle(request);