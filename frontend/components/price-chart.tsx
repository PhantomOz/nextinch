"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

export function PriceChart() {
  const timeframes = ["1H", "4H", "1D", "1W", "1M"]

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">ETH/USDC</CardTitle>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-bold text-white">$2,387.45</span>
            <Badge className="bg-[#00D395] text-black">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.34%
            </Badge>
          </div>
        </div>
        <div className="flex space-x-1">
          {timeframes.map((tf, index) => (
            <Button
              key={tf}
              variant={index === 2 ? "default" : "outline"}
              size="sm"
              className={index === 2 ? "bg-[#2D6EE6] text-white" : "border-slate-700 text-slate-400"}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-slate-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>Price chart visualization</p>
            <p className="text-sm">Chart component would be integrated here</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div>
            <div className="text-slate-400">24h High</div>
            <div className="text-white font-medium">$2,421.67</div>
          </div>
          <div>
            <div className="text-slate-400">24h Low</div>
            <div className="text-white font-medium">$2,298.12</div>
          </div>
          <div>
            <div className="text-slate-400">24h Volume</div>
            <div className="text-white font-medium">$1.2B</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
