const { ApolloServer } = require("apollo-server")
const { ApolloGateway, RemoteGraphQlDataSource } = require("apollo-gateway")
require("dotenv").config()

const astraToken = process.env.REACT_APP_ASTRA_TOKEN

class StargateGraphQLDataSource extends RemoteGraphQlDataSource {
  willSendRequest({ request, context }) {
    request.http.headers.set("x-cassandra-token", astraToken)
  }
}

const gateway = new ApolloGateway({
  serviceList: [
    {
      name: "coins",
      url:
        "https://449a21f3-9bb8-4941-b0ab-fe040bc58391-westeurope.apps.astra.datastax.com/api/graphql/coins",
    },
    {
      name: "deals",
      url: "",
    },
  ],
  introspectionHeaders: {
    "x-cassandra-token": astraToken,
  },
  buildService({ name, url }) {
    if (name === "coins") {
      return new StargateGraphQLDataSource({ url })
    } else {
      return new RemoteGraphQlDataSource()
    }
  },
  __exposeQueryPlanExperiment: true,
})

;async () => {
  const server = new ApolloServer({
    gateway,
    engine: false,
    subscriptions: false,
  })
}

server.listen().then(({ url }) => {
  console.log(`Gateway ready at ${url}`)
})
