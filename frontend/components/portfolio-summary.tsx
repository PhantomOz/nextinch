import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useSendTx from "@/hooks/send-tx";
import { useAppKitAccount } from "@reown/appkit/react"
import { TrendingUp, Clock, CheckCircle, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"

export function PortfolioSummary() {
  const { address, isConnected } =
    useAppKitAccount();
  const { getUserOrders } = useSendTx();
  const [stats, setStats] = useState([
    // {
    //   title: "Total Portfolio Value",
    //   value: "$24,567.89",
    //   change: "+12.5%",
    //   icon: DollarSign,
    //   positive: true,
    // },
    {
      title: "Active Orders",
      value: "-",
      change: "-",
      icon: Clock,
      positive: true,
    },
    {
      title: "Completed Orders",
      value: "-",
      change: "-",
      icon: CheckCircle,
      positive: true,
    },
    // {
    //   title: "Total Volume",
    //   value: "$1.2M",
    //   change: "+8.3%",
    //   icon: TrendingUp,
    //   positive: true,
    // },
  ]);

  useEffect(() => {
    if (isConnected) {
      getUserOrders().then(orders => {
        const active = orders?.filter(order => order.status === "Active");
        const activeStats = stats[0];
        activeStats.value = String(active?.length) || "-";
        activeStats.change = String(`${active?.length} executing`) || "";

        const completeStats = stats[1];
        const completed = orders?.filter(order => order.status === "Completed");
        completeStats.value = String(completed?.length) || "-";
        completeStats.change = "";

        const newStats = [activeStats, completeStats];

        setStats(newStats);
      })
    }

  }, [isConnected])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className={`text-xs ${stat.positive ? "text-[#00D395]" : "text-red-400"}`}>{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
