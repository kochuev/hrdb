'use strict';

import mongoose from 'mongoose';
import EntitySchema from '../entity/entity.schema';

export default mongoose.model('Origin', EntitySchema);
