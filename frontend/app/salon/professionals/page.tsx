"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import Image from 'next/image'

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

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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
      name: 'Ana Silva',
      email: 'ana.silva@exemplo.com',
      phone: '(11) 98765-4321',
      role: 'Cabeleireira',
      specialties: [mockServices[1], mockServices[2], mockServices[4]],
      bio: 'Especialista em cortes femininos e coloração. Mais de 10 anos de experiência no mercado.',
      imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      active: true
    },
    {
      id: '2',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@exemplo.com',
      phone: '(11) 97654-3210',
      role: 'Barbeiro',
      specialties: [mockServices[0], mockServices[3]],
      bio: 'Barbeiro tradicional com técnicas modernas. Especializado em cortes masculinos e barba.',
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      active: true
    },
    {
      id: '3',
      name: 'Mariana Costa',
      email: 'mariana.costa@exemplo.com',
      phone: '(11) 96543-2109',
      role: 'Colorista',
      specialties: [mockServices[1], mockServices[2]],
      bio: 'Especialista em coloração e técnicas de mechas. Formada pela Academia L\'Oréal.',
      imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      active: true
    },
    {
      id: '4',
      name: 'Paulo Santos',
      email: 'paulo.santos@exemplo.com',
      phone: '(11) 95432-1098',
      role: 'Cabeleireiro',
      specialties: [mockServices[0], mockServices[1], mockServices[4]],
      bio: 'Profissional versátil com experiência em cortes femininos e masculinos.',
      imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
      active: true
    },
    {
      id: '5',
      name: 'Camila Pereira',
      email: 'camila.pereira@exemplo.com',
      phone: '(11) 94321-0987',
      role: 'Manicure',
      specialties: [mockServices[5], mockServices[6]],
      bio: 'Especialista em unhas. Certificada em técnicas de nail art e esmaltação em gel.',
      imageUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
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

  const handleViewDetails = (id: string) => {
    setShowDetails(id === showDetails ? null : id)
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profissionais</h1>
        {canEditOrDelete() && (
          <button 
            onClick={() => handleAddEdit(null)} 
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Adicionar Profissional
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500" 
            placeholder="Buscar profissionais..." 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProfessionals.map(professional => (
            <div 
              key={professional.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                !professional.active ? 'opacity-70' : ''
              }`}
            >
              <div className="relative h-40 bg-gradient-to-r from-primary-400 to-primary-600">
                <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white -mb-12 bg-white">
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

              <div className="pt-16 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                    <p className="text-sm text-gray-600">{professional.role}</p>
                  </div>
                  {!professional.active && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                      Inativo
                    </span>
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Especialidades:</strong> {getSpecialtiesList(professional.specialties)}</p>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button 
                    onClick={() => handleViewDetails(professional.id)}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    {showDetails === professional.id ? 'Menos detalhes' : 'Ver detalhes'}
                  </button>
                  
                  {canEditOrDelete() && (
                    <div className="space-x-2">
                      <button 
                        onClick={() => handleAddEdit(professional)}
                        className="text-sm px-3 py-1 text-primary-600 hover:text-primary-800 rounded-md hover:bg-primary-50"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(professional)}
                        className="text-sm px-3 py-1 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>

                {showDetails === professional.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Bio:</strong><br />
                      {professional.bio}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Email:</strong> {professional.email}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Telefone:</strong> {professional.phone}
                    </p>
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