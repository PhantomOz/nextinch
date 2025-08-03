const ethers = require("ethers");
const abi = require("./abi.json");
const {
  LimitOrder,
  MakerTraits,
  Address,
  Sdk,
  randBigInt,
  FetchProviderConnector,
} = require("@1inch/limit-order-sdk");
const axios = require("axios");

class Worker {
  constructor(rpcUrl, contractAddress, privateKey, networkId, authKey, wss) {
    console.log(rpcUrl, contractAddress, privateKey, networkId, authKey);
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wss = new ethers.WebSocketProvider(wss);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, abi.twap, this.wallet);
    this.wssContract = new ethers.Contract(contractAddress, abi.twap, this.wss);
    this.networkId = networkId;
    this.authKey = authKey;
  }

  async start() {
    console.log("TWAP Worker started");

    // Listen for chunk scheduling events
    this.wssContract.on(
      "ChunkScheduled",
      async (orderId, chunkIndex, executeAfter) => {
        try {
          console.log(`New chunk scheduled: ${orderId} index ${chunkIndex}`);

          // Wait until execution time
          const delay = Number(executeAfter) * 1000 - Date.now();
          if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          await this.processChunk(orderId, chunkIndex);
        } catch (error) {
          console.error(`Error processing chunk:`, error);
        }
      }
    );
  }
  async processChunk(orderId, chunkIndex) {
    // Get order details
    const order = await this.contract.getOrderDetails(orderId);

    // Skip if cancelled or already executed
    if (order.cancelled || order.chunksExecuted > chunkIndex) {
      return;
    }

    // Get current price from 1inch API
    const price = await this.getMarketPrice(
      order.makerAsset,
      order.takerAsset,
      order.chunkSize
    );

    // Calculate min output with slippage
    const minTakerAmount = this.calculateMinAmount(
      price,
      order.chunkSize,
      order.slippageBips
    );

    const expiration =
      Math.floor(Date.now() / 1000) + Number(order.interval) * 2;

    // see MakerTraits.ts
    const makerTraits = MakerTraits.default();
    // Build limit order
    const liveTokens = {
      "0x8388d11770031E6a4A113A0D8aFa2226323F0bCb":
        "0x4200000000000000000000000000000000000006",
      "0x5Aa8F9123B3Bdf340F33DBfA5A5A8EF6654438EC":
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "0xD87993eb709c1ADf214EF4648d560ADeABc7AdA3":
        "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
      "0x75fDf32739e8701B7AF7E40aD888440BEE93fbc1":
        "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    };
    const Order = new LimitOrder(
      {
        makerAsset: new Address(liveTokens[order.makerAsset]),
        takerAsset: new Address(liveTokens[order.takerAsset]),
        makingAmount: BigInt(order.chunkSize.toString()),
        takingAmount: BigInt(minTakerAmount.toString()),
        maker: new Address(this.wallet.address),
        receiver: new Address(order.maker),
      },
      makerTraits
    );

    // Sign order
    const typedData = Order.getTypedData();
    const signature = await this.wallet.signTypedData(
      typedData.domain,
      { Order: typedData.types.Order },
      typedData.message
    );

    // Simulate order (using 1inch API)
    const simulation = await this.simulateOrder(order, signature);

    if (simulation.success) {
      console.log(`Chunk ${chunkIndex} simulated successfully`);

      // Update on-chain state
      const tx = await this.contract.completeChunk(orderId, chunkIndex);
      await tx.wait();

      console.log(`Chunk ${chunkIndex} completed on-chain`);
    } else {
      console.warn(`Chunk ${chunkIndex} simulation failed`);
      // Implement retry logic here
    }
  }

  async getMarketPrice(makerAsset, takerAsset, amount) {
    const liveTokens = {
      "0x8388d11770031E6a4A113A0D8aFa2226323F0bCb":
        "0x4200000000000000000000000000000000000006",
      "0x5Aa8F9123B3Bdf340F33DBfA5A5A8EF6654438EC":
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "0xD87993eb709c1ADf214EF4648d560ADeABc7AdA3":
        "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
      "0x75fDf32739e8701B7AF7E40aD888440BEE93fbc1":
        "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    };
    try {
      const url = `https://api.1inch.dev/swap/v6.1/8453/quote`;
      const params = {
        src: liveTokens[makerAsset],
        dst: liveTokens[takerAsset],
        amount: amount.toString(),
      };

      const response = await axios.get(url, {
        params,
        headers: { Authorization: `Bearer ${this.authKey}` },
      });

      return response.data.dstAmount;
    } catch (error) {
      console.log(error.message);
      return 3000000000;
    }
  }

  calculateMinAmount(price, amount, slippageBips) {
    return (
      (BigInt(price) * BigInt(amount) * (10000n - BigInt(slippageBips))) /
      10000n
    );
  }

  async simulateOrder(order, signature) {
    console.log(order);
    try {
      console.log(order.makerAsset, order.takerAsset, order.chunkSize);
      // Get current price from 1inch API
      const price = await this.getMarketPrice(
        order.makerAsset,
        order.takerAsset,
        order.chunkSize
      );

      // Calculate min output with slippage
      const minTakerAmount = this.calculateMinAmount(
        price,
        order.chunkSize,
        order.slippageBips
      );

      const takerAmountReceived = await this.getMarketPrice(
        order.makerAsset,
        order.takerAsset,
        minTakerAmount
      );
      const asset = new ethers.Contract(
        order.takerAsset,
        abi.ERCABI,
        this.wallet
      );
      const success = await asset.mint(order.maker, takerAmountReceived);
      console.log("Checking Success >>>>", success);
      success.wait();

      return {
        success: success,
        gasUsed: success.gasPrice || 0,
        takerAmountReceived: takerAmountReceived,
      };
    } catch (error) {
      console.error(
        "Simulation failed:",
        error.response?.data || error.message
      );
      return { success: false };
    }
  }
}

module.exports = Worker;
