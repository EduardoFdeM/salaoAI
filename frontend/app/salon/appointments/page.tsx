"use client"

import { useState, useCallback, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, CalendarDays, ListFilter, List, Trash2 } from 'lucide-react'
import { Appointment, AppointmentStatus, Client, Professional, Service, SalonUser } from '@/types/salon'
import { AppointmentForm } from '@/components/appointments/appointment-form'
import { AppointmentDetails } from '@/components/appointments/appointment-details'
import { Calendar as DatePicker } from "@/components/ui/calendar"

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
  // Garantir que todos os status do enum sejam mapeados
  const map: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: 'Pendente', // Adicionado
    [AppointmentStatus.SCHEDULED]: 'Agendado',
    [AppointmentStatus.CONFIRMED]: 'Confirmado',
    [AppointmentStatus.WAITING]: 'Aguardando',
    [AppointmentStatus.IN_PROGRESS]: 'Em Andamento',
    [AppointmentStatus.COMPLETED]: 'Concluído',
    [AppointmentStatus.CANCELLED]: 'Cancelado', // Adicionado
    [AppointmentStatus.CANCELLED_BY_CLIENT]: 'Cancelado (Cliente)',
    [AppointmentStatus.CANCELLED_BY_SALON]: 'Cancelado (Salão)',
    [AppointmentStatus.NO_SHOW]: 'Não Compareceu',
  };
  return map[status] || status.toString(); // Fallback para o próprio valor do enum
}

