"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react'
import { Client } from '@/types/salon' // Importar o tipo

// Mock data - Substituir pela chamada à API real
const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Ana Silva', email: 'ana.silva@email.com', phone: '(11) 98765-4321', observations: 'Prefere produtos sem sulfato', salon_id: '1', created_at: '2023-01-15T14:30:00Z', last_visit: '2023-10-20T10:00:00Z' },
  { id: 'c2', name: 'Carlos Mendes', phone: '(21) 91234-5678', salon_id: '1', created_at: '2023-02-20T11:00:00Z', last_visit: '2023-10-25T15:30:00Z' },
  { id: 'c3', name: 'Julia Pereira', email: 'julia.p@email.com', phone: '(31) 99876-5432', observations: 'Alergia a amônia', salon_id: '1', created_at: '2023-03-10T09:15:00Z', last_visit: '2023-09-30T16:00:00Z' },
  { id: 'c4', name: 'Pedro Alves', phone: '(41) 97654-3210', salon_id: '1', created_at: '2023-04-05T16:45:00Z', last_visit: '2023-10-10T11:00:00Z' },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [searchTerm, setSearchTerm] = useState('')
  // Adicionar estados para loading, erro, formulário/modal, etc.

  const handleAddClient = () => {
    console.log('Adicionar cliente')
  }

  const handleEditClient = (client: Client) => {
    console.log('Editar cliente:', client)
  }

  const handleDeleteClient = (clientId: string) => {
    console.log('Deletar cliente:', clientId)
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Gerencie os clientes do salão.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
             <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, telefone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
             </div>
            <Button onClick={handleAddClient} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Observações</TableHead>
              <TableHead className="hidden sm:table-cell">Última Visita</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell className="hidden md:table-cell">{client.email || '-'}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-xs">{client.observations || '-'}</TableCell>
                 <TableCell className="hidden sm:table-cell">
                   {client.last_visit ? new Date(client.last_visit).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditClient(client)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClient(client.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
               <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}