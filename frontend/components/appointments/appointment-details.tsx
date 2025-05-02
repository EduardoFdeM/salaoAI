import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Appointment, AppointmentStatus, Client, Professional, Service } from '@/types/salon'; // Usar tipos completos
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper function to format status (copied from page.tsx for encapsulation)
function formatStatus(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: 'Pendente',
    [AppointmentStatus.SCHEDULED]: 'Agendado',
    [AppointmentStatus.CONFIRMED]: 'Confirmado',
    [AppointmentStatus.WAITING]: 'Aguardando',
    [AppointmentStatus.IN_PROGRESS]: 'Em Andamento',
    [AppointmentStatus.COMPLETED]: 'Concluído',
    [AppointmentStatus.CANCELLED]: 'Cancelado',
    [AppointmentStatus.CANCELLED_BY_CLIENT]: 'Cancelado (Cliente)',
    [AppointmentStatus.CANCELLED_BY_SALON]: 'Cancelado (Salão)',
    [AppointmentStatus.NO_SHOW]: 'Não Compareceu',
  };
  return map[status] || status.toString();
}

// Helper function to get badge variant (copied from page.tsx for encapsulation)
function getStatusBadgeVariant(status: AppointmentStatus): "default" | "secondary" | "destructive" | "outline" {
   switch (status) {
    case AppointmentStatus.CONFIRMED:
    case AppointmentStatus.COMPLETED:
      return "default";
    case AppointmentStatus.SCHEDULED:
    case AppointmentStatus.WAITING:
    case AppointmentStatus.IN_PROGRESS:
      return "secondary";
    case AppointmentStatus.CANCELLED_BY_CLIENT:
    case AppointmentStatus.CANCELLED_BY_SALON:
    case AppointmentStatus.CANCELLED:
    case AppointmentStatus.NO_SHOW:
      return "destructive";
    default:
      return "outline";
  }
}

interface AppointmentDetailsProps {
  open: boolean;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  appointment: Appointment | null | undefined;
}

export function AppointmentDetails({ 
  open, 
  onClose, 
  onEdit, 
  appointment 
}: AppointmentDetailsProps) {

  if (!appointment) return null;

  const handleEditClick = () => {
    onEdit(appointment); // Chama a função para abrir o formulário de edição
    onClose(); // Fecha este modal de detalhes
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const clientName = appointment.client?.name || 'Cliente não encontrado';
  const serviceName = appointment.service?.name || 'Serviço não encontrado';
  const professionalName = appointment.professional?.user?.name || appointment.professional?.name || 'Profissional não encontrado';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
          <DialogDescription>
            Informações sobre o agendamento selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <Badge variant={getStatusBadgeVariant(appointment.status)}>{formatStatus(appointment.status)}</Badge>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Cliente</span>
            <p>{clientName}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Serviço</span>
            <p>{serviceName}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Profissional</span>
            <p>{professionalName}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Início</span>
            <p>{formatDate(appointment.startTime)}</p>
          </div>
           <div>
            <span className="text-sm font-medium text-muted-foreground">Fim</span>
            <p>{formatDate(appointment.endTime)}</p>
          </div>
           <div>
            <span className="text-sm font-medium text-muted-foreground">Preço</span>
            <p>R$ {appointment.price?.toFixed(2) || '0.00'}</p>
          </div>
          {appointment.notes && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Observações</span>
              <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button type="button" onClick={handleEditClick}>
            Editar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 