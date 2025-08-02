import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppKit, useAppKitAccount, useAppKitBalance } from "@reown/appkit/react";
import { Wallet } from "lucide-react"
import { useState, useEffect } from "react";


export default function ConnectButton() {
    // 4. Use modal hook
    const { open } = useAppKit();
    const { address, isConnected } =
        useAppKitAccount();
    const { fetchBalance } = useAppKitBalance();
    const [balance, setBalance] = useState<any>();

    useEffect(() => {
        if (isConnected) {
            fetchBalance().then(x => {
                console.log(x);
                setBalance(x);
            });
        }
    }, [fetchBalance, isConnected]);

    return (
        <>
            {isConnected ? (
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-[#00D395] text-black">
                        {Number(balance?.data?.formatted || balance?.data?.balance).toFixed(2)} {balance?.data?.symbol}
                    </Badge>
                    <Button variant="outline" className="border-slate-700 bg-slate-800">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </Button>
                </div>
            ) : (
                <Button onClick={() => open({ view: "Connect", namespace: "eip155" })} className="bg-[#2D6EE6] hover:bg-[#2D6EE6]/80">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                </Button>
            )}
        </>
    );
}