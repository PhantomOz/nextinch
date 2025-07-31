const ethers = require("ethers");
const positionManagerABI = require("./abi.json");

// --- CONFIGURATION ---
const PROVIDER_URL = "http://127.0.0.1:8545/"; // Hardhat node
const SYSTEM_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // MUST MATCH the one set in the contract
const POSITION_MANAGER_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const CHAIN_ID = 31337; // Hardhat

const WETH = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const USDC = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const USDC_DECIMALS = 6;
const CHAINLINK_ETH_USD_PRICE_FEED =
  "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Mainnet

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const systemWallet = new ethers.Wallet(SYSTEM_PRIVATE_KEY, provider);

const positionManagerContract = new ethers.Contract(
  POSITION_MANAGER_ADDRESS,
  positionManagerABI.positionManager,
  systemWallet
);

async function getLiveEthPrice() {
  // right returns Mocks
  return 300_000_000_000 / 1e8;
}
