'use strict';

import {Router} from 'express';
import * as controller from './stats.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

//TODO: What is correct way to bypass authentication when developing?
//TODO: I can set token in postman, but eventide server reloads I need to set new one

router.get('/visits-by-month/', /*auth.isAuthenticated(), */controller.visitsByMonth);
// router.get('/visits-by-agency/', /*auth.isAuthenticated(),*/ controller.someFunc);
// router.get('/visits-by-origin/', /*auth.isAuthenticated(),*/ controller.someFunc);
// router.get('/visits-by-position/', /*auth.isAuthenticated(),*/ controller.someFunc);

//TODO: URL example: https://localhost:9000/api/stats/visits-by-position/?filters
//TODO: ?startDate=01-01-2018&endDate=05-01-2018&positions[]=some_position_id&positions[]=some_other_position_id

module.exports = router;
