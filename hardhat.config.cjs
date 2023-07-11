/** @type import('hardhat/config').HardhatUserConfig */

const {PRIVATE_KEY} = require("./web3/config.js");

module.exports = {
  defaultNetwork: 'ganache',
  networks: {
    ganache: {
      url: "http://0.0.0.0:8545",
      accounts : [PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: false,
        runs: 1000,
      },
    },
  },
};
