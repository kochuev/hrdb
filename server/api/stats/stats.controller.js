'use strict';

import Candidate from "../candidate/candidate.model";
import moment from 'moment';

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode).send(err);
    };
}

//TODO: Move this this function to separate file? /server/api/stats/stats.validator.js ? Rewrite as a Class?
//TODO: Am I inventing a wheel here? Does Express have build in solutions for it?
function isVisitsByMonthQueryValid(query){
    let invalidProps = 0;
    let messages = [];

    //TODO: update validator, we don't need stats for ALL positions, empty query.positions should be invalid
    //TODO: check positions if user has access to it
    // positions
    if(query.positions){
        let pattern = new RegExp('^[a-f\\d]{24}$', 'i'); // match 24 symbols hexadecimal string
        let positionsInvalidMessage = 'The positions parameter is not valid, it should be 24 symbols hexadecimal string.';
        if(Array.isArray(query.positions)){
             if(!query.positions.every(position => pattern.test(position))){
                 invalidProps++;
                 messages.push(positionsInvalidMessage);
             }
        }else{
             if(!pattern.test(query.positions)){
                 invalidProps++;
                 messages.push(positionsInvalidMessage);
             }
        }
    }

    // startDate and endDate
    let isValidDate = (date) => typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date);
    if(query.startDate){
        if(!isValidDate(query.startDate)){
            invalidProps++;
            messages.push('The startDate parameter is not valid, example of valid value is 01-01-2001.');
        }
    }
    if(query.endDate){
        if(!isValidDate(query.endDate)){
            invalidProps++;
            messages.push('The endDate parameter is not valid, example of valid value is 01-01-2001.');
        }
    }

    return {
        isValid: invalidProps === 0,
        message: messages.join(' \n')
    };
}


export function visitsByMonth(req, res) {

    //TODO: move it to validator
    /*if (req.user.hasLimitedPositionAccess()) {
        positions.forEach((position) => {
            if (req.user.positionsAccess.indexOf(position) === -1) {
                res.send(403).end;
                return;
            }
        });
    }*/

    let startDate,
        endDate,
        positions;

    let validator = isVisitsByMonthQueryValid(req.query);

    if(!validator.isValid){
        res.status(400).send(validator.message);
        return;
    }

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
