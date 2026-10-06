import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { updateProfileSchema } from './users.validation.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';

export const usersRouter = Router();

usersRouter.get('/talent', optionalAuth, UsersController.searchTalent);
usersRouter.get('/profile/:idOrUid', optionalAuth, UsersController.getPublicProfile);
usersRouter.patch('/profile', requireAuth, validateBody(updateProfileSchema), UsersController.updateProfile);
