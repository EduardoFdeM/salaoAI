import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Appointment, AppointmentStatus } from '@/types/salon'
import { format, addHours } from 'date-fns'

// Interfaces simplificadas para evitar erros de tipo
interface ClientBase {
  id: string;
  name: string;
  [key: string]: any;
}

interface ProfessionalBase {
  id: string;
  name: string;
  [key: string]: any;
}

interface ServiceBase {
  id: string;
  name: string;
  [key: string]: any;
}

interface AppointmentFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<Appointment>) => void
  appointment?: Appointment
  clients: ClientBase[]
  professionals: ProfessionalBase[]
  services: ServiceBase[]
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
  // Inicializar com a data atual ou do agendamento
  const defaultStartTime = appointment?.start_time 
    ? new Date(appointment.start_time) 
    : new Date();
  
  // Adicionar uma hora para o horário de fim padrão
  const defaultEndTime = appointment?.end_time 
    ? new Date(appointment.end_time) 
    : addHours(new Date(), 1);
  
  const [formData, setFormData] = useState<Partial<Appointment>>(
    appointment || {
      client_id: '',
      professional_id: '',
      service_id: '',
      status: AppointmentStatus.SCHEDULED,
      // Formatar datas para o formato ISO que os inputs datetime-local esperam
      start_time: format(defaultStartTime, "yyyy-MM-dd'T'HH:mm"),
      end_time: format(defaultEndTime, "yyyy-MM-dd'T'HH:mm"),
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Ajustar o horário de término automaticamente quando um serviço é selecionado
  useEffect(() => {
    if (formData.service_id && formData.start_time) {
      // Aqui você poderia buscar a duração do serviço selecionado da API
      // Por enquanto, usamos valores fixos de exemplo
      const serviceDurations: Record<string, number> = {
        's1': 60, // Corte feminino - 60 minutos
        's2': 30, // Barba - 30 minutos
        's3': 90, // Coloração - 90 minutos
        's4': 45, // Manicure - 45 minutos
      }
      
      const duration = serviceDurations[formData.service_id] || 60
      const startDate = new Date(formData.start_time)
      const endDate = addHours(startDate, duration / 60)
      
      setFormData(prev => ({
        ...prev,
        end_time: format(endDate, "yyyy-MM-dd'T'HH:mm")
      }))
    }
  }, [formData.service_id, formData.start_time])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.client_id) {
      newErrors.client_id = 'Selecione um cliente'
    }
    
    if (!formData.professional_id) {
      newErrors.professional_id = 'Selecione um profissional'
    }
    
    if (!formData.service_id) {
      newErrors.service_id = 'Selecione um serviço'
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Informe a data/hora de início'
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'Informe a data/hora de término'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Converter os campos de data/hora para ISO strings completos
      const data = {
        ...formData,
        // Manter como string no formato ISO que a API espera
      }
      onSubmit(data)
    }
  }

  const handleInputChange = (field: keyof Partial<Appointment>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erro do campo quando o usuário digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev}
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          <DialogDescription>
            {appointment 
              ? 'Altere os dados do agendamento conforme necessário.' 
              : 'Preencha os dados para criar um novo agendamento.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => handleInputChange('client_id', value)}
            >
              <SelectTrigger className={errors.client_id ? "border-destructive" : ""}>
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
            {errors.client_id && <p className="text-xs text-destructive mt-1">{errors.client_id}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profissional</label>
            <Select
              value={formData.professional_id}
              onValueChange={(value) => handleInputChange('professional_id', value)}
            >
              <SelectTrigger className={errors.professional_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    {professional.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.professional_id && <p className="text-xs text-destructive mt-1">{errors.professional_id}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Serviço</label>
            <Select
              value={formData.service_id}
              onValueChange={(value) => handleInputChange('service_id', value)}
            >
              <SelectTrigger className={errors.service_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_id && <p className="text-xs text-destructive mt-1">{errors.service_id}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data e Hora Início</label>
              <Input
                type="datetime-local"
                value={formData.start_time?.toString()}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className={errors.start_time ? "border-destructive" : ""}
              />
              {errors.start_time && <p className="text-xs text-destructive mt-1">{errors.start_time}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data e Hora Fim</label>
              <Input
                type="datetime-local"
                value={formData.end_time?.toString()}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                className={errors.end_time ? "border-destructive" : ""}
              />
              {errors.end_time && <p className="text-xs text-destructive mt-1">{errors.end_time}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {appointment ? 'Salvar Alterações' : 'Criar Agendamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 