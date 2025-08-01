"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Wallet, FileText, BarChart3, Plus } from "lucide-react"

interface HeaderProps {
    onCreateOrder: () => void
}

export function Header({ onCreateOrder }: HeaderProps) {
    const [selectedNetwork, setSelectedNetwork] = useState("Ethereum")
    const [isConnected, setIsConnected] = useState(false)

    const networks = [
        { name: "Ethereum", color: "bg-blue-500" },
        { name: "Polygon", color: "bg-purple-500" },
        { name: "BSC", color: "bg-yellow-500" },
    ]

    return (
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#2D6EE6] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">1</span>
                        </div>
                        <h1 className="text-xl font-bold text-white">Nextinch</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Button variant="ghost" className="text-white hover:text-[#2D6EE6]">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={onCreateOrder}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Order
                        </Button>
                        <Button variant="ghost" className="text-slate-400 hover:text-white">
                            <FileText className="w-4 h-4 mr-2" />
                            Docs
                        </Button>
                    </nav>

                    {/* Network and Wallet */}
                    <div className="flex items-center space-x-3">
                        {/* Network Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700">
                                    <div
                                        className={`w-2 h-2 rounded-full mr-2 ${networks.find((n) => n.name === selectedNetwork)?.color}`}
                                    />
                                    {selectedNetwork}
                                    <ChevronDown className="w-4 h-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700">
                                {networks.map((network) => (
                                    <DropdownMenuItem
                                        key={network.name}
                                        onClick={() => setSelectedNetwork(network.name)}
                                        className="hover:bg-slate-700"
                                    >
                                        <div className={`w-2 h-2 rounded-full mr-2 ${network.color}`} />
                                        {network.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Wallet Connection */}
                        {isConnected ? (
                            <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="bg-[#00D395] text-black">
                                    2.45 ETH
                                </Badge>
                                <Button variant="outline" className="border-slate-700 bg-slate-800">
                                    0x1234...5678
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => setIsConnected(true)} className="bg-[#2D6EE6] hover:bg-[#2D6EE6]/80">
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}