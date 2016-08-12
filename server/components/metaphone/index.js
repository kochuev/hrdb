"use strict";

import config from '../../config/environment';
var translit = require('translit')(config.translitMap);
import metaphone from 'metaphone';

export default function(str) {
  return metaphone(translit(str))
}
