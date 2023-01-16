import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
      accounts: [process.env.WALLET_PRIVATE_KEY!]
    },
    avax_mainnet: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
      accounts: [process.env.WALLET_PRIVATE_KEY!]
    }
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: process.env.FUJI_PRIVATE_KEY!,
    },
  },paths: {
    artifacts: "./artifacts"
  }
};

export default config;
