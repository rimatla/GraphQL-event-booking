const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**************************************************
 * Mongoose Event Schema and Types 
 **************************************************/
const eventSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date, // Unlike GraphQl Mongo does have a date type
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User' /* create a reference between the models*/
  }
})

// create a model (blue print) based on the schema
module.exports = mongoose.model('Event', eventSchema)
