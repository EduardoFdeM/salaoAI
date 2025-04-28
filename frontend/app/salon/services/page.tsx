"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types/auth'
import { Service, ServiceFormData } from '@/types/salon'
import { useToast } from "@/hooks/use-toast"

// Interface ajustada para price/duration como string | number no formulário
// Se ServiceFormData em types/salon.ts já for assim, ignore.
// Caso contrário, considere ajustar types/salon.ts
interface LocalServiceFormData extends Omit<ServiceFormData, 'price' | 'duration'> {
  price: string | number;
  duration: string | number;
}

export default function ServicesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentService, setCurrentService] = useState<Service | null>(null)
  // Usar a interface local ou importar ServiceFormData ajustada
  const [formData, setFormData] = useState<Partial<LocalServiceFormData>>({
    name: '',
    description: '',
    price: '', // Mantido como string
    duration: '30', // Mantido como string
    active: true
  })
  
  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/salon/services')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar serviços')
      }
      
      const data = await response.json()
      setServices(data)
      setError(null)
    } catch (err) {
      console.error('Erro:', err)
      setError('Não foi possível carregar os serviços. Tente atualizar a página.')
      
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleAddService = () => {
    setCurrentService(null)
    // Resetar formData garantindo conformidade com Partial<LocalServiceFormData>
    setFormData({
      name: '',
      description: '',
      price: '', // string
      duration: '30', // string
      active: true
    })
    setDialogOpen(true)
  }

  const handleEditService = (service: Service) => {
    setCurrentService(service)
    // Garantir conformidade com Partial<LocalServiceFormData>
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(), // string
      duration: service.duration.toString(), // string
      active: service.active
    })
    setDialogOpen(true)
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) {
      return
    }

    try {
      const response = await fetch(`/api/salon/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir serviço')
      }

      // Atualizar a lista removendo o serviço excluído
      setServices(services.filter(s => s.id !== serviceId))
      
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso",
      })
    } catch (err) {
      console.error('Erro ao excluir:', err)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o serviço",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'price' && !/^[0-9]*\\.?[0-9]*$/.test(value)) {
        return;
    }
    if (name === 'duration' && !/^[0-9]*$/.test(value)) {
        return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.name || !formData.price || !formData.duration) {
        toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha Nome, Preço e Duração.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    const priceAsNumber = parseFloat(formData.price?.toString() ?? '0');
    const durationAsNumber = parseInt(formData.duration?.toString() ?? '0', 10);

    if (isNaN(priceAsNumber) || priceAsNumber < 0) {
         toast({
            title: "Preço inválido",
            description: "Por favor, insira um valor numérico válido para o preço.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    if (isNaN(durationAsNumber) || durationAsNumber <= 0) {
         toast({
            title: "Duração inválida",
            description: "Por favor, insira um valor numérico positivo para a duração.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    const dataToSend: ServiceFormData = {
        ...formData,
        price: priceAsNumber,
        duration: durationAsNumber,
        active: formData.active ?? true,
        name: formData.name ?? '',
        description: formData.description ?? '',
    };

    try {
      const url = currentService 
        ? `/api/salon/services/${currentService.id}` 
        : '/api/salon/services'
      
      const method = currentService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(`Erro ao ${currentService ? 'atualizar' : 'criar'} serviço: ${errorData.message || response.statusText}`)
      }

      fetchServices()

      toast({
        title: currentService ? "Serviço atualizado" : "Serviço criado",
        description: `O serviço foi ${currentService ? 'atualizado' : 'criado'} com sucesso`,
      })

      setDialogOpen(false)
    } catch (err) {
      console.error('Erro:', err)
      toast({
        title: "Erro",
        description: `Não foi possível ${currentService ? 'atualizar' : 'criar'} o serviço`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canManage = user?.role === UserRole.SALON_OWNER

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Serviços</CardTitle>
            <CardDescription>Gerencie os serviços oferecidos pelo salão.</CardDescription>
          </div>
          {canManage && (
            <Button onClick={handleAddService}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Serviço
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length > 0 ? services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-xs">{service.description || '-'}</TableCell>
                <TableCell>R$ {service.price.toFixed(2)}</TableCell>
                <TableCell>{service.duration} min</TableCell>
                <TableCell>
                  <Badge variant={service.active ? "default" : "destructive"}>
                    {service.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditService(service)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteService(service.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={canManage ? 6 : 5} className="h-24 text-center">
                  Nenhum serviço cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
          )}
      </CardContent>
        {!loading && !error && services.length > 0 && (
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>1-{services.length}</strong> de <strong>{services.length}</strong> serviços
        </div>
      </CardFooter>
        )}
    </Card>

      {/* Modal para Adicionar/Editar Serviço */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{currentService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name || ''} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description || ''} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Preço (R$) <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="text"
                  inputMode="decimal"
                  value={formData.price || ''} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duração (min) <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="duration" 
                  name="duration" 
                  type="text"
                  inputMode="numeric"
                  value={formData.duration || ''} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Ativo
                </Label>
                <Switch 
                  id="active" 
                  name="active" 
                  checked={formData.active} 
                  onCheckedChange={handleSwitchChange} 
                  className="col-span-3" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {currentService ? 'Salvar Alterações' : 'Adicionar Serviço'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 