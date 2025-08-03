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
        const twapContract = new Contract(twapAddress as string, twapAbi.twap, signer);
        const ercContract = new Contract(makerAsset, twapAbi.ERCABI, signer);

        const symbol = await ercContract.symbol();

        const approvalTx = await ercContract.approve(twapAddress, BigInt(totalAmount));
        approvalTx.wait();
        console.log(approvalTx);
        console.log(makerAsset, takerAsset, totalAmount, chunks, interval, slippageBips);
        const twapCreateTx = await twapContract.createTWAPOrder(
            String(makerAsset),
            String(takerAsset),
            BigInt(totalAmount),
            chunks,
            BigInt(interval),
            slippageBips
        );

        console.log(twapCreateTx);
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

        console.log(twapOrders);
    }

    return { sendTx, cancelOrder, getUserOrders, getOrderDetails, getTokenBalance };
}