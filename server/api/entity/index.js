'use strict';

import {Router} from 'express';
import * as controller from './entity.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/:entity', auth.isAuthenticated(), controller.index);
router.get('/:entity/:id', auth.isAuthenticated(), controller.show);
router.post('/:entity', auth.isAuthenticated(), controller.create);
router.put('/:entity/:id', auth.isAuthenticated(), controller.update);
router.patch('/:entity/:id', auth.isAuthenticated(), controller.update);
router.delete('/:entity/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
