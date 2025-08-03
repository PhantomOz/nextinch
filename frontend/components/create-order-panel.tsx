"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TokenSelector } from "@/components/token-selector"
import { X, ArrowDownUp, Clock, Zap } from "lucide-react"
import useSendTx from "@/hooks/send-tx"
import { toast } from "sonner"

interface CreateOrderPanelProps {
  onClose: () => void
}

type TransferAsset = {
  address: string,
  symbol: string,
  decimals: number
}

export function CreateOrderPanel({ onClose }: CreateOrderPanelProps) {
  const { sendTx } = useSendTx();
  const [fromToken, setFromToken] = useState<TransferAsset>({ symbol: "WETH", address: "", decimals: 18 })
  const [toToken, setToToken] = useState<TransferAsset>({ symbol: "USDC", address: "", decimals: 6 })
  const [amount, setAmount] = useState("")
  const [chunks, setChunks] = useState([10])
  const [duration, setDuration] = useState("30")
  const [durationUnit, setDurationUnit] = useState("minutes")
  const [slippage, setSlippage] = useState("1")

  const slippageOptions = ["0.5", "1", "2", "5"]

  const createOrder = () => {
    console.log("Working On Orders");
    toast.loading("Creating Order.....");

    if (fromToken.address === "" || toToken.address == "") {
      toast.error("Select An Asset");
      return
    }
    if (Number(amount) <= 0) {
      toast.error("put a real amount");
      return
    }
    if (Number(duration) <= 1) {
      toast.error("minimum duration is 1");
      return
    }
    if (Number(slippage) <= 0) {
      toast.error("Slippage won't work");
      return;
    }

    let finalDuration = 0;
    if (durationUnit == "minutes") {
      finalDuration = Number(duration) * 60;
    } else {
      finalDuration = Number(duration) * 60 * 60;
    }

    let finalSlippage = Number(slippage) * 100;

    console.log("This is amount >>>", amount);
    console.log((10 ** Number(fromToken.decimals)));
    let finalAmount = Number(amount) * (10 ** fromToken.decimals);
    console.log("This is final amount >>>", finalAmount);


    sendTx(fromToken.address, toToken.address, Number(finalAmount), chunks[0], Number(finalDuration), Number(finalSlippage));
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Create TWAP Order</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-400">From</Label>
            <div className="flex space-x-2">
              <TokenSelector selectedToken={fromToken} onTokenSelect={setFromToken} />
              <Input
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 bg-transparent">
                MAX
              </Button>
            </div>
            <div className="text-xs text-slate-400">Balance: 1,234.56 USDC</div>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowDownUp className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 space-x-2">
            <Label className="text-slate-400">To</Label>
            <TokenSelector selectedToken={toToken} onTokenSelect={setToToken} />
          </div>
        </div>

        {/* TWAP Parameters */}
        <div className="space-y-4">
          <h3 className="text-white font-medium">TWAP Parameters</h3>

          <div className="space-y-2">
            <Label className="text-slate-400">Number of Chunks: {chunks[0]}</Label>
            <Slider value={chunks} onValueChange={setChunks} max={20} min={1} step={1} className="w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-400">Duration per Chunk</Label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Unit</Label>
              <Select value={durationUnit} onValueChange={setDurationUnit}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Slippage Tolerance</Label>
            <div className="flex space-x-2">
              {slippageOptions.map((option) => (
                <Button
                  key={option}
                  variant={slippage === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSlippage(option)}
                  className={slippage === option ? "bg-[#2D6EE6] text-white" : "border-slate-700 text-slate-400"}
                >
                  {option}%
                </Button>
              ))}
              <Input placeholder="Custom" className="w-20 bg-slate-800 border-slate-700 text-white" />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-white font-medium">Order Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Received:</span>
              <span className="text-white">~0.42 ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gas Cost:</span>
              <span className="text-white">~$12.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Duration:</span>
              <span className="text-white">
                {chunks[0] * Number.parseInt(duration)} {durationUnit}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Order will execute over {chunks[0]} chunks</span>
          </div>
        </div>

        {/* Create Order Button */}
        <Button className="w-full bg-[#2D6EE6] hover:bg-[#2D6EE6]/80 text-white" onClick={createOrder}>
          <Zap className="w-4 h-4 mr-2" />
          Create TWAP Order
        </Button>
      </CardContent>
    </Card>
  )
}
