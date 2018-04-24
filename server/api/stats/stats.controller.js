'use strict';

// someFunc
import Candidate from "../candidate/candidate.model";


export function visitsByMonth(req, res) {
    let positions = req.query.positions;
    if(!Array.isArray(positions)){
        positions = [positions];
    }

    if (req.user.hasLimitedPositionAccess()) {
        positions.forEach((position) => {
            if (req.user.positionsAccess.indexOf(position) === -1) {
                res.send(403).end;
                return;
            }
        });
    }

    let match = {};

    // TODO: Set correct value for $match and do it conditionally
    let aggregateQuery = [
        { $unwind : "$visits" },
        {
            $match: {
                'visits.general._position': { $in: positions },
                'visits.general.date': {
                    $gte: new Date('05/06/2018'),
                    $lt: new Date(new Date('05/07/2018').getTime() + 24 * 60 * 60 * 1000)
                }
            }
        },
        {
            $project: {
                month: { $month: '$visits.general.date' },
                year: { $year: '$visits.general.date' },
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

    Candidate.aggregateAsync(aggregateQuery)
        .then(stats => {
            let result1 = {};
            let result2 = [];
            let statsFromDate = null;

            stats.forEach(val => {
                let statDate = new Date();

                statDate.setMonth(val._id.month - 1, 1);
                statDate.setFullYear(val._id.year);
                statDate.setHours(0,0,0,0);

                result1[statDate] = val.total;

                if (statsFromDate === null) {
                    statsFromDate = new Date(statDate.getTime());
                }
            });

            let now = new Date();
            while (statsFromDate <= now) {
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
