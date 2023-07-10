/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  defaultNetwork: 'ganache',
  networks: {
    ganache: {
      url: "http://0.0.0.0:8545",
      accounts : [PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: false,
        runs: 1000,
      },
    },
  },
};
