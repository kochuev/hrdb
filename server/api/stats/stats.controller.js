'use strict';

import Candidate from "../candidate/candidate.model";
import moment from 'moment';

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode).send(err);
    };
}

export function isUserGranted(req, res, next){

    let hasEnoughRights = true;
    let messages = [];

    // User have permission to access the stats for all requested positions
    if(req.user && req.user.hasLimitedPositionAccess()){
        let positions = Array.isArray(req.query.positions) ? req.query.positions : [req.query.positions];
        if(!positions.every((position) => req.user.positionsAccess.indexOf(position) !== -1)){
            hasEnoughRights = false;
            messages.push('You don’t have permission to access the stats for position you requested');
        }
    }

    if(hasEnoughRights){
        return next();
    }else{
        res.status(403).send(messages.join(' \n'));
        return;
    }
}

export function visitsByMonth(req, res) {

    let startDate,
        endDate,
        positions;

    if(req.query.startDate){
        startDate = new Date(req.query.startDate);
    }

    if(req.query.endDate){
        endDate = new Date(req.query.endDate);
    }

    if(req.query.positions){
        positions = Array.isArray(req.query.positions) ? req.query.positions : [req.query.positions];
    }

    let aggregateQueryMatch = {};

    // For now positions is required parameter, but we check it anyway
    if(positions){
        aggregateQueryMatch['visits.general._position'] = { $in: positions };
    }

    if(startDate || endDate){
        aggregateQueryMatch['visits.general.date'] = {};
    }

    if(startDate){
        aggregateQueryMatch['visits.general.date'].$gte = startDate;
    }

    if(endDate){
        aggregateQueryMatch['visits.general.date'].$lt = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    }

    let timezoneOffset = moment().format('ZZ');

    let aggregateQuery = [
        { $unwind : "$visits" },
        {
            $match: aggregateQueryMatch
        },
        {
            $project: {
                month: { $month: { date: '$visits.general.date', timezone: timezoneOffset } },
                year: { $year: { date: '$visits.general.date', timezone: timezoneOffset } },
            }
        },
        {
            $group : {
                _id: {year: '$year', month: '$month'},
                total: { $sum: 1 }
            }
        },
        {
            $sort: {
                '_id.year' : 1,
                '_id.month': 1
            }
        }
    ];

    Candidate.aggregate(aggregateQuery)
        .then(stats => {

            if(stats.length === 0){
                res.status(404).send('Looks like there are no visits matching you request');
                return;
            }

            let result1 = {};
            let result2 = [];
            let statsFromDate = null;
            let statsTillDate = null;

            stats.forEach(val => {
                let statDate = new Date();

                statDate.setMonth(val._id.month - 1, 1);
                statDate.setFullYear(val._id.year);
                statDate.setHours(0,0,0,0);

                result1[statDate] = val.total;

                if (statsFromDate === null) {
                    statsFromDate = new Date(statDate.getTime());
                }

                if (statDate.getTime() > statsTillDate){
                    statsTillDate = new Date(statDate.getTime());
                }

            });

            while (statsFromDate <= statsTillDate) {
                if (result1[statsFromDate] === undefined) {
                    result2.push({date: new Date(statsFromDate.getTime()), total: 0});
                } else {
                    result2.push({date: new Date(statsFromDate.getTime()), total: result1[statsFromDate]});
                }
                statsFromDate.setMonth(statsFromDate.getMonth()+1);
            }

            res.status(200).json(result2);
        })
        .catch(handleError(res));
}
