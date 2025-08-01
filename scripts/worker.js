const ethers = require("ethers");
const abi = require("./abi.json");

class Worker {
  constructor(rpcUrl, contractAddress, privateKey) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, abi.twap, this.wallet);
  }
}
