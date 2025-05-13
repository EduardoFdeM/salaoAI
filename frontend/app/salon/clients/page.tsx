"use client"

import { useState, useEffect } from 'react'
import { Button } from "../../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Input } from "../../../components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { useToast } from "../../../hooks/use-toast"
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react'
import { Client } from '../../../types/salon'
import { useAuth } from '../../../contexts/auth-context'
import { PhoneInput } from "../../../components/ui/phone-input"
import { useSalon } from '../../../contexts/salon-context'

// Interface para os dados do formulário
interface ClientFormData {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

// Mock data - REMOVIDO
/*
const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Ana Silva', email: 'ana.silva@email.com', phone: '(11) 98765-4321', notes: 'Prefere produtos sem sulfato', salon_id: '1', created_at: '2023-01-15T14:30:00Z', last_visit: '2023-10-20T10:00:00Z', version: 1, updated_at: '' },
  // ... outros mocks ...
];
*/

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<Partial<ClientFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { salon } = useSalon()

  // Obter as configurações do cliente do contexto do salão
  // Define um valor padrão caso 'salon' ou 'clientRequiredFields' sejam nulos/undefined
  const clientSettings = salon?.clientRequiredFields ?? { phoneRequired: true, emailRequired: false };

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/salon/clients')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erro ao buscar clientes')
        }
        const data = await response.json()
        setClients(data)
      } catch (err) {
        console.error('Erro ao buscar clientes:', err)
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Funções de manipulação para abrir modais
  const handleAddClient = () => {
    setSelectedClient(null)
    setFormData({})
    setShowFormModal(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || ''
    })
    setShowFormModal(true)
  }

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client)
    setShowDeleteConfirm(true)
  }

  // Função para atualizar estado do formulário
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'phone') setIsPhoneValid(true);
  };
  const handlePhoneInputChange = (value: string, isValid: boolean) => {
    setFormData(prev => ({ ...prev, phone: value }));
    setIsPhoneValid(isValid);
  };

  // Função para submeter o formulário (Criar/Editar)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let errors: string[] = [];
    if (!formData.name) {
        errors.push("Nome é obrigatório.");
    }
    if (clientSettings.phoneRequired && !formData.phone) {
        errors.push("Telefone é obrigatório.");
    } else if (formData.phone && !isPhoneValid) {
        errors.push("Formato de telefone inválido.");
    }
    if (clientSettings.emailRequired && !formData.email) {
        errors.push("Email é obrigatório.");
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.push("Formato de e-mail inválido.");
    }

    if (errors.length > 0) {
      toast({
        title: "Erro de Validação",
        description: (
           <ul>
             {errors.map((err, i) => <li key={i}>{err}</li>)}
           </ul>
        ),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const method = selectedClient ? 'PATCH' : 'POST'
    const url = selectedClient
      ? `/api/salon/clients/${selectedClient.id}`
      : '/api/salon/clients'

    let basePayload: Partial<ClientFormData> = {
      name: formData.name,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      notes: formData.notes || undefined,
    };

    let payload: any;

    if (selectedClient) {
      payload = basePayload;
    } else {
      const salonId = user?.salon_id;
      if (!salonId) {
         toast({
          title: "Erro",
          description: "ID do salão não encontrado. Faça login novamente.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      payload = { ...basePayload, salonId };
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = `Erro ao ${selectedClient ? 'atualizar' : 'criar'} cliente`;
        if (errorData.message && Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ');
        } else if (errorData.message) {
            errorMessage = errorData.message;
        }
        throw new Error(errorMessage);
      }

      const savedClient = await response.json()

      // Atualizar estado local
      setClients(prev =>
        selectedClient
          ? prev.map(c => (c.id === selectedClient.id ? { ...c, ...savedClient } : c))
          : [...prev, savedClient]
      )

      toast({
        title: "Sucesso!",
        description: `Cliente ${selectedClient ? 'atualizado' : 'criado'} com sucesso.`,
      })
      setShowFormModal(false)

    } catch (err) {
      console.error('Erro ao salvar cliente:', err)
      toast({
        title: "Erro ao Salvar",
        description: err instanceof Error ? err.message : 'Ocorreu um erro desconhecido',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para confirmar exclusão
  const confirmDelete = async () => {
    if (!selectedClient) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/salon/clients/${selectedClient.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao excluir cliente')
      }

      // Remover do estado local
      setClients(prev => prev.filter(c => c.id !== selectedClient.id))

      toast({
        title: "Sucesso!",
        description: "Cliente excluído com sucesso.",
      })
      setShowDeleteConfirm(false)
      setSelectedClient(null)

    } catch (err) {
      console.error('Erro ao excluir cliente:', err)
      toast({
        title: "Erro ao Excluir",
        description: err instanceof Error ? err.message : 'Ocorreu um erro desconhecido',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">
            <p>Erro ao carregar clientes: {error}</p>
          </div>
        ) : (
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
                <TableCell>{client.phone || '-'}</TableCell>
                <TableCell className="hidden md:table-cell">{client.email || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-xs">{client.notes || '-'}</TableCell>
                 <TableCell className="hidden sm:table-cell">
                   {client.last_visit ? new Date(client.last_visit).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditClient(client)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteClient(client)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
               <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm ? 'Nenhum cliente encontrado.' : (clients.length === 0 ? 'Nenhum cliente cadastrado.' : 'Nenhum cliente encontrado para a busca.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </CardContent>

      {/* Modal de Formulário (Criar/Editar) */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedClient ? 'Editar Cliente' : 'Adicionar Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="phone">
                 Telefone {clientSettings.phoneRequired && <span className="text-red-500">*</span>}
              </Label>
              <PhoneInput
                id="phone"
                value={formData.phone || ''}
                onChange={handlePhoneInputChange}
                required={clientSettings.phoneRequired}
                disabled={isSubmitting}
              />
               {!isPhoneValid && formData.phone && <p className="text-xs text-red-500 mt-1">Formato de telefone inválido para o país selecionado.</p>}
            </div>
            <div>
              <Label htmlFor="email">
                 Email {clientSettings.emailRequired && <span className="text-red-500">*</span>}
               </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isSubmitting}
                required={clientSettings.emailRequired}
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFormModal(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || (!!formData.phone && !isPhoneValid)}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o cliente <span className="font-medium">{selectedClient?.name}</span>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  )
}