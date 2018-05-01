export function isVisitsQueryValid(req, res, next) {

  let invalidProps = 0;
  let messages = [];

  // positions
  if (req.query.positions) {
    let pattern = new RegExp('^[a-f\\d]{24}$', 'i'); // match 24 symbols hexadecimal string
    let positionsInvalidMessage = 'The positions parameter is not valid, it should be 24 symbols hexadecimal string.';
    if (Array.isArray(req.query.positions)) {
      if (!req.query.positions.every(position => pattern.test(position))) {
        invalidProps++;
        messages.push(positionsInvalidMessage);
      }
    } else {
      if (!pattern.test(req.query.positions)) {
        invalidProps++;
        messages.push(positionsInvalidMessage);
      }
    }
  }

  // startDate and endDate
  let isValidDate = (date) => typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date);
  if (req.query.startDate) {
    if (!isValidDate(req.query.startDate)) {
      invalidProps++;
      messages.push('The startDate parameter is not valid, example of valid value is 01-01-2001.');
    }
  }
  if (req.query.endDate) {
    if (!isValidDate(req.query.endDate)) {
      invalidProps++;
      messages.push('The endDate parameter is not valid, example of valid value is 01-01-2001.');
    }
  }

  if (invalidProps) {
    res.status(400).send(messages.join(' \n'));
    return;
  }

  return next();
}
