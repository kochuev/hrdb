'use strict';

import {Router} from 'express';
import * as controller from './candidate.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.post('/find', auth.isAuthenticated(), controller.find);
router.get('/stats/month/:id', auth.isAuthenticated(), controller.statsByMonth);
router.get('/stats/:by/:id', auth.isAuthenticated(), controller.statsByPosition);

module.exports = router;
