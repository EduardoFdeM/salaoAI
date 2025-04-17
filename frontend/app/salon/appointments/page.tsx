"use client"

import { useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, CalendarDays, ListFilter, List } from 'lucide-react'
import { Appointment, AppointmentStatus, Client, Professional, Service } from '@/types/salon'
import { AppointmentForm } from '@/components/appointments/appointment-form'

// Configuração do localizador para o calendário
const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Mock data - Substituir pela chamada à API real
const MOCK_CLIENTS_MAP: Record<string, Pick<Client, 'id' | 'name'>> = {
  'c1': { id: 'c1', name: 'Ana Silva'},
  'c2': { id: 'c2', name: 'Carlos Mendes'},
  'c3': { id: 'c3', name: 'Julia Pereira'},
};
const MOCK_PROFESSIONALS_MAP: Record<string, Pick<Professional, 'id' | 'name'>> = {
  'p1': { id: 'p1', name: 'Marcos Oliveira'},
  'p2': { id: 'p2', name: 'Camila Costa'},
  'p3': { id: 'p3', name: 'Renata Lima'},
};
 const MOCK_SERVICES_MAP: Record<string, Pick<Service, 'id' | 'name'>> = {
  's1': { id: 's1', name: 'Corte Feminino'},
  's2': { id: 's2', name: 'Barba'},
  's3': { id: 's3', name: 'Coloração'},
  's4': { id: 's4', name: 'Manicure'},
};

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', start_time: '2023-11-15T09:00:00Z', end_time: '2023-11-15T10:00:00Z', client_id: 'c1', professional_id: 'p1', service_id: 's1', salon_id: '1', status: AppointmentStatus.CONFIRMED },
  { id: 'a2', start_time: '2023-11-15T10:30:00Z', end_time: '2023-11-15T11:00:00Z', client_id: 'c2', professional_id: 'p2', service_id: 's2', salon_id: '1', status: AppointmentStatus.SCHEDULED },
  { id: 'a3', start_time: '2023-11-15T11:00:00Z', end_time: '2023-11-15T12:30:00Z', client_id: 'c3', professional_id: 'p2', service_id: 's3', salon_id: '1', status: AppointmentStatus.CONFIRMED },
  { id: 'a4', start_time: '2023-11-15T14:00:00Z', end_time: '2023-11-15T14:45:00Z', client_id: 'c1', professional_id: 'p1', service_id: 's1', salon_id: '1', status: AppointmentStatus.COMPLETED },
  { id: 'a5', start_time: '2023-11-16T15:30:00Z', end_time: '2023-11-16T16:15:00Z', client_id: 'c2', professional_id: 'p3', service_id: 's4', salon_id: '1', status: AppointmentStatus.SCHEDULED },
  { id: 'a6', start_time: '2023-11-16T16:00:00Z', end_time: '2023-11-16T17:00:00Z', client_id: 'c3', professional_id: 'p1', service_id: 's1', salon_id: '1', status: AppointmentStatus.CANCELLED_BY_CLIENT },
];

function getStatusBadgeVariant(status: AppointmentStatus): "default" | "secondary" | "destructive" | "outline" {
   switch (status) {
    case AppointmentStatus.CONFIRMED:
    case AppointmentStatus.COMPLETED:
      return "default"; // Verde (padrão do Shadcn)
    case AppointmentStatus.SCHEDULED:
    case AppointmentStatus.WAITING:
    case AppointmentStatus.IN_PROGRESS:
      return "secondary"; // Azul/Amarelo (usando secondary por ora)
    case AppointmentStatus.CANCELLED_BY_CLIENT:
    case AppointmentStatus.CANCELLED_BY_SALON:
    case AppointmentStatus.NO_SHOW:
      return "destructive"; // Vermelho
    default:
      return "outline"; // Cinza/Default
  }
}

function formatStatus(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: 'Agendado',
    [AppointmentStatus.CONFIRMED]: 'Confirmado',
    [AppointmentStatus.CANCELLED_BY_CLIENT]: 'Cancelado (Cliente)',
    [AppointmentStatus.CANCELLED_BY_SALON]: 'Cancelado (Salão)',
    [AppointmentStatus.COMPLETED]: 'Concluído',
    [AppointmentStatus.NO_SHOW]: 'Não Compareceu',
    [AppointmentStatus.WAITING]: 'Aguardando',
    [AppointmentStatus.IN_PROGRESS]: 'Em Andamento',
  };
  return map[status] || status;
}

