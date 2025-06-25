import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "ethereum-starter",
  description:
    "This project can be use as a starting point for developing your new Ethereum SubQuery project",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: ">=6.1.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /**
     * chainId is the EVM Chain ID, for Ethereum this is 1
     * https://chainlist.org/chain/1
     */
    chainId: "1",
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: [
      "wss://lb.drpc.org/ogws?network=ethereum&dkey=ArT8p5S52UM0rgz3Qb99bmsedepYUR8R8JLJrqRhf0fE",
      "https://eth.llamarpc.com",
      "https://eth-mainnet.public.blastapi.io",
      "wss://eth.drpc.org",
      "https://ethereum-rpc.publicnode.com",
      "wss://ethereum-rpc.publicnode.com",
      "https://1rpc.io/eth",
      "https://rpc.mevblocker.io",
      "https://0xrpc.io/eth",
      "https://eth.rpc.blxrbdn.com",
      "https://eth-mainnet.rpcfast.com?api_key=xbhWBI1Wkguk8SNMu1bvvLurPGLXmgwYeC4S6g2H7WdwFigZSmPWVZRxrskEQwIf",
      "https://ethereum.public.blockpi.network/v1/rpc/public",
      "https://gateway.tenderly.co/public/mainnet",
      "https://eth.blockrazor.xyz",
      "https://rpc.flashbots.net",
      "https://rpc.therpc.io/ethereum",
    ],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 19426500,

      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Block,
            handler: "handleBlock",
          },
        ],
      },
    },
  ],
  repository: "https://github.com/subquery/ethereum-subql-starter",
};

// Must set default to the project instance
export default project;
