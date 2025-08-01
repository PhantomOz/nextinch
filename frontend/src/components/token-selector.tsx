"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Search } from "lucide-react"

interface TokenSelectorProps {
  selectedToken: string
  onTokenSelect: (token: string) => void
}

export function TokenSelector({ selectedToken, onTokenSelect }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.45", logo: "🔷" },
    { symbol: "USDC", name: "USD Coin", balance: "1,234.56", logo: "💵" },
    { symbol: "USDT", name: "Tether", balance: "890.12", logo: "💰" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15", logo: "₿" },
    { symbol: "MATIC", name: "Polygon", balance: "5,678.90", logo: "🔮" },
    { symbol: "BNB", name: "Binance Coin", balance: "12.34", logo: "🟡" },
  ]

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase()),
  )

  const commonTokens = ["ETH", "USDC", "USDT", "WBTC"]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
          <span className="mr-2">{tokens.find((t) => t.symbol === selectedToken)?.logo}</span>
          {selectedToken}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Common Tokens */}
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Common tokens</div>
            <div className="flex flex-wrap gap-2">
              {commonTokens.map((token) => (
                <Badge
                  key={token}
                  variant="outline"
                  className="cursor-pointer border-slate-700 hover:bg-slate-800"
                  onClick={() => {
                    onTokenSelect(token)
                    setOpen(false)
                  }}
                >
                  {tokens.find((t) => t.symbol === token)?.logo} {token}
                </Badge>
              ))}
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredTokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer"
                onClick={() => {
                  onTokenSelect(token.symbol)
                  setOpen(false)
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{token.logo}</span>
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-slate-400">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{token.balance}</div>
                  <div className="text-sm text-slate-400">{token.symbol}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
