'use strict';

import {Router} from 'express';
import * as controller from './file.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/:id', controller.download);
router.post('/', auth.isAuthenticated(), controller.upload);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
//router.put('/:id', controller.update);
//router.patch('/:id', controller.update);


module.exports = router;
