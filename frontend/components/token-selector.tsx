"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Search } from "lucide-react"

type TransferAsset = {
  address: string,
  symbol: string
}

interface TokenSelectorProps {
  selectedToken: TransferAsset
  onTokenSelect: (token: TransferAsset) => void
}

export function TokenSelector({ selectedToken, onTokenSelect }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const tokens = [
    { symbol: "WETH", name: "Wrapped Ether", balance: "2.45", logo: "🔷", address: "0x8388d11770031E6a4A113A0D8aFa2226323F0bCb" },
    { symbol: "USDC", name: "USD Coin", balance: "1,234.56", logo: "💵", address: "0x5Aa8F9123B3Bdf340F33DBfA5A5A8EF6654438EC" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15", logo: "₿", address: "0xD87993eb709c1ADf214EF4648d560ADeABc7AdA3" },
    { symbol: "DAI", name: "DAI", balance: "12.34", logo: "🟡", address: "0x75fDf32739e8701B7AF7E40aD888440BEE93fbc1" },
  ]

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase()),
  )


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
          <span className="mr-2">{tokens.find((t) => t.symbol === selectedToken.symbol)?.logo}</span>
          {selectedToken.symbol}
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
              {tokens.map((token) => (
                <Badge
                  key={token.symbol}
                  variant="outline"
                  className="cursor-pointer border-slate-700 hover:bg-slate-800"
                  onClick={() => {
                    onTokenSelect(token)
                    setOpen(false)
                  }}
                >
                  {tokens.find((t) => t.symbol === token.symbol)?.logo} {token.symbol}
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
                  onTokenSelect(token)
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
