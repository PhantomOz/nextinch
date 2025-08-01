const ethers = require("ethers");
const abi = require("./abi.json");
const {
  LimitOrder,
  MakerTraits,
  Address,
  Sdk,
  randBigInt,
  FetchProviderConnector,
} = "@1inch/limit-order-sdk";

class Worker {
  constructor(rpcUrl, contractAddress, privateKey, networkId, authKey) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, abi.twap, this.wallet);
    this.networkId = networkId;
    this.authKey = authKey;
  }

  async start() {
    console.log("TWAP Worker started");

    // Listen for chunk scheduling events
    this.contract.on(
      "ChunkScheduled",
      async (orderId, chunkIndex, executeAfter) => {
        try {
          console.log(`New chunk scheduled: ${orderId} index ${chunkIndex}`);

          // Wait until execution time
          const delay = executeAfter * 1000 - Date.now();
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

    const expiration = Math.floor(Date.now() / 1000) + order.interval * 2;

    const UINT_40_MAX = (1n << 48n) - 1n;

    // see MakerTraits.ts
    const makerTraits = MakerTraits.default()
      .withExpiration(expiration)
      .withNonce(randBigInt(UINT_40_MAX));

    const sdk = new Sdk({
      authKey: this.authKey,
      networkId: this.networkId,
      httpConnector: new FetchProviderConnector(),
    });

    // Build limit order
    const Order = sdk.createOrder(
      {
        makerAsset: new Address(order.makerAsset),
        takerAsset: new Address(order.takerAsset),
        makingAmount: BigInt(order.chunkSize.toString()),
        takingAmount: BigInt(minTakerAmount.toString()),
        maker: this.contract.address,
        receiver: new Address(order.maker),
      },
      makerTraits
    );

    // Sign order
    const typedData = Order.getTypedData();
    const signature = await maker.signTypedData(
      typedData.domain,
      { Order: typedData.types.Order },
      typedData.message
    );

    // Simulate order (using 1inch API)
    const simulation = await this.simulateOrder(Order, signature);

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
    const url = `https://api.1inch.dev/swap/v6.1/8453/quote`;
    const params = {
      src: makerAsset,
      dst: takerAsset,
      amount: amount.toString(),
    };

    const response = await axios.get(url, {
      params,
      headers: { Authorization: `Bearer ${process.env.INCH_API_KEY}` },
    });

    return response.data.dstAmount;
  }

  calculateMinAmount(price, amount, slippageBips) {
    return (
      (BigInt(price) * BigInt(amount) * (10000n - BigInt(slippageBips))) /
      10000n
    );
  }

  async simulateOrder(order, signature) {
    try {
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
        takerAsset,
        minTakerAmount
      );
      const asset = new ethers.Contract(takerAsset, abi.ERCABI, this.wallet);
      const success = await asset.mint(order.maker, takerAmountReceived);
      console.log("Checking Success >>>>", success);
      success.wait();

      return {
        success: success,
        gasUsed: gasUsed || 0,
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
