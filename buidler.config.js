module.exports = {
  defaultNetwork: "dev",
  networks: {
    buidlerevm: {
    },
    dev: {
      url: "https://rinkeby.infura.io/v3/123abc123abc123abc123abc123abcde",
      accounts: ["0xa44f8cce3611ca899e7737d59705f6b42dd63d9e"]
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/123abc123abc123abc123abc123abcde",
      accounts: []
    }
  },
  solc: {
    version: "0.6.2",
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}
