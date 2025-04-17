"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types/auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, DollarSign, Printer } from 'lucide-react'

// Mock data
const MOCK_TRANSACTIONS = [
  { id: 't1', time: '09:15', client: 'Ana Silva', service: 'Corte Feminino', amount: 80.00, method: 'Cartão Débito', status: 'Pago' },
  { id: 't2', time: '10:45', client: 'Carlos Mendes', service: 'Barba', amount: 50.00, method: 'PIX', status: 'Pago' },
  { id: 't3', time: '11:10', client: 'Julia Pereira', service: 'Coloração', amount: 120.00, method: 'Cartão Crédito', status: 'Pago' },
  { id: 't4', time: '14:50', client: 'Pedro Alves', service: 'Corte Masculino', amount: 50.00, method: 'Dinheiro', status: 'Pago' },
  { id: 't5', time: '15:40', client: 'Mariana Torres', service: 'Manicure', amount: 30.00, method: '-', status: 'Pendente' },
]

const MOCK_SUMMARY = {
  totalRevenue: 300.00,
  pendingRevenue: 30.00,
  transactions: 5,
  cash: 50.00,
  card: 200.00,
  pix: 50.00,
}

export default function CashierPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Proteção extra na página
   useEffect(() => {
    if (!loading && user?.role !== UserRole.RECEPTIONIST) {
      // Redireciona para o dashboard do salão se não for recepcionista
      router.push('/salon/dashboard') 
    }
  }, [user, loading, router])

  if (loading || user?.role !== UserRole.RECEPTIONIST) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">Carregando...</div>;
  }
  
  const handleRegisterPayment = () => {
      console.log("Registrar pagamento");
      // Abrir modal para selecionar agendamento/cliente e registrar pagamento
  }
  
   const handleCloseCashier = () => {
      console.log("Fechar caixa");
      // Lógica para fechar o caixa do dia, gerar relatório, etc.
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                 <CardTitle>Caixa</CardTitle>
                 <CardDescription>Registre pagamentos e acompanhe o movimento do dia.</CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={handleCloseCashier}>
                      <Printer className="mr-2 h-4 w-4" /> Fechar Caixa
                  </Button>
                 <Button onClick={handleRegisterPayment} className="flex-grow sm:flex-grow-0">
                    <PlusCircle className="mr-2 h-4 w-4" /> Registrar Pagamento
                 </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
           {/* Resumo do Caixa */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-6 border-b pb-6">
              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Recebido</p>
                  <p className="text-lg font-bold">R$ {MOCK_SUMMARY.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
               <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                 <DollarSign className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pendente</p>
                  <p className="text-lg font-bold">R$ {MOCK_SUMMARY.pendingRevenue.toFixed(2)}</p>
                </div>
              </div>
               <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                 <DollarSign className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Dinheiro</p>
                  <p className="text-lg font-bold">R$ {MOCK_SUMMARY.cash.toFixed(2)}</p>
                </div>
              </div>
               <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                 <DollarSign className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Cartão</p>
                  <p className="text-lg font-bold">R$ {MOCK_SUMMARY.card.toFixed(2)}</p>
                </div>
              </div>
               <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                  <DollarSign className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-sm text-muted-foreground">PIX</p>
                  <p className="text-lg font-bold">R$ {MOCK_SUMMARY.pix.toFixed(2)}</p>
                </div>
              </div>
            </div>

          {/* Tabela de Transações */}
          <h3 className="text-lg font-semibold mb-4">Transações do Dia</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="hidden md:table-cell">Método</TableHead>
                <TableHead>Status</TableHead>
                 {/* <TableHead className="text-right">Ações</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TRANSACTIONS.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.time}</TableCell>
                  <TableCell className="font-medium">{t.client}</TableCell>
                  <TableCell className="hidden sm:table-cell">{t.service}</TableCell>
                  <TableCell>R$ {t.amount.toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">{t.method}</TableCell>
                  <TableCell>
                     <Badge variant={t.status === 'Pago' ? 'default' : 'destructive'}>
                       {t.status}
                     </Badge>
                  </TableCell>
                  {/* <TableCell className="text-right">
                    {t.status === 'Pendente' && (
                      <Button variant="outline" size="sm">Registrar Pagamento</Button>
                    )}
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}