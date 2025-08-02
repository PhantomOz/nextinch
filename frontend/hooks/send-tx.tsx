import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { BrowserProvider, Contract, ethers, formatUnits } from "ethers";
import { toast } from "sonner";
import twapAbi from "@/lib/abi.json";

export default function useSendTx() {
    const { address, isConnected } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider("eip155");

    const sendTx = async (makerAsset: string, takerAsset: string, totalAmount: number, chunks: number, interval: number, slippageBips: number) => {
        if (!isConnected) {
            toast.error("Please connect your wallet");
            return;
        };

        const ethersProvider = new BrowserProvider(walletProvider as any);
        const signer = await ethersProvider.getSigner();
        const twapAddress = process.env.NEXT_PUBLIC_TWAP_ADDRESS;
        // The Contract object
        const twapContract = new Contract(twapAddress, twapAbi.twap, signer);
        const twapCreateTx = await twapContract.createTWAPOrder(
            makerAsset,
            takerAsset,
            totalAmount,
            chunks,
            interval,
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
        const twapContract = new Contract(twapAddress, twapAbi.twap, signer);
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
        const twapContract = new Contract(twapAddress, twapAbi.twap, signer);
        const twapOrders = await twapContract.getUserOrders(address);

        console.log(twapOrders);
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
        const twapContract = new Contract(twapAddress, twapAbi.twap, signer);
        const twapOrders = await twapContract.getOrderDetails(orderId);

        console.log(twapOrders);
    }

    return { sendTx, cancelOrder, getUserOrders, getOrderDetails };
}