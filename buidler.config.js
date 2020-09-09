usePlugin("@nomiclabs/buidler-waffle");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

module.exports = {
  defaultNetwork: "dev",
  networks: {
    buidlerevm: {
    },
    dev: {
      url: "http://localhost:8545",
      accounts: ["0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122", "0xd49743deccbccc5dc7baa8e69e5be03298da8688a15dd202e20f15d5e0e9a9fb", "0x23c601ae397441f3ef6f1075dcb0031ff17fb079837beadaf3c84d96c6f3e569", "0xee9d129c1997549ee09c0757af5939b2483d80ad649a0eda68e8b0357ad11131"]
    },
    poa: {
      url: "http://localhost:8545",
      accounts: ["0xe4f58164bc8bebe85793c40eb08ba14511ea083543ae5946ce7263b4b458b66c"]
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
