/* This is an example of a GraphQL API storing and manipulating data in Memory */
const express = require('express')
const app = express()
const port = 3000

const expressGraphQL = require('express-graphql')
const { buildSchema } = require('graphql')

//app.use(express.json())

// temporary data to be saved in memory 
const events = []

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
    }
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      /** resolvers **/
      events: () => {
        return events
      },
      createEvent: args => {
        const event = {
          _id: Math.random().toString(), // auto generate 
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price, // convert to a number
          date: args.eventInput.date
        }
        // console.log(args)
        // console.log('event 🏅', event)
        events.push(event)
        return event
      }
    },
    //IDE
    graphiql: true
  })
) 

// local host 
app.listen(port, () => {
  console.log('Listening on port', port)
})

// test 
app.get('/', (req, res, next) => {
  res.send('Hello World 🌍') // send a message
})
