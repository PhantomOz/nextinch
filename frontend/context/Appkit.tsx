"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { baseSepolia } from "@reown/appkit/networks";

// 1. Get projectId at https://dashboard.reown.com
const projectId = "b30c52a8788617b7b3482e9136a49088";

// 2. Create a metadata object
const metadata = {
    name: "My Website",
    description: "My Website description",
    url: "https://mywebsite.com", // origin must match your domain & subdomain
    icons: ["https://avatars.mywebsite.com/"],
};

// 3. Create the AppKit instance
createAppKit({
    adapters: [new EthersAdapter()],
    metadata,
    networks: [baseSepolia],
    projectId,
    features: {
        analytics: true, // Optional - defaults to your Cloud configuration
    },
});

export function AppKit({ children }: { children: React.ReactNode }) {
    return (
        <div>{children}</div>
    );
}