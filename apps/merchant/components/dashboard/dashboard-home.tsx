"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MessageSquare, ShoppingCart } from "lucide-react";

// TODO: Fetch real data from API
const chartData = [
  { day: "Seg", sales: 4000 },
  { day: "Ter", sales: 3000 },
  { day: "Qua", sales: 2000 },
  { day: "Qui", sales: 2780 },
  { day: "Sex", sales: 1890 },
  { day: "Sab", sales: 2390 },
  { day: "Dom", sales: 3490 },
];

// TODO: Fetch real data from API
const recentOrders = [
  {
    id: "1",
    customer: "Akhil Sharma",
    amount: "R$ 1.250,00",
    status: "Entregue",
    date: "02/12/2024 10:30",
  },
  {
    id: "2",
    customer: "Priya Gupta",
    amount: "R$ 902,50",
    status: "Pendente",
    date: "02/12/2024 09:15",
  },
  {
    id: "3",
    customer: "Rajesh Kumar",
    amount: "R$ 2.103,75",
    status: "Entregue",
    date: "01/12/2024 16:22",
  },
  {
    id: "4",
    customer: "Neha Patel",
    amount: "R$ 475,00",
    status: "Processando",
    date: "01/12/2024 14:10",
  },
  {
    id: "5",
    customer: "Arjun Singh",
    amount: "R$ 2.701,25",
    status: "Entregue",
    date: "01/12/2024 11:45",
  },
];

const statusConfig: Record<string, string> = {
  Entregue: "bg-green-100 text-green-800",
  Pendente: "bg-yellow-100 text-yellow-800",
  Processando: "bg-blue-100 text-blue-800",
};

export const DashboardHome = () => (
  <div className="p-6 space-y-6">
    {/* Metrics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            Receita Total
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">R$ 14.250,00</div>
          <p className="text-xs text-muted-foreground mt-1">
            +12% da semana anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            Mensagens Enviadas
            <MessageSquare className="w-4 h-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">2.547</div>
          <p className="text-xs text-muted-foreground mt-1">Via API Gupshup</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            Pedidos Ativos
            <ShoppingCart className="w-4 h-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">23</div>
          <p className="text-xs text-muted-foreground mt-1">
            Aguardando entrega
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Chart */}
    <Card>
      <CardHeader>
        <CardTitle>Vendas dos últimos 7 dias</CardTitle>
        <CardDescription>Divisão de receita por dia</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "var(--radius)",
              }}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            />
            <Legend />
            <Bar dataKey="sales" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Recent Activity */}
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Últimos 5 pedidos da sua loja</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{order.customer}</p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {order.amount}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    statusConfig[order.status as keyof typeof statusConfig]
                  } border-0`}
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
