"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/auth-context'
import { UserRole } from '../../../types/auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card"
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'

export default function FinancialPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Proteção extra no nível da página
  useEffect(() => {
    if (!loading && user?.role !== UserRole.SALON_OWNER) {
      // Redireciona para o dashboard do salão se não for owner
      router.push('/salon/dashboard') 
    }
  }, [user, loading, router])

  if (loading || user?.role !== UserRole.SALON_OWNER) {
    // Mostra carregando ou nada enquanto verifica/redireciona
    return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">Carregando...</div>;
  }

  // Mock data - Substituir por dados reais da API
  const financialSummary = {
    todayRevenue: 1248.50,
    monthRevenue: 18760.00,
    avgTicket: 95.70,
    pendingPayments: 350.00,
    topService: "Escova Progressiva",
    topProfessional: "Camila Costa",
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financeiro</CardTitle>
          <CardDescription>Acompanhe o desempenho financeiro do salão.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Card Faturamento Hoje */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {financialSummary.todayRevenue.toFixed(2)}</div>
                {/* <p className="text-xs text-muted-foreground">+5% vs ontem</p> */}
              </CardContent>
            </Card>
             {/* Card Faturamento Mês */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {financialSummary.monthRevenue.toFixed(2)}</div>
                {/* <p className="text-xs text-muted-foreground">+12% vs mês passado</p> */}
              </CardContent>
            </Card>
             {/* Card Ticket Médio */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {financialSummary.avgTicket.toFixed(2)}</div>
                {/* <p className="text-xs text-muted-foreground">+2.1% vs mês passado</p> */}
              </CardContent>
            </Card>
             {/* Card Pagamentos Pendentes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {financialSummary.pendingPayments.toFixed(2)}</div>
                {/* <p className="text-xs text-muted-foreground">3 agendamentos</p> */}
              </CardContent>
            </Card>
          </div>

          {/* Adicionar gráficos e relatórios detalhados aqui */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Relatórios Detalhados (Em Breve)</h3>
            <p className="text-muted-foreground">
              Em breve, você poderá visualizar relatórios detalhados de faturamento por período, 
              desempenho por profissional, serviços mais rentáveis e muito more.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}