export default function AppointmentsPage() {
  // --- ESTADOS PARA DADOS REAIS ---
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<SalonUser[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // --- FIM ESTADOS ---

  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>()
  const [calendarView, setCalendarView] = useState<View>('day')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: null, end: null },
    professional: null,
    service: null,
    status: null,
    sortBy: 'date',
    sortOrder: 'asc'
  })

  // --- BUSCAR DADOS DA API --- 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usar Promise.all para buscar dados em paralelo
        const [clientsRes, professionalsRes, servicesRes, appointmentsRes] = await Promise.all([
          fetch('/api/salon/clients'),
          fetch('/api/salon/professionals'),
          fetch('/api/salon/services'),
          fetch('/api/salon/appointments') // Usando a API route existente
        ]);

        // Verificar todas as respostas
        if (!clientsRes.ok || !professionalsRes.ok || !servicesRes.ok || !appointmentsRes.ok) {
          // Log detalhado do erro
          const errorDetails = {
            clients: { status: clientsRes.status, text: await clientsRes.text().catch(() => 'Error reading text') },
            professionals: { status: professionalsRes.status, text: await professionalsRes.text().catch(() => 'Error reading text') },
            services: { status: servicesRes.status, text: await servicesRes.text().catch(() => 'Error reading text') },
            appointments: { status: appointmentsRes.status, text: await appointmentsRes.text().catch(() => 'Error reading text') },
          };
          console.error('Falha ao carregar dados:', errorDetails);
          throw new Error('Falha ao carregar dados essenciais');
        }

        // Extrair JSON de todas as respostas
        const [clientsData, professionalsData, servicesData, appointmentsData] = await Promise.all([
          clientsRes.json(),
          professionalsRes.json(),
          servicesRes.json(),
          appointmentsRes.json()
        ]);

        // Log para verificar a estrutura dos dados recebidos
        console.log("Dados recebidos - Clientes:", clientsData);
        console.log("Dados recebidos - Profissionais:", professionalsData);
        console.log("Dados recebidos - Serviços:", servicesData);
        console.log("Dados recebidos - Agendamentos:", appointmentsData);

        // Atualizar estados
        setAppointments(appointmentsData);
        setClients(clientsData);
        // Garantir que professionalsData seja um array de SalonUser
        setProfessionals(Array.isArray(professionalsData) ? professionalsData : []); 
        setServices(servicesData);

      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro inesperado');
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // Executa na montagem do componente
  // --- FIM BUSCAR DADOS ---

  // Função para encontrar nome por ID (exemplo para clientes)
  const getClientName = (appointment: Appointment): string => {
    return appointment.client?.name || 'Desconhecido';
  };
  const getProfessionalName = (appointment: Appointment): string => {
    return appointment.professional?.user?.name || appointment.professional?.name || 'Desconhecido';
  };
  const getServiceName = (appointment: Appointment): string => {
    return appointment.service?.name || 'Desconhecido';
  };

  // Converter agendamentos para eventos do calendário
  const calendarEvents = appointments.map(appt => ({
    id: appt.id,
    title: getClientName(appt),
    start: new Date(appt.startTime),
    end: new Date(appt.endTime),
    resource: appt
  }))

  const handleAddAppointment = () => {
    setSelectedAppointment(undefined)
    setShowNewAppointment(true)
    setShowDetailsModal(false)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowNewAppointment(true)
    setShowDetailsModal(false)
  }

  const handleOpenEditFromDetails = (appointment: Appointment) => {
    handleEditAppointment(appointment)
  }

  const handleOpenDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
    setShowNewAppointment(false)
  }

  const handleSubmitAppointment = async (data: Partial<Appointment>) => {
    setLoading(true) // Indicar carregamento
    setError(null)
    const isEditing = !!selectedAppointment?.id;
    const url = isEditing ? `/api/salon/appointments/${selectedAppointment.id}` : '/api/salon/appointments';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} agendamento`);
      }

      const savedAppointment = await response.json();

      // Atualizar a lista local de agendamentos
      if (isEditing) {
        setAppointments(prev => 
          prev.map(appt => appt.id === savedAppointment.id ? savedAppointment : appt)
        );
      } else {
        setAppointments(prev => [...prev, savedAppointment]);
      }
      setShowNewAppointment(false) // Fechar modal

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado');
      console.error("Erro ao salvar agendamento:", err);
      // Manter modal aberto em caso de erro para o usuário corrigir
    } finally {
      setLoading(false)
    }
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
            ? new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            : new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        case 'client':
          return filters.sortOrder === 'asc'
            ? (getClientName(a) || '').localeCompare(getClientName(b) || '')
            : (getClientName(b) || '').localeCompare(getClientName(a) || '')
        case 'service':
          return filters.sortOrder === 'asc'
            ? (getServiceName(a) || '').localeCompare(getServiceName(b) || '')
            : (getServiceName(b) || '').localeCompare(getServiceName(a) || '')
        case 'professional':
          return filters.sortOrder === 'asc'
            ? (getProfessionalName(a) || '').localeCompare(getProfessionalName(b) || '')
            : (getProfessionalName(b) || '').localeCompare(getProfessionalName(a) || '')
        case 'status':
          return filters.sortOrder === 'asc'
            ? getStatusBadgeVariant(a.status) === 'default' ? -1 : 1
            : getStatusBadgeVariant(b.status) === 'default' ? 1 : -1
        default:
          return 0
      }
    })
  }

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'Sem Data';
    try {
      // Tentar parsear a data - pode vir como Date ou string
      const date = typeof isoString === 'string' ? parseISO(isoString) : isoString;
      if (isValid(date)) { 
        return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR }); // Usar date-fns format
      } else {
        console.warn("Data inválida recebida para formatDateTime:", isoString);
        return 'Data Inválida';
      }
    } catch (e) {
      console.error("Erro ao formatar data:", isoString, e);
      return 'Erro Data';
    }
  }

  // Handlers para ações do calendário
  const handleCalendarNavigate = useCallback((newDate: Date, view: View) => {
    setCalendarDate(newDate)
    setCalendarView(view)
  }, [])

  const handleCalendarViewChange = useCallback((view: View) => {
    setCalendarView(view)
  }, [])

  const handleSelectEvent = useCallback((event: any) => {
    // Quando clicar em um evento no calendário, abrir detalhes
    const appointment = event.resource as Appointment
    if (appointment) {
      handleOpenDetails(appointment)
    }
  }, [])

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/salon/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
         let errorMsg = 'Erro ao cancelar agendamento';
         try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
         } catch (e) { /* Ignora erro no json */ }
         throw new Error(errorMsg);
      }

      // Remover o agendamento da lista local após sucesso
      setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
      
      // Comentado: Opção 2 anterior (atualizar status)
      /*setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: AppointmentStatus.CANCELLED } 
            : appt
        )
      );*/

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado ao cancelar');
      console.error("Erro ao cancelar agendamento:", err);
    } finally {
      setLoading(false);
    }
  };

  // FILTRAR AGENDAMENTOS ANTES DE ORDENAR
  const filterAppointments = (appointments: Appointment[]) => {
    return appointments.filter(appt => {
      // Filtro por data (apenas data, ignora hora)
      if (filters.dateRange.start && filters.dateRange.end) {
        const apptDate = new Date(appt.startTime);
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        // Zerar hora para comparar apenas data
        apptDate.setHours(0,0,0,0);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        if (apptDate < start || apptDate > end) return false;
      }
      // Filtros futuros: profissional, serviço, status...
      return true;
    });
  };

  const renderTableView = () => {
    if (loading) return <p>Carregando agendamentos...</p>;
    if (error) return <p className="text-destructive">Erro ao carregar: {error}</p>;

    const sortedAppointments = sortAppointments(filterAppointments(appointments)); // Aplicar filtro e ordenação

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora Início</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Serviço</TableHead>
            <TableHead className="hidden sm:table-cell">Profissional</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAppointments.length > 0 ? sortedAppointments.map((appt) => (
            <TableRow key={appt.id}>
              <TableCell className="font-medium">{formatDateTime(appt.startTime)}</TableCell>
              <TableCell>{getClientName(appt)}</TableCell>
              <TableCell className="hidden md:table-cell">{getServiceName(appt)}</TableCell>
              <TableCell className="hidden sm:table-cell">{getProfessionalName(appt)}</TableCell>
              <TableCell>
                <Select
                  value={appt.status}
                  onValueChange={async (newStatusValue) => {
                    const newStatus = newStatusValue as AppointmentStatus; // Cast para o tipo enum
                    if (newStatus !== appt.status) {
                      setLoading(true);
                      try {
                        const response = await fetch(`/api/salon/appointments/${appt.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: newStatus }), 
                        });
                        if (!response.ok) throw new Error('Erro ao atualizar status');
                        const updatedAppointment = await response.json(); // Obter resposta completa
                        setAppointments(prev => prev.map(a => a.id === appt.id ? updatedAppointment : a));
                      } catch (e) {
                        alert('Erro ao atualizar status!');
                        console.error("Erro ao atualizar status:", e);
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AppointmentStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {formatStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" onClick={() => handleEditAppointment(appt)} disabled={loading}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => handleCancelAppointment(appt.id)} 
                  disabled={loading || appt.status === AppointmentStatus.CANCELLED || appt.status === AppointmentStatus.COMPLETED || appt.status === AppointmentStatus.NO_SHOW} // Desabilitar se já cancelado/concluído
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Cancelar</span>
                </Button>
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
    );
  }

  const renderCalendarView = () => {
    if (loading) return <p>Carregando calendário...</p>;
    if (error) return <p className="text-destructive">Erro ao carregar: {error}</p>;
    
    return (
      <div className="h-[600px] max-w-full">
        <Calendar
          localizer={localizer}
          events={filterAppointments(appointments).map(appt => ({
            id: appt.id,
            title: getClientName(appt),
            start: new Date(appt.startTime),
            end: new Date(appt.endTime),
            resource: appt
          }))}
          startAccessor="start"
          endAccessor="end"
          view={calendarView}
          date={calendarDate}
          onNavigate={handleCalendarNavigate}
          onView={handleCalendarViewChange}
          onSelectEvent={handleSelectEvent}
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
          popup
          className="rounded-md bg-background"
          dayPropGetter={(date) => {
            const today = new Date()
            return {
              className: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 'rbc-today' : ''
            }
          }}
          eventPropGetter={(event) => {
            // Temporariamente desabilitar a lógica de cores para teste
            /*
            const appointment = event.resource as Appointment
            let backgroundColor = 'var(--primary)'
            
            if (appointment) {
              switch (appointment.status) {
                case AppointmentStatus.CONFIRMED:
                  backgroundColor = 'var(--chart-2)'; 
                  break;
                case AppointmentStatus.SCHEDULED:
                  backgroundColor = 'var(--chart-4)'; 
                  break;
                case AppointmentStatus.CANCELLED_BY_CLIENT:
                case AppointmentStatus.CANCELLED_BY_SALON:
                case AppointmentStatus.CANCELLED:
                  backgroundColor = 'var(--destructive)'; 
                  break;
                case AppointmentStatus.COMPLETED:
                  backgroundColor = 'var(--chart-3)'; 
                  break;
                default:
                  break;
              }
            }
            
            return {
              style: { backgroundColor }
            }
            */
           return {}; // Retornar objeto vazio para usar estilos padrão
          }}
        />
      </div>
    )
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Filtrar por Data</label>
                      <DatePicker
                        mode="range"
                        selected={filters.dateRange.start && filters.dateRange.end ? { from: filters.dateRange.start, to: filters.dateRange.end } : undefined}
                        onSelect={(range: { from?: Date; to?: Date } | undefined) => {
                          handleFilterChange({
                            dateRange: {
                              start: range?.from ?? null,
                              end: range?.to ?? null,
                            },
                          });
                        }}
                        numberOfMonths={1}
                        locale={ptBR}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFilterChange({ dateRange: { start: null, end: null } })}
                        >
                          Limpar Data
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            handleFilterChange({
                              dateRange: { start: today, end: today },
                            });
                          }}
                        >
                          Hoje
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const start = new Date(today);
                            start.setDate(today.getDate() - today.getDay()); // Domingo
                            const end = new Date(today);
                            end.setDate(today.getDate() + (6 - today.getDay())); // Sábado
                            handleFilterChange({
                              dateRange: { start, end },
                            });
                          }}
                        >
                          Esta Semana
                        </Button>
                      </div>
                    </div>
                    {/* Adicionar mais filtros aqui */}
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleAddAppointment} className="w-full sm:w-auto" disabled={loading}>
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
          {view === 'table' ? renderTableView() : renderCalendarView()}
          {/* Exibir erro geral se houver */}
          {error && !loading && view !== 'table' && view !== 'calendar' && 
            <p className="text-destructive mt-4">Erro: {error}</p>
          }
        </CardContent>
      </Card>

      <AppointmentDetails
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        appointment={selectedAppointment}
        onEdit={handleOpenEditFromDetails}
      />

      <AppointmentForm
        open={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        onSubmit={handleSubmitAppointment}
        appointment={selectedAppointment}
        clients={clients}
        professionals={professionals.map(prof => ({ 
          id: prof.id, 
          name: prof.user?.name || prof.name || `ID ${prof.id.substring(0,4)}?`,
        }))}
        services={services}
      />
    </>
  )
} 