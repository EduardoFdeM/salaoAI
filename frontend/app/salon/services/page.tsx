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

export default function ServicesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentService, setCurrentService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
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
    } catch (err) {
      console.error('Erro:', err)
      setError('Não foi possível carregar os serviços')
      
      // Usando dados mockados enquanto o backend é implementado
      setServices([
  { id: '1', name: 'Corte Feminino', description: 'Corte moderno e estilizado', price: 80.00, duration: 60, salon_id: '1', active: true, created_at: '2023-10-26T10:00:00Z' },
  { id: '2', name: 'Corte Masculino', description: 'Corte clássico ou moderno', price: 50.00, duration: 45, salon_id: '1', active: true, created_at: '2023-10-26T10:05:00Z' },
  { id: '3', name: 'Coloração Raiz', description: 'Aplicação de coloração na raiz', price: 120.00, duration: 90, salon_id: '1', active: true, created_at: '2023-10-26T10:10:00Z' },
  { id: '4', name: 'Escova Progressiva', description: 'Alisamento e redução de volume', price: 250.00, duration: 180, salon_id: '1', active: false, created_at: '2023-10-26T10:15:00Z' },
  { id: '5', name: 'Manicure Simples', description: 'Cutilagem e esmaltação', price: 30.00, duration: 45, salon_id: '1', active: true, created_at: '2023-10-26T10:20:00Z' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleAddService = () => {
    setCurrentService(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      active: true
    })
    setDialogOpen(true)
  }

  const handleEditService = (service: Service) => {
    setCurrentService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? Number(value) : value
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
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Erro ao ${currentService ? 'atualizar' : 'criar'} serviço`)
      }

      // Se estivermos usando dados mockados, simular o comportamento
      if (!response.ok && error) {
        if (currentService) {
          // Atualizar o serviço existente
          setServices(services.map(s => 
            s.id === currentService.id 
              ? { ...s, ...formData, updated_at: new Date().toISOString() } 
              : s
          ))
        } else {
          // Adicionar novo serviço
          const newService: Service = {
            id: `new-${Date.now()}`,
            salon_id: '1',
            ...formData,
            created_at: new Date().toISOString(),
          }
          setServices([...services, newService])
        }
      } else {
        // Se a API estiver funcionando, buscar dados atualizados
        fetchServices()
      }

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
        {services.length > 0 && (
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>1-{services.length}</strong> de <strong>{services.length}</strong> serviços
        </div>
      </CardFooter>
        )}
    </Card>

      {/* Modal para Adicionar/Editar Serviço */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentService ? 'Editar Serviço' : 'Adicionar Serviço'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duração (min)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="5"
                    step="5"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="active">Serviço ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentService ? 'Salvar Alterações' : 'Criar Serviço'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 