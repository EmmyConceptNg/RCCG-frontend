import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  orders : {
    type: Object,
  },
  transferedToHCP : {
    type: Boolean,
    default: false
  }
},{timestamps : true});

const WorkOrder = mongoose.model('WorkOrder', schema);

export default WorkOrder;
