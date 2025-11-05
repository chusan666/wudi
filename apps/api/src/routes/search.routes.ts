import { Hono } from 'hono';
import { searchController } from '@controllers/search.controller';
import type { HonoEnv } from '@types/context';

const searchRoutes = new Hono<HonoEnv>();

searchRoutes.get('/users', searchController.searchUsers);
searchRoutes.get('/notes', searchController.searchNotes);

export default searchRoutes;