// Tipos para os filtros
type SortField = 'date' | 'client' | 'service' | 'professional' | 'status'
type SortOrder = 'asc' | 'desc'
type FilterState = {
  dateRange: { start: Date | null; end: Date | null }
  professional: string | null
  service: string | null
  status: AppointmentStatus | null
  sortBy: SortField
  sortOrder: SortOrder
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: null, end: null },
    professional: null,
    service: null,
    status: null,
    sortBy: 'date',
    sortOrder: 'asc'
  })
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>()

  // Converter agendamentos para eventos do calendário
  const calendarEvents = appointments.map(appt => ({
    id: appt.id,
    title: `${MOCK_CLIENTS_MAP[appt.client_id]?.name} - ${MOCK_SERVICES_MAP[appt.service_id]?.name}`,
    start: new Date(appt.start_time),
    end: new Date(appt.end_time),
    resource: appt
  }))

  const handleAddAppointment = () => {
    setSelectedAppointment(undefined)
    setShowNewAppointment(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowNewAppointment(true)
  }

  const handleSubmitAppointment = (data: Partial<Appointment>) => {
    // Implementar lógica de criação/edição
    console.log('Dados do agendamento:', data)
    setShowNewAppointment(false)
  }

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    // Implementar lógica de filtragem e ordenação
  }

  const sortAppointments = (appointments: Appointment[]) => {
    return [...appointments].sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return filters.sortOrder === 'asc' 
            ? new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            : new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        case 'client':
          return filters.sortOrder === 'asc'
            ? (MOCK_CLIENTS_MAP[a.client_id]?.name || '').localeCompare(MOCK_CLIENTS_MAP[b.client_id]?.name || '')
            : (MOCK_CLIENTS_MAP[b.client_id]?.name || '').localeCompare(MOCK_CLIENTS_MAP[a.client_id]?.name || '')
        // Implementar outros casos de ordenação
        default:
          return 0
      }
    })
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('pt-BR', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>Visualize e gerencie os agendamentos do salão.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ListFilter className="mr-2 h-4 w-4" /> Filtros
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filtros e Ordenação</DialogTitle>
                    <DialogDescription>
                      Ajuste os filtros e a ordem dos agendamentos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ordenar por</label>
                      <Select
                        value={filters.sortBy}
                        onValueChange={(value: SortField) => handleFilterChange({ sortBy: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o campo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Data</SelectItem>
                          <SelectItem value="client">Cliente</SelectItem>
                          <SelectItem value="service">Serviço</SelectItem>
                          <SelectItem value="professional">Profissional</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Adicionar mais filtros aqui */}
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleAddAppointment} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento
              </Button>
            </div>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as 'table' | 'calendar')} className="mt-6">
            <TabsList>
              <TabsTrigger value="table">
                <List className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendário
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="table" className="m-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Serviço</TableHead>
                  <TableHead className="hidden sm:table-cell">Profissional</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {appointments.length > 0 ? appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{formatDateTime(appt.start_time)}</TableCell>
                    <TableCell>{MOCK_CLIENTS_MAP[appt.client_id]?.name || 'Desconhecido'}</TableCell>
                    <TableCell className="hidden md:table-cell">{MOCK_SERVICES_MAP[appt.service_id]?.name || 'Desconhecido'}</TableCell>
                    <TableCell className="hidden sm:table-cell">{MOCK_PROFESSIONALS_MAP[appt.professional_id]?.name || 'Desconhecido'}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(appt.status)}>
                         {formatStatus(appt.status)}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="icon" onClick={() => handleEditAppointment(appt)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      {/* Adicionar outras ações como cancelar, confirmar, etc. */}
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum agendamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="calendar" className="m-0">
            <div className="h-[600px]">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                defaultView="day"
                views={['day', 'week', 'month']}
                messages={{
                  next: "Próximo",
                  previous: "Anterior",
                  today: "Hoje",
                  month: "Mês",
                  week: "Semana",
                  day: "Dia"
                }}
                culture="pt-BR"
              />
            </div>
          </TabsContent>
        </CardContent>
      </Card>

      <AppointmentForm
        open={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        onSubmit={handleSubmitAppointment}
        appointment={selectedAppointment}
        clients={Object.values(MOCK_CLIENTS_MAP)}
        professionals={Object.values(MOCK_PROFESSIONALS_MAP)}
        services={Object.values(MOCK_SERVICES_MAP)}
      />
    </>
  )
} 