'use strict';

import {Router} from 'express';
import * as controller from './stats.controller';
import * as auth from '../../auth/auth.service';
import * as validator from './stats.validator';

var router = new Router();

/**
 *
 * /visits-by-
 *
 * Accepts 3 query parameters:
 *
 * startDate: optional, format: 01-20-2001
 * endDate: optional, format: 02-20-2001
 * positions: required, one or more can be passed, format: 5ae0a2431a426c3b81920441
 *
 * URL example: http://localhost:9000/api/stats/visits-by-month/?startDate=01-20-2017&endDate=04-03-2018&positions=5ae0a2431a426c3b81920441&positions=5ae0a2431a426c3b81920442
 *
 */
router.get(
    '/visits-by-month/',
    auth.isAuthenticated(),
    validator.isVisitsQueryValid,
    controller.isUserGranted,
    controller.visitsByMonth
);
router.get(
    '/visits-by-:group(agency|position|origin)/',
    auth.isAuthenticated(),
    validator.isVisitsQueryValid,
    controller.isUserGranted,
    controller.visitsByGroup
);

module.exports = router;
