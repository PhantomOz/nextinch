import axios from "axios";


export default function usePrice() {
    const liveTokens: Record<string, string> = {
        "WETH": "0x4200000000000000000000000000000000000006",
        "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "WBTC": "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
        "DAI": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    }

    async function getMarketPrice(makerAsset: string, takerAsset: string, amount: number) {
        const url = `https://api.1inch.dev/swap/v6.1/8453/quote`;
        const params = {
            src: liveTokens[makerAsset],
            dst: liveTokens[takerAsset],
            amount: amount.toString(),
        };

        const response = await axios.get(url, {
            params,
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_INCH_API_KEY}` },
        });

        return response.data.dstAmount;
    }

    return { getMarketPrice }
}