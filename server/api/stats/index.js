'use strict';

import {Router} from 'express';
import * as controller from './stats.controller';
import * as auth from '../../auth/auth.service';
import * as validator from './stats.validator';

var router = new Router();

//TODO: What is correct way to bypass authentication when developing?
//TODO: I can set token in postman, but every time server reloads I need to set it again

router.get('/visits-by-month/', /*auth.isAuthenticated(),*/ validator.isVisitsQueryValid,  controller.visitsByMonth);
// router.get('/visits-by-agency/', /*auth.isAuthenticated(),*/ controller.someFunc);
// router.get('/visits-by-origin/', /*auth.isAuthenticated(),*/ controller.someFunc);
// router.get('/visits-by-position/', /*auth.isAuthenticated(),*/ controller.someFunc);

//TODO: URL example: http://localhost:9000/api/stats/visits-by-month/?startDate=01-20-2017&endDate=04-03-2018&positions=5ae0a2431a426c3b81920441&positions=5ae0a2431a426c3b81920442

module.exports = router;
