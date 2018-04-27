export function isGrantedForRequestedData(req, res, next){

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