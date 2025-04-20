"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useSalon } from '@/contexts/salon-context'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Grid, List, UserPlus, Mail, Search, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'

interface Service {
  id: string
  name: string
}

interface Professional {
  id: string
  name: string
  email: string
  phone: string
  role: string
  specialties: Service[]
  bio: string
  imageUrl: string
  active: boolean
}

export default function SalonProfessionalsPage() {
  const { salon, loading: salonLoading } = useSalon()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [inviteEmail, setInviteEmail] = useState('')
  const { user } = useAuth()

  // Dados de exemplo para desenvolvimento
  const mockServices: Service[] = [
    { id: '1', name: 'Corte Masculino' },
    { id: '2', name: 'Corte Feminino' },
    { id: '3', name: 'Coloração' },
    { id: '4', name: 'Barba' },
    { id: '5', name: 'Hidratação' },
    { id: '6', name: 'Manicure' },
    { id: '7', name: 'Pedicure' },
  ]

  const mockProfessionals: Professional[] = [
    {
      id: '1',
      name: 'Amanda Silva',
      email: 'amanda.silva@exemplo.com',
      phone: '(11) 98765-4321',
      role: 'Cabeleireira',
      specialties: [mockServices[1], mockServices[2]],
      bio: 'Especialista em cortes femininos e coloração. Mais de 8 anos de experiência.',
      imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      active: true
    },
    {
      id: '2',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@exemplo.com',
      phone: '(11) 91234-5678',
      role: 'Barbeiro',
      specialties: [mockServices[0], mockServices[3]],
      bio: 'Barbeiro profissional com técnicas tradicionais e modernas.',
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      active: true
    },
    {
      id: '3',
      name: 'Juliana Costa',
      email: 'juliana.costa@exemplo.com',
      phone: '(11) 99876-5432',
      role: 'Manicure',
      specialties: [mockServices[5], mockServices[6]],
      bio: 'Especialista em unhas. Certificada em técnicas de nail art.',
      imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      active: true
    },
    {
      id: '4',
      name: 'Marcelo Santos',
      email: 'marcelo.santos@exemplo.com',
      phone: '(11) 98765-1234',
      role: 'Cabeleireiro',
      specialties: [mockServices[0], mockServices[1]],
      bio: 'Cabeleireiro com experiência internacional. Especializado em técnicas avançadas de coloração.',
      imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
      active: false
    }
  ]

  useEffect(() => {
    // Simulação de chamada à API
    const fetchProfessionals = async () => {
      try {
        setLoading(true)
        // Em produção, substituir por chamada à API real
        await new Promise(resolve => setTimeout(resolve, 500))
        setProfessionals(mockProfessionals)
      } catch (error) {
        console.error('Erro ao buscar profissionais:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfessionals()
  }, [])

  const handleAddEdit = (professional: Professional | null) => {
    setSelectedProfessional(professional)
    setShowForm(true)
  }

  const handleDelete = (professional: Professional) => {
    setSelectedProfessional(professional)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (!selectedProfessional) return

    // Em produção, substituir por chamada à API real
    const updatedProfessionals = professionals.filter(p => p.id !== selectedProfessional.id)
    setProfessionals(updatedProfessionals)
    setShowDeleteConfirm(false)
    setSelectedProfessional(null)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Aqui você implementaria a lógica para salvar o profissional (novo ou editado)
    // através de uma chamada à API

    // Fecha o formulário após salvar
    setShowForm(false)
    setSelectedProfessional(null)
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Aqui você implementaria a lógica para enviar o convite
    console.log('Enviando convite para:', inviteEmail)
    
    // Limpa o formulário e fecha o modal
    setInviteEmail('')
    setShowInviteForm(false)
  }

  const toggleDetails = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    )
  }

  // Filtrar profissionais com base no termo de busca
  const filteredProfessionals = professionals.filter(professional => 
    professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.specialties.some(specialty => 
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const canEditOrDelete = () => {
    return user?.role === 'SALON_OWNER'
  }

  const getSpecialtiesList = (specialties: Service[]) => {
    return specialties.map(s => s.name).join(', ')
  }

  if (salonLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <p className="text-amber-800">Seu usuário não está associado a nenhum salão.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Profissionais</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-md border border-input overflow-hidden">
            <Button
              variant={viewMode === 'cards' ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode('cards')}
              className="rounded-none border-0"
              aria-label="Visualização em cards"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode('table')}
              className="rounded-none border-0"
              aria-label="Visualização em tabela"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {canEditOrDelete() && (
            <>
              <Button 
                variant="outline"
                onClick={() => setShowInviteForm(true)}
                className="whitespace-nowrap"
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Convidar</span>
                <span className="sm:hidden">Convidar</span>
              </Button>
              <Button 
                onClick={() => handleAddEdit(null)}
                className="whitespace-nowrap"
                size="sm"
              >
                <span>Adicionar</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <Input 
            type="search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
            placeholder="Buscar profissionais..." 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProfessionals.map(professional => (
                <div 
                  key={professional.id} 
                  className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md ${
                    !professional.active ? 'opacity-70' : ''
                  }`}
                >
                  <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary-400 to-primary-600">
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white -mb-10 sm:-mb-12 bg-white">
                        <Image 
                          src={professional.imageUrl || '/placeholder-user.jpg'} 
                          alt={professional.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 sm:pt-16 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-full">{professional.name}</h3>
                        <p className="text-sm text-gray-600">{professional.role}</p>
                      </div>
                      {!professional.active && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      <p className="line-clamp-1">
                        <strong>Especialidades:</strong> {getSpecialtiesList(professional.specialties)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDetails(professional.id)}
                        className="text-sm px-2 py-1 h-auto text-primary-600 hover:text-primary-800"
                      >
                        {expandedIds.includes(professional.id) ? 'Menos detalhes' : 'Ver detalhes'}
                      </Button>
                      
                      {canEditOrDelete() && (
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddEdit(professional)}
                            className="text-sm px-2 py-1 h-auto text-primary-600 hover:text-primary-800"
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(professional)}
                            className="text-sm px-2 py-1 h-auto text-red-600 hover:text-red-800"
                          >
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>

                    {expandedIds.includes(professional.id) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Bio:</strong><br />
                          {professional.bio}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <p className="text-sm text-gray-700">
                            <strong>Email:</strong><br />
                            <span className="break-all">{professional.email}</span>
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Telefone:</strong><br />
                            {professional.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredProfessionals.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">Nenhum profissional encontrado.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="hidden md:table-cell">Especialidades</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.length > 0 ? (
                    filteredProfessionals.map(professional => (
                      <>
                        <TableRow key={professional.id}>
                          <TableCell className="font-medium">
                            {professional.name}
                          </TableCell>
                          <TableCell>{professional.role}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="max-w-xs truncate">
                              {getSpecialtiesList(professional.specialties)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {professional.active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inativo
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleDetails(professional.id)}
                                className="h-8 px-2"
                              >
                                {expandedIds.includes(professional.id) ? 'Ocultar' : 'Detalhes'}
                              </Button>
                              {canEditOrDelete() && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleAddEdit(professional)}
                                    className="h-8 px-2"
                                  >
                                    Editar
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 px-2"
                                    onClick={() => handleDelete(professional)}
                                  >
                                    Excluir
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedIds.includes(professional.id) && (
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={5} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <strong className="block text-sm">Email:</strong>
                                  <span className="text-sm break-all">{professional.email}</span>
                                </div>
                                <div>
                                  <strong className="block text-sm">Telefone:</strong>
                                  <span className="text-sm">{professional.phone}</span>
                                </div>
                                <div className="md:col-span-3">
                                  <strong className="block text-sm">Bio:</strong>
                                  <p className="text-sm">{professional.bio}</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum profissional encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Modal de formulário para adicionar/editar profissional */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">
                {selectedProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                  <input 
                    type="text" 
                    id="name" 
                    defaultValue={selectedProfessional?.name || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    defaultValue={selectedProfessional?.email || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input 
                    type="text" 
                    id="phone" 
                    defaultValue={selectedProfessional?.phone || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Função</label>
                  <input 
                    type="text" 
                    id="role" 
                    defaultValue={selectedProfessional?.role || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="specialties" className="block text-sm font-medium text-gray-700">Especialidades</label>
                  <div className="mt-1 space-y-2">
                    {mockServices.map(service => (
                      <div key={service.id} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`specialty-${service.id}`} 
                          defaultChecked={selectedProfessional?.specialties.some(s => s.id === service.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`specialty-${service.id}`} className="ml-2 block text-sm text-gray-700">
                          {service.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biografia</label>
                  <textarea 
                    id="bio" 
                    rows={3}
                    defaultValue={selectedProfessional?.bio || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                  <input 
                    type="text" 
                    id="imageUrl" 
                    defaultValue={selectedProfessional?.imageUrl || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="active" 
                    defaultChecked={selectedProfessional ? selectedProfessional.active : true}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">Ativo</label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de convite de profissional */}
      <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Profissional</DialogTitle>
            <DialogDescription>
              Envie um convite para que um profissional se junte ao seu salão.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="inviteEmail" className="text-sm font-medium">
                  Email do Profissional
                </label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="profissional@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensagem Personalizada (opcional)
                </label>
                <textarea
                  id="message"
                  className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Olá! Gostaria de convidar você para fazer parte da equipe do nosso salão..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Convite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação para excluir profissional */}
      {showDeleteConfirm && selectedProfessional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirmar exclusão</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o profissional <span className="font-medium">{selectedProfessional.name}</span>? 
              Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}