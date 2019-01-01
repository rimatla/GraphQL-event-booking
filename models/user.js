const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**************************************************
 * Mongoose User Schema and Types 
 **************************************************/
const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdEvents: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event' /* create a reference between the models*/
    }
  ]
})

module.exports = mongoose.model('User', userSchema)
