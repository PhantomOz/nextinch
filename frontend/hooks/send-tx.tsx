import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { BrowserProvider, Contract, ethers, formatUnits } from "ethers";
import { toast } from "sonner";
import twapAbi from "@/lib/abi.json";

export default function useSendTx() {
    const { address, isConnected } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider("eip155");

    const sendTx = async (makerAsset: string, takerAsset: string, totalAmount: number, chunks: number, interval: number, slippageBips: number) => {
        console.log("This is working");
        if (!isConnected) {
            toast.error("Please connect your wallet");
            return;
        };

        const ethersProvider = new BrowserProvider(walletProvider as any);
        const signer = await ethersProvider.getSigner();
        const twapAddress = process.env.NEXT_PUBLIC_TWAP_ADDRESS;
        // The Contract object
        const ercContract = new Contract(makerAsset, twapAbi.ERCABI, signer);

        const symbol = await ercContract.symbol();

        const approvalTx = await ercContract.approve(twapAddress, BigInt(totalAmount));
        approvalTx.wait();
        console.log(approvalTx);
        const twapContract = new Contract(twapAddress as string, twapAbi.twap, signer);
        setTimeout(async () => {
            console.log(makerAsset, takerAsset, totalAmount, chunks, interval, slippageBips);
            const twapCreateTx = await twapContract.createTWAPOrder(
                String(makerAsset),
                String(takerAsset),
                BigInt(totalAmount),
                chunks,
                BigInt(interval),
                slippageBips
            );
            twapCreateTx.wait();
        }, 5000)

        twapContract.on(
            "ChunkScheduled",
            async (orderId, chunkIndex, executeAfter) => {
                try {
                    console.log(`New chunk scheduled: ${orderId} index ${chunkIndex}`);

                } catch (error) {
                    console.error(`Error processing chunk:`, error);
                }
            }
        );
    }

    const cancelOrder = async (orderId: string) => {
        if (!isConnected) {
            toast.error("Please connect your wallet");
            return;
        };

        const ethersProvider = new BrowserProvider(walletProvider as any);
        const signer = await ethersProvider.getSigner();
        const twapAddress = process.env.NEXT_PUBLIC_TWAP_ADDRESS;
        // The Contract object
        const twapContract = new Contract(twapAddress as string, twapAbi.twap, signer);
        const twapCancelTx = await twapContract.cancelOrder(orderId);

        console.log(twapCancelTx);
    }

    const tokenPairs = {
        "USDC/ETH": {
            id: "USDC/ETH",
            tokenA: "USDC",
            tokenB: "ETH"
        },
        "ETH/DAI": {
            id: "ETH/DAI",
            tokenA: "ETH",
            tokenB: "DAI"
        },
        "USDC/WBTC": {
            id: "USDC/WBTC",
            tokenA: "USDC",
            tokenB: "WBTC"
        },
        "DAI/WBTC": {
            id: "DAI/WBTC",
            tokenA: "DAI",
            tokenB: "WBTC"
        },
        "DAI/USDC": {
            id: "DAI/USDC",
            tokenA: "DAI",
            tokenB: "USDC"
        }
    }

    const tokens = [
        { symbol: "WETH", name: "Wrapped Ether", balance: "2.45", logo: "🔷", address: "0x8388d11770031E6a4A113A0D8aFa2226323F0bCb", decimals: 18 },
        { symbol: "USDC", name: "USD Coin", balance: "1,234.56", logo: "💵", address: "0x5Aa8F9123B3Bdf340F33DBfA5A5A8EF6654438EC", decimals: 6 },
        { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15", logo: "₿", address: "0xD87993eb709c1ADf214EF4648d560ADeABc7AdA3", decimals: 8 },
        { symbol: "DAI", name: "DAI", balance: "12.34", logo: "🟡", address: "0x75fDf32739e8701B7AF7E40aD888440BEE93fbc1", decimals: 18 },
    ]

    const getUserOrders = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet");
            return;
        };

        const ethersProvider = new BrowserProvider(walletProvider as any);
        const signer = await ethersProvider.getSigner();
        const twapAddress = process.env.NEXT_PUBLIC_TWAP_ADDRESS;
        // The Contract object
        const twapContract = new Contract(twapAddress as string, twapAbi.twap, signer);
        const twapOrders = await twapContract.getUserOrders(address);

        console.log(twapOrders);
        // id: "1",
        //     pair: "USDC/ETH",
        //         type: "Buy",
        //             amount: "1,000 USDC",
        //                 progress: 65,
        //                     chunksExecuted: 13,
        //                         totalChunks: 20,
        //                             status: "Active",
        //                                 created: "2024-01-15 14:30"
        const allUsersOrder = [];
        for (let i = 0; i < twapOrders.length; i++) {
            const orderdetail = await getOrderDetails(twapOrders[i]);
            const [pair, type] = await getOrderPairType(orderdetail.makerAsset, orderdetail.takerAsset);
            const makerAsset = tokens.find(token => token.address === orderdetail.makerAsset);
            const makerDecimal = makerAsset?.decimals;

            const detail = {
                id: twapOrders[i],
                pair,
                type,
                amount: `${ethers.formatUnits(orderdetail.totalAmount, makerDecimal)} ${makerAsset?.symbol}`,
                progress: Number(orderdetail.chunksExecuted) * 100 / Number(orderdetail.chunks),
                chunksExecuted: orderdetail.chunksExecuted,
                totalChunks: orderdetail.chunks,
                status: orderdetail.cancelled ? "Cancelled" : orderdetail.chunks === orderdetail.chunksExecuted ? "Completed" : "Active",
                created: orderdetail.startTime,
                moreDetails: orderdetail
            }
            allUsersOrder.push(detail);
        };
        console.log("Orders>>>>", allUsersOrder);
        return allUsersOrder;
    }



    function getOrderPairType(maker: string, taker: string): any {
        const makerToken = tokens.find(token => token.address === maker);
        const takerToken = tokens.find(token => token.address === taker);
        const rand = parseInt(Math.random().toString());
        let type = "Sell";
        if (rand > 0) {
            type = "Buy";
        }
        return [`${makerToken?.symbol}/${takerToken?.symbol}`, type]
    }

    const getTokenBalance = async (makerAsset: string) => {
        if (!isConnected) {
            toast.error("Please connect your wallet");
            return;
        };

        const ethersProvider = new BrowserProvider(walletProvider as any);
        const signer = await ethersProvider.getSigner();
        const ercContract = new Contract(makerAsset, twapAbi.ERCABI, signer);

        const balance = await ercContract.balanceOf(address);

        return balance;
    }

    const getOrderDetails = async (orderId: string) => {
        if (!isConnected) {
            toast.error("Please connect your wallet");
            return;
        };

        const ethersProvider = new BrowserProvider(walletProvider as any);
        const signer = await ethersProvider.getSigner();
        const twapAddress = process.env.NEXT_PUBLIC_TWAP_ADDRESS;
        // The Contract object
        const twapContract = new Contract(twapAddress as string, twapAbi.twap, signer);
        const twapOrders = await twapContract.getOrderDetails(orderId);

        console.log(twapOrders);
        return twapOrders;
    }

    return { sendTx, cancelOrder, getUserOrders, getOrderDetails, getTokenBalance, tokenPairs };
}