'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.put('/:id/toggleActivation', auth.hasRole('admin'), controller.toggleActivation);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.post('/', controller.create);

export default router;
