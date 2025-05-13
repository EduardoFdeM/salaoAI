import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Appointment, AppointmentStatus, Service } from '../../types/salon'
import { format, addHours, parseISO, isValid } from 'date-fns'

// Interfaces simplificadas para evitar erros de tipo
interface ClientBase {
  id: string;
  name: string;
  [key: string]: any;
}

interface ProfessionalBase {
  id: string;
  name?: string;
  [key: string]: any;
}

interface ServiceBase {
  id: string;
  name: string;
  duration?: number;
  [key: string]: any;
}

interface AppointmentFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<Appointment>) => void
  appointment?: Appointment
  clients: ClientBase[]
  professionals: ProfessionalBase[]
  services: Service[]
}

// Helper para formatar data para input datetime-local
const formatDateForInput = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (isValid(date)) {
      return format(date, "yyyy-MM-dd'T'HH:mm");
    }
  } catch (e) { console.error("Erro ao formatar data para input:", e) }
  return '';
};

// Mapeamento de Status para Português
const statusTranslations: Record<AppointmentStatus, string> = {
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

// Interface interna para o estado do formulário (camelCase)
interface AppointmentFormData {
  clientId: string;
  professionalId: string;
  serviceId: string;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  notes?: string | null;
  price?: number | null;
}

export function AppointmentForm({
  open,
  onClose,
  onSubmit,
  appointment,
  clients,
  professionals,
  services
}: AppointmentFormProps) {

  const initializeFormData = (): AppointmentFormData => {
    if (appointment) {
      console.log("Inicializando formulário com agendamento (espera-se camelCase):", appointment);
      return {
        clientId: appointment.clientId || '', 
        professionalId: appointment.professionalId || '',
        serviceId: appointment.serviceId || '',
        status: appointment.status || AppointmentStatus.PENDING,
        startTime: formatDateForInput(appointment.startTime),
        endTime: formatDateForInput(appointment.endTime),
        notes: appointment.notes || '',
        price: appointment.price ?? null,
      };
    } else {
      const nowFormatted = formatDateForInput(new Date());
      const oneHourLaterFormatted = formatDateForInput(addHours(new Date(), 1));
      return {
        clientId: '',
        professionalId: '',
        serviceId: '',
        status: AppointmentStatus.PENDING,
        startTime: nowFormatted,
        endTime: oneHourLaterFormatted,
        notes: '',
        price: null,
      };
    }
  };

  const [formData, setFormData] = useState<AppointmentFormData>(initializeFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Atualizar estado se o `appointment` prop mudar (para edição)
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      if (clients.length > 0 && professionals.length > 0 && services.length > 0) {
         console.log("Listas carregadas, inicializando form...");
         setFormData(initializeFormData());
         setIsLoading(false);
      } else if (!appointment) {
         console.log("Listas vazias na criação, inicializando form padrão...");
         setFormData(initializeFormData());
         setIsLoading(false);
      } else {
          console.log("Aguardando listas carregarem para inicializar form de edição...");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment, open, clients, professionals, services]);

  // Ajustar cálculo de endTime e price
  useEffect(() => {
    if (formData.serviceId) {
      const selectedService = services.find(s => s.id === formData.serviceId);
      const duration = selectedService?.duration;
      const servicePrice = selectedService?.price;

      let newEndTime = formData.endTime;
      if (duration && duration > 0 && formData.startTime) {
        try {
          const startDate = new Date(formData.startTime);
          if (isValid(startDate)) {
            const endDate = addHours(startDate, duration / 60);
            newEndTime = formatDateForInput(endDate);
          }
        } catch (e) {
          console.error("Erro ao calcular data final:", e);
        }
      }
      
      // Atualiza preço apenas se não estiver editando ou se o preço atual for nulo/zero
      let newPrice = formData.price;
      if (!appointment || formData.price === null || formData.price === 0) {
          newPrice = servicePrice ?? null;
      }
      
      setFormData(prev => ({
        ...prev,
        endTime: newEndTime,
        price: newPrice,
      }));
    }
    // Adicionar 'appointment' como dependência para reavaliar o preço ao editar
  }, [formData.serviceId, formData.startTime, services, appointment]); 

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) newErrors.clientId = 'Selecione um cliente';
    if (!formData.professionalId) newErrors.professionalId = 'Selecione um profissional';
    if (!formData.serviceId) newErrors.serviceId = 'Selecione um serviço';
    if (!formData.startTime) newErrors.startTime = 'Informe a data/hora de início';
    else {
      try { if (!isValid(new Date(formData.startTime))) throw new Error(); } 
      catch { newErrors.startTime = 'Formato inválido'; }
    }
    if (!formData.endTime) newErrors.endTime = 'Informe a data/hora de término';
    else {
      try { if (!isValid(new Date(formData.endTime))) throw new Error(); } 
      catch { newErrors.endTime = 'Formato inválido'; }
    }
    if (formData.price !== undefined && formData.price !== null && formData.price < 0) {
       newErrors.price = 'Preço não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Manter camelCase para corresponder ao DTO do backend
      const dataToSubmit: Partial<AppointmentFormData & { id?: string }> = {
        clientId: formData.clientId,
        professionalId: formData.professionalId,
        serviceId: formData.serviceId,
        status: formData.status,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        notes: formData.notes,
        price: formData.price !== null ? Number(formData.price) : undefined,
      };
      
      // Adicionar ID se estiver editando
      if (appointment?.id) {
        dataToSubmit.id = appointment.id;
      }

      // Remover campos indefinidos antes de enviar
      Object.keys(dataToSubmit).forEach(key => {
        const k = key as keyof typeof dataToSubmit;
        if (dataToSubmit[k] === undefined || dataToSubmit[k] === null || dataToSubmit[k] === '') { // Remover undefined, null e strings vazias
          delete dataToSubmit[k];
        }
      });
      
      console.log("Enviando para onSubmit (camelCase):", dataToSubmit);
      // A função onSubmit (handleSubmitAppointment na página) receberá camelCase
      // E a API route /api/salon/appointments garantirá o envio correto para o backend
      onSubmit(dataToSubmit as Partial<Appointment>); // Cast para Partial<Appointment> ainda é necessário pela prop
    }
  };

  // Usar camelCase no handleInputChange
  const handleInputChange = (field: keyof AppointmentFormData, value: any) => {
    const processedValue = field === 'price' ? (parseFloat(value) || 0) : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          <DialogDescription>
            {appointment 
              ? 'Altere os dados do agendamento conforme necessário.' 
              : 'Preencha os dados para criar um novo agendamento.'}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
             <p>Carregando dados...</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <Select
                value={formData.clientId}
                onValueChange={(value) => handleInputChange('clientId', value)}
                disabled={!!appointment}
            >
                <SelectTrigger className={errors.clientId ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              {errors.clientId && <p className="text-xs text-destructive mt-1">{errors.clientId}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profissional</label>
            <Select
                value={formData.professionalId}
                onValueChange={(value) => handleInputChange('professionalId', value)}
                disabled={isLoading}
            >
                <SelectTrigger className={errors.professionalId ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                      {professional.name || professional.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              {errors.professionalId && <p className="text-xs text-destructive mt-1">{errors.professionalId}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Serviço</label>
            <Select
                value={formData.serviceId}
                onValueChange={(value) => handleInputChange('serviceId', value)}
                disabled={isLoading}
            >
                <SelectTrigger className={errors.serviceId ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                      {service.name} (R$ {service.price?.toFixed(2)} - {service.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              {errors.serviceId && <p className="text-xs text-destructive mt-1">{errors.serviceId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data e Hora Início</label>
              <Input
                type="datetime-local"
                  value={formData.startTime || ''}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={errors.startTime ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.startTime && <p className="text-xs text-destructive mt-1">{errors.startTime}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data e Hora Fim</label>
              <Input
                type="datetime-local"
                  value={formData.endTime || ''}
                  className={errors.endTime ? "border-destructive" : ""}
                  readOnly
                  disabled={isLoading}
                />
                {errors.endTime && <p className="text-xs text-destructive mt-1">{errors.endTime}</p>}
              </div>
            </div>
            
            {appointment && !isLoading && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preço (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price ?? ''}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={errors.price ? "border-destructive" : ""}
                    placeholder="Preço final (opcional)"
                  />
                  {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Status</label>
                 <Select
                   value={formData.status}
                   onValueChange={(value) => handleInputChange('status', value as AppointmentStatus)}
                   disabled={isLoading}
                 >
                   <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                     <SelectValue placeholder="Selecione o status" />
                   </SelectTrigger>
                   <SelectContent>
                     {Object.entries(statusTranslations).map(([enumValue, translation]) => (
                       <SelectItem key={enumValue} value={enumValue}>
                         {translation}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 {errors.status && <p className="text-xs text-destructive mt-1">{errors.status}</p>}
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Observações</label>
                 <Input
                   value={formData.notes ?? ''}
                   onChange={(e) => handleInputChange('notes', e.target.value)}
                   placeholder="Notas adicionais (opcional)"
                 />
          </div>
              </>
            )}

          <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : (appointment ? 'Salvar Alterações' : 'Criar Agendamento')}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 