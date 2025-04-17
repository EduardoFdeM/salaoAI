"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types/auth'
import { Service } from '@/types/salon' // Importar o tipo

// Mock data - Substituir pela chamada à API real
const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Corte Feminino', description: 'Corte moderno e estilizado', price: 80.00, duration: 60, salon_id: '1', active: true, created_at: '2023-10-26T10:00:00Z' },
  { id: '2', name: 'Corte Masculino', description: 'Corte clássico ou moderno', price: 50.00, duration: 45, salon_id: '1', active: true, created_at: '2023-10-26T10:05:00Z' },
  { id: '3', name: 'Coloração Raiz', description: 'Aplicação de coloração na raiz', price: 120.00, duration: 90, salon_id: '1', active: true, created_at: '2023-10-26T10:10:00Z' },
  { id: '4', name: 'Escova Progressiva', description: 'Alisamento e redução de volume', price: 250.00, duration: 180, salon_id: '1', active: false, created_at: '2023-10-26T10:15:00Z' },
  { id: '5', name: 'Manicure Simples', description: 'Cutilagem e esmaltação', price: 30.00, duration: 45, salon_id: '1', active: true, created_at: '2023-10-26T10:20:00Z' },
];

export default function ServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES)
  // Adicionar estados para loading, erro, formulário/modal, etc.

  const handleAddService = () => {
    // Lógica para abrir modal/formulário de adição
    console.log('Adicionar serviço')
  }

  const handleEditService = (service: Service) => {
    // Lógica para abrir modal/formulário de edição
    console.log('Editar serviço:', service)
  }

  const handleDeleteService = (serviceId: string) => {
    // Lógica para confirmar e deletar/desativar serviço
    console.log('Deletar serviço:', serviceId)
    // Exemplo: setServices(services.filter(s => s.id !== serviceId)) ou marcar como inativo
  }

  const canManage = user?.role === UserRole.SALON_OWNER

  return (
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
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>1-{services.length}</strong> de <strong>{services.length}</strong> serviços
        </div>
      </CardFooter>
    </Card>
  )
} 