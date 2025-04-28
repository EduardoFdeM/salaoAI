"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, DollarSign, Pen, Scissors, ShoppingBag, Users } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface DashboardData {
  totalAppointments: number;
  todayAppointmentsCount: number;
  todayAppointments: any[];
  professionals: number;
  services: number;
  clients: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  topServices: any[];
  topProfessionals: any[];
}

export default function SalonDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/salon/dashboard')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do dashboard')
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error('Erro:', err)
        setError('Não foi possível carregar os dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]">Carregando dados...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Erro</CardTitle>
          <CardDescription>Ocorreu um problema ao carregar os dados</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Verifique sua conexão ou tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    </div>
  }

  // Usando os dados da API
  const {
    totalAppointments,
    todayAppointmentsCount,
    todayAppointments,
    professionals,
    services,
    clients,
    dailyRevenue,
    monthlyRevenue,
    topServices,
    topProfessionals
  } = dashboardData || {
    totalAppointments: 0,
    todayAppointmentsCount: 0,
    todayAppointments: [],
    professionals: 0,
    services: 0,
    clients: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0,
    topServices: [],
    topProfessionals: []
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">
        Bem-vindo, {user?.name}! Aqui está um resumo do seu salão.
      </p>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayAppointmentsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Total de {totalAppointments} agendamentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {dailyRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +10.1% em relação a ontem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients}</div>
                <p className="text-xs text-muted-foreground">
                  +2 novos clientes hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {monthlyRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +18.2% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Serviços e Profissionais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Serviços</CardTitle>
                <CardDescription>
                  Você tem {services} serviços ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Scissors className="h-8 w-8 text-primary" />
        </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Top serviços do mês:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      1. {topServices[0]?.name || 'Serviço'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      2. {topServices[1]?.name || 'Serviço'}
                    </p>
                </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Profissionais</CardTitle>
                <CardDescription>
                  Você tem {professionals} profissionais ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Pen className="h-8 w-8 text-primary" />
                </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Mais agendados:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {topProfessionals[0]?.name || 'Profissional'}
                      </p>
                </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Hoje disponíveis:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {professionals} profissionais
                      </p>
              </div>
            </div>
                </div>
              </CardContent>
            </Card>
      </div>

      {/* Próximos Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>
                Agendamentos para hoje ({todayAppointmentsCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments && todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.slice(0, 5).map((appointment, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
        </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {appointment.client?.name || 'Cliente'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service?.name || 'Serviço'} com {appointment.professional?.name || 'Profissional'}
                        </p>
        </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(appointment.startTime).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                </div>
              </div>
            ))}
          </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum agendamento para hoje.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium">Análises em desenvolvimento</h3>
            <p className="text-muted-foreground mt-2">
              Esta seção está sendo desenvolvida e estará disponível em breve.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium">Relatórios em desenvolvimento</h3>
            <p className="text-muted-foreground mt-2">
              Esta seção está sendo desenvolvida e estará disponível em breve.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 