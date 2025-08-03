"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, X, ArrowUpDown } from "lucide-react"
import { useEffect, useState } from "react"
import { useAppKitAccount } from "@reown/appkit/react"
import useSendTx from "@/hooks/send-tx"
import { ethers } from "ethers";
import twapAbi from "@/lib/abi.json";


interface OrderTableProps {
  onViewOrder: (order: any) => void
}

export function OrderTable({ onViewOrder }: OrderTableProps) {
  const { address, isConnected } =
    useAppKitAccount();
  const { getUserOrders, cancelOrder } = useSendTx();
  const [orders, setOrders] = useState<any>([]);

  const listenToEvent = async () => {
    try {
      const wsProvider = new ethers.WebSocketProvider(
        process.env.NEXT_PUBLIC_WSS as string
      );

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_TWAP_ADDRESS as string,
        twapAbi.twap,
        wsProvider
      );

      // listen to any event on the contract using event name
      contract.on("ChunkScheduled",
        async (orderId, chunkIndex, executeAfter) => {
          getUserOrders().then(orders => {
            setOrders(orders)
          })
        });

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      getUserOrders().then(orders => {
        setOrders(orders)
      })
      listenToEvent();
    }

    // Clean up the event listener when the component unmounts
    return () => {
      const wsProvider = new ethers.WebSocketProvider(
        process.env.NEXT_PUBLIC_WSS as string
      );

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_TWAP_ADDRESS as string,
        twapAbi.twap,
        wsProvider
      );
      contract.removeAllListeners('ChunkScheduled');
    };

  }, [isConnected])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#00D395] text-black"
      case "Completed":
        return "bg-blue-500 text-white"
      case "Cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "Buy" ? "text-[#00D395]" : "text-red-400"
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Active Orders
          <Button variant="outline" size="sm" className="border-slate-700 bg-transparent">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Pair</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400">Progress</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order: any) => (
                <TableRow key={order.id} className="border-slate-800">
                  <TableCell className="text-white font-medium">{order.pair}</TableCell>
                  <TableCell className={`font-medium ${getTypeColor(order.type)}`}>{order.type}</TableCell>
                  <TableCell className="text-slate-300">{order.amount}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={order.progress} className="w-20" />
                      <div className="text-xs text-slate-400">
                        {order.chunksExecuted}/{order.totalChunks} chunks
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-700 hover:bg-slate-800 bg-transparent"
                        onClick={() => onViewOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {order.status === "Active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-700 text-red-400 hover:bg-red-900 bg-transparent"
                          onClick={() => { cancelOrder(order.id) }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
