"use client"

import { useAuth } from '../../../contexts/auth-context'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Resumo de Salões */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Salões</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Ativos</p>
              <p className="text-2xl font-bold">48</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Pendentes</p>
              <p className="text-2xl font-bold">7</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Novos (30d)</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Inadimplentes</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </div>

        {/* Resumo de Usuários */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Usuários</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p>Total de Usuários</p>
              <p className="font-semibold">286</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Donos de Salão</p>
              <p className="font-semibold">52</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Profissionais</p>
              <p className="font-semibold">187</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Recepcionistas</p>
              <p className="font-semibold">47</p>
            </div>
          </div>
        </div>

        {/* Resumo de Suporte */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Suporte</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p>Tickets Abertos</p>
              <p className="font-semibold">14</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Aguardando Resposta</p>
              <p className="font-semibold">8</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Resolvidos (7d)</p>
              <p className="font-semibold">32</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Tempo Médio</p>
              <p className="font-semibold">6h</p>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Financeiro</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p>MRR</p>
              <p className="font-semibold">R$ 24.860,00</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Faturamento (30d)</p>
              <p className="font-semibold">R$ 26.450,00</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Churn Rate</p>
              <p className="font-semibold">3.2%</p>
            </div>
            <div className="flex justify-between items-center">
              <p>LTV Médio</p>
              <p className="font-semibold">R$ 3.860,00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Últimos Salões Cadastrados */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Últimos Salões Cadastrados</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proprietário</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'Beleza Total', owner: 'Carla Souza', date: '12/06/2023', plan: 'Premium', status: 'Ativo' },
                { name: 'Espaço Cabelo', owner: 'Ricardo Gomes', date: '10/06/2023', plan: 'Básico', status: 'Ativo' },
                { name: 'Art Hair', owner: 'Amanda Lima', date: '05/06/2023', plan: 'Standard', status: 'Pendente' },
                { name: 'Corte & Cia', owner: 'Marcos Pereira', date: '02/06/2023', plan: 'Premium', status: 'Ativo' },
                { name: 'Fashion Hair', owner: 'Patricia Santos', date: '29/05/2023', plan: 'Básico', status: 'Ativo' },
              ].map((salon, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 whitespace-nowrap">{salon.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{salon.owner}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{salon.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{salon.plan}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      salon.status === 'Ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {salon.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 