"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Share, X, Clock, CheckCircle } from "lucide-react"
import useSendTx from "@/hooks/send-tx"

interface OrderDetailModalProps {
  order: any
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const { cancelOrder } = useSendTx();

  const executions = [
    {
      chunk: 1,
      amount: "50 USDC",
      price: "$2,385.67",
      timestamp: "2024-01-15 14:30:15",
      txHash: "0x1234...5678",
      status: "completed",
    },
    {
      chunk: 2,
      amount: "50 USDC",
      price: "$2,387.23",
      timestamp: "2024-01-15 15:00:45",
      txHash: "0x2345...6789",
      status: "completed",
    },
    {
      chunk: 3,
      amount: "50 USDC",
      price: "$2,389.12",
      timestamp: "2024-01-15 15:30:22",
      txHash: "0x3456...7890",
      status: "pending",
    },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Order Details</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Overview */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-400">Trading Pair</div>
                <div className="text-lg font-medium">{order.pair}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Order Type</div>
                <div className={`text-lg font-medium ${order.type === "Buy" ? "text-[#00D395]" : "text-red-400"}`}>
                  {order.type}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Amount</div>
                <div className="text-lg font-medium">{order.amount}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Status</div>
                <Badge
                  className={
                    order.status === "Active"
                      ? "bg-[#00D395] text-black"
                      : order.status === "Completed"
                        ? "bg-blue-500 text-white"
                        : "bg-red-500 text-white"
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Execution Progress</span>
              <span className="text-white">
                {order.chunksExecuted}/{order.totalChunks} chunks
              </span>
            </div>
            <Progress value={order.progress} className="w-full" />
            <div className="text-sm text-slate-400">{order.progress}% completed</div>
          </div>

          <Separator className="bg-slate-800" />

          {/* Execution Timeline */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Execution Timeline</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {executions.map((execution, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${execution.status === "completed" ? "bg-[#00D395]/20" : "bg-yellow-500/20"
                        }`}
                    >
                      {execution.status === "completed" ? (
                        <CheckCircle className="w-4 h-4 text-[#00D395]" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">Chunk {execution.chunk}</div>
                      <div className="text-sm text-slate-400">
                        {execution.amount} at {execution.price}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">{execution.timestamp}</div>
                    {execution.status === "completed" && (
                      <div className="flex items-center space-x-1 text-xs text-slate-400">
                        <span>{execution.txHash}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {order.status === "Active" && (
              <Button variant="outline" className="border-red-700 text-red-400 hover:bg-red-900 bg-transparent" onClick={() => cancelOrder(order.id)}>
                Cancel Order
              </Button>
            )}
            <Button variant="outline" className="border-slate-700 text-slate-400 bg-transparent">
              <Share className="w-4 h-4 mr-2" />
              Share Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
