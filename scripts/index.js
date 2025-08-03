const Worker = require("./worker.js");
const dotenv = require("dotenv");

dotenv.config();

// --- CONFIGURATION ---
const PROVIDER_URL = "http://127.0.0.1:8545/"; // Hardhat node
const SYSTEM_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // MUST MATCH the one set in the contract
const TWAP_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const CHAIN_ID = 31337; // Hardhat

// Initialize worker
const worker = new Worker(
  process.env.RPC_URL,
  process.env.CONTRACT_ADDRESS,
  process.env.WORKER_PK,
  process.env.CHAIN_ID,
  process.env.INCH_API_KEY,
  process.env.WSS
);
worker.start();
