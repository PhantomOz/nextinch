"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { OrderTable } from "@/components/order-table"
import { CreateOrderPanel } from "@/components/create-order-panel"
import { PriceChart } from "@/components/price-chart"
import { RecentActivity } from "@/components/recent-activity"
import { OrderDetailModal } from "@/components/order-detail-modal"

export default function Dashboard() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showCreateOrder, setShowCreateOrder] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header onCreateOrder={() => setShowCreateOrder(true)} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <PortfolioSummary />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <OrderTable onViewOrder={setSelectedOrder} />
            {/* <PriceChart /> */}
          </div>

          <div className="space-y-6">
            {showCreateOrder && <CreateOrderPanel onClose={() => setShowCreateOrder(false)} />}
            {/* <RecentActivity /> */}
          </div>
        </div>
      </main>

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  )
}
