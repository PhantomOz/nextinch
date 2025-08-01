import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, ArrowUpRight, ArrowDownLeft } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      type: "buy",
      pair: "ETH/USDC",
      amount: "0.5 ETH",
      price: "$2,387.45",
      time: "2 min ago",
      txHash: "0x1234...5678",
    },
    {
      type: "sell",
      pair: "MATIC/USDC",
      amount: "1,000 MATIC",
      price: "$0.89",
      time: "15 min ago",
      txHash: "0x9876...5432",
    },
    {
      type: "buy",
      pair: "WBTC/USDT",
      amount: "0.02 WBTC",
      price: "$43,567.89",
      time: "1 hour ago",
      txHash: "0xabcd...efgh",
    },
    {
      type: "sell",
      pair: "BNB/BUSD",
      amount: "5 BNB",
      price: "$312.45",
      time: "2 hours ago",
      txHash: "0x5678...1234",
    },
  ]

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${activity.type === "buy" ? "bg-[#00D395]/20" : "bg-red-500/20"}`}>
                {activity.type === "buy" ? (
                  <ArrowDownLeft className={`w-4 h-4 ${activity.type === "buy" ? "text-[#00D395]" : "text-red-400"}`} />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <div className="text-white font-medium">
                  {activity.type === "buy" ? "Bought" : "Sold"} {activity.amount}
                </div>
                <div className="text-sm text-slate-400">
                  {activity.pair} • {activity.time}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">{activity.price}</div>
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <span>{activity.txHash}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
