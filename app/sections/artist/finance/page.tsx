"use client"

import { useEffect, useState } from "react"
import { ProfileLayout } from "@/components/layouts/profile-layout"
import { useAuth } from "@/lib/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, BarChart3, Banknote, Calendar, CircleDollarSign, Clock, CreditCard, DollarSign, LineChart, PieChart, TrendingUp, Wallet } from "lucide-react"

// Interfaces para props
interface StatCardProps {
  title: string
  value: string
  description?: string
  icon: React.ReactNode
  trend?: "up" | "down"
  trendValue?: string
}

interface TransactionItemProps {
  date: string
  description: string
  amount: string
  type: "income" | "expense"
}

// Componente para mostrar tarjetas de métricas principales
const StatCard = ({ title, value, description, icon, trend, trendValue }: StatCardProps) => {
  const trendColor = trend === "up" ? "text-green-500" : "text-red-500"
  const TrendIcon = trend === "up" ? ArrowUp : ArrowDown
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          {trend && (
            <span className={`text-xs flex items-center ${trendColor}`}>
              <TrendIcon className="h-3 w-3 mr-1" /> {trendValue}
            </span>
          )}
          {description && (
            <p className="text-xs text-muted-foreground ml-2">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para mostrar transacciones recientes
const TransactionItem = ({ date, description, amount, type }: TransactionItemProps) => {
  const isIncome = type === "income"
  const amountColor = isIncome ? "text-green-500" : "text-red-500"
  const amountPrefix = isIncome ? "+" : "-"
  
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
          {isIncome ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium">{description}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className={`text-sm font-semibold ${amountColor}`}>
        {amountPrefix} ${amount}
      </div>
    </div>
  )
}

export default function FinancePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Datos de ejemplo
  const [stats, setStats] = useState({
    totalEarnings: "$12,750",
    monthlyRevenue: "$2,340",
    pendingPayments: "$1,200",
    averageSale: "$450",
    salesGrowth: "12.5%",
    conversionRate: "8.4%",
    monthlyExpenses: "$890",
    totalSales: 32
  })
  
  const [transactions, setTransactions] = useState([
    {
      id: "1",
      date: "20 Jun 2023",
      description: "Venta de obra 'Atardecer'",
      amount: "650.00",
      type: "income" as const
    },
    {
      id: "2",
      date: "15 Jun 2023",
      description: "Comisión pintura personalizada",
      amount: "480.00",
      type: "income" as const
    },
    {
      id: "3",
      date: "12 Jun 2023",
      description: "Compra de materiales",
      amount: "120.50",
      type: "expense" as const
    },
    {
      id: "4",
      date: "8 Jun 2023",
      description: "Venta en galería",
      amount: "350.00",
      type: "income" as const
    },
    {
      id: "5",
      date: "5 Jun 2023",
      description: "Suscripción plataforma de arte",
      amount: "29.99",
      type: "expense" as const
    }
  ])
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <ProfileLayout role="artist">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout role="artist">
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Panel Financiero</h1>
            <p className="text-gray-600 mt-1">
              Visualiza tus ingresos, ventas y estadísticas financieras
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-md">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Junio 2023</span>
          </div>
        </header>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Ingresos Totales" 
            value={stats.totalEarnings} 
            description="Acumulado anual"
            icon={<Wallet className="h-4 w-4 text-blue-500" />}
            trend="up"
            trendValue="15% vs. año anterior"
          />
          
          <StatCard 
            title="Ingresos Mensuales" 
            value={stats.monthlyRevenue} 
            description="Último mes"
            icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
            trend="up"
            trendValue="8% vs. mes anterior"
          />
          
          <StatCard 
            title="Pagos Pendientes" 
            value={stats.pendingPayments} 
            description="Por cobrar"
            icon={<Clock className="h-4 w-4 text-blue-500" />}
          />
          
          <StatCard 
            title="Precio Promedio" 
            value={stats.averageSale}
            description="Por obra vendida" 
            icon={<DollarSign className="h-4 w-4 text-blue-500" />}
            trend="up"
            trendValue="4.5% vs. mes anterior"
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex gap-2 items-center">
              <PieChart className="h-4 w-4" />
              <span>Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex gap-2 items-center">
              <CreditCard className="h-4 w-4" />
              <span>Transacciones</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex gap-2 items-center">
              <TrendingUp className="h-4 w-4" />
              <span>Análisis</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Pestaña de Resumen */}
          <TabsContent value="overview" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-blue-500" />
                    Evolución de Ventas
                  </CardTitle>
                  <CardDescription>Datos de los últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full flex flex-col items-center justify-center bg-blue-50 rounded-md">
                    <BarChart3 className="h-16 w-16 text-blue-300 mb-2" />
                    <p className="text-sm text-gray-500">Gráfico de evolución de ventas</p>
                    <p className="text-xs text-gray-400 mt-1">Los datos reales se mostrarán con tu información</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-500" />
                    Distribución
                  </CardTitle>
                  <CardDescription>Categorías de obras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full flex flex-col items-center justify-center bg-blue-50 rounded-md">
                    <PieChart className="h-16 w-16 text-blue-300 mb-2" />
                    <p className="text-sm text-gray-500">Gráfico de distribución</p>
                    <p className="text-xs text-gray-400 mt-1">Por categoría de obras vendidas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Métricas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Banknote className="h-5 w-5 mr-2 text-green-500" />
                    Crecimiento de Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">+{stats.salesGrowth}</div>
                  <p className="text-sm text-muted-foreground">vs. mismo periodo año anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CircleDollarSign className="h-5 w-5 mr-2 text-blue-500" />
                    Tasa de Conversión
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.conversionRate}</div>
                  <p className="text-sm text-muted-foreground">Visitas que resultan en venta</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                    Total Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSales}</div>
                  <p className="text-sm text-muted-foreground">Obras vendidas este año</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Pestaña de Transacciones */}
          <TabsContent value="transactions" className="pt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                    Transacciones Recientes
                  </CardTitle>
                  <div className="mt-2 md:mt-0 text-sm text-muted-foreground">
                    Mostrando últimas 5 transacciones
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {transactions.map((transaction) => (
                    <div key={transaction.id}>
                      <TransactionItem
                        date={transaction.date}
                        description={transaction.description}
                        amount={transaction.amount}
                        type={transaction.type}
                      />
                      <Separator className="my-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <ArrowUp className="h-5 w-5 mr-2 text-green-500" />
                    Ingresos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full flex flex-col items-center justify-center bg-green-50 rounded-md">
                    <LineChart className="h-16 w-16 text-green-300 mb-2" />
                    <p className="text-sm text-gray-500">Gráfico de ingresos mensuales</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <ArrowDown className="h-5 w-5 mr-2 text-red-500" />
                    Gastos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full flex flex-col items-center justify-center bg-red-50 rounded-md">
                    <LineChart className="h-16 w-16 text-red-300 mb-2" />
                    <p className="text-sm text-gray-500">Gráfico de gastos mensuales</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Pestaña de Análisis */}
          <TabsContent value="insights" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                    Análisis de Rendimiento
                  </CardTitle>
                  <CardDescription>Datos del último año</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="font-medium mb-2 text-blue-700">Lo Destacado</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <ArrowUp className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Tus ventas han aumentado un 15% en comparación con el año anterior</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowUp className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>El precio promedio de tus obras ha incrementado en un 4.5%</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowDown className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                          <span>Los gastos en materiales representan el 28% de tus ingresos</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3 text-gray-700">Tendencias por Categoría</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Pinturas</span>
                            <span className="text-sm font-medium text-green-500">+18%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Esculturas</span>
                            <span className="text-sm font-medium text-green-500">+10%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Digital</span>
                            <span className="text-sm font-medium text-green-500">+24%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Comisiones</span>
                            <span className="text-sm font-medium text-amber-500">+5%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Wallet className="h-5 w-5 mr-2 text-blue-500" />
                      Balance General
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="flex justify-between py-1">
                        <span className="text-sm">Ingresos totales</span>
                        <span className="text-sm font-semibold">{stats.totalEarnings}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-sm">Gastos totales</span>
                        <span className="text-sm font-semibold text-red-500">- ${stats.monthlyExpenses}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between py-1">
                        <span className="font-medium">Beneficio neto</span>
                        <span className="font-semibold text-green-500">$11,860</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-blue-500" />
                      Proyección
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-3 px-4 bg-blue-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-1">Estimado próximo trimestre</p>
                        <p className="text-xl font-bold text-blue-700">$8,500</p>
                        <p className="text-xs text-gray-500 mt-1">Basado en tendencias actuales</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Acciones recomendadas:</p>
                        <ul className="text-sm space-y-1">
                          <li className="flex items-start">
                            <CircleDollarSign className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                            <span>Aumentar precios en obras de alta demanda</span>
                          </li>
                          <li className="flex items-start">
                            <CircleDollarSign className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                            <span>Optimizar gastos en materiales</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProfileLayout>
  )
}
