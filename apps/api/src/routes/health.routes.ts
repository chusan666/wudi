import { Hono } from 'hono';
import { healthController } from '@controllers/health.controller';
import type { HonoEnv } from '@types/context';

const healthRoutes = new Hono<HonoEnv>();

healthRoutes.get('/health', healthController.health);
healthRoutes.get('/ready', healthController.ready);

export default healthRoutes;