/* This is an example of a GraphQL API storing and manipulating data using Mongoose and MongoDB */
const express = require('express')
const app = express()
const port = 3000
const bcrypt = require('bcryptjs')

const expressGraphQL = require('express-graphql')
const { buildSchema } = require('graphql')

const mongoose = require('mongoose')
const Event = require('./models/event') // mongoose model
const User = require('./models/user')

//app.use(express.json())

/**************************************************
 * GraphQl Schema
 **************************************************/
app.use(
  '/graphql',
  expressGraphQL({
    schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

     type User {
      _id: ID!
      email: String!
      password: String
    }

    input UserInput {
      email: String!
      password: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      /**************************************************
       * Resolvers
       **************************************************/

      // Event Resolver
      events: () => {
        // mongoose method
        return Event.find()
          .then(events => {
            // data transformation
            return events.map(event => {
              return {
                ...event._doc,
                _id: event._doc._id.toString() // transform object id, see notes.txt
              }
            })
          })
          .catch(err => {
            throw err
          })
      },

      // Create Event Resolver
      createEvent: args => {
        // save and fetch events from DB
        // new event object to be saved on DB
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price, // convert to a number
          date: new Date(args.eventInput.date), // parse it
          creator: '5c19808870856e187159675b' // for now, dummy id from user on DB
        })

        // mongoose methods
        let createdEvent
        return event
          .save()
          .then(result => {
            createdEvent = { ...result._doc, _id: event.id }
            return User.findById('5c19808870856e187159675b')
          })
          .then(user => {
            if (!user) {
              throw new Error('User not found')
            }
            // mongoose push()
            user.createdEvents.push(event)
            return user.save() //update the user
          })
          .then(result => {
            console.log(createdEvent)
            return createdEvent
          })
          .catch(err => {
            console.log(err)
            throw err
          })
      },

      // Create User Resolver
      createUser: args => {
        // prevent saving email that already exist
        return User.findOne({ email: args.userInput.email })
          .then(user => {
            if (user) {
              throw new Error('User already exist')
            }
            // fix security flaw with a hashed password, add 12 rounds of salt
            return bcrypt.hash(args.userInput.password, 12)
          })
          .then(hashedPassword => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword
            })
            // save to DB
            return user.save()
          })
          .then(result => {
            return { ...result._doc, password: null, _id: result.id }
          })
          .catch(err => {
            throw err
          })
      }
    },
    //IDE
    graphiql: true
  })
)

/**************************************************
 * Connect to Mongoose
 **************************************************/

// dynamically change username and password, and DB name
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-mboyl.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,
    { useNewUrlParser: true }
  )
  .then(() => {
    // start server if connect is sucessful
    app.listen(port, () => {
      console.log('Listening on port', port)
    })
  })
  .catch(err => {
    console.log(err)
  })
