"use client"

import { useAuth } from '@/contexts/auth-context'

export default function ReceptionistDashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard da Recepção</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Resumo do Dia */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Hoje</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Agendamentos</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Check-ins</p>
              <p className="text-2xl font-bold">16</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Concluídos</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Próximos</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </div>

        {/* Profissionais */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Profissionais</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p>Ativos Hoje</p>
              <p className="font-semibold">6/8</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">MO</div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">JS</div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">CC</div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">RL</div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">PL</div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">AM</div>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">FT</div>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">RS</div>
            </div>
          </div>
        </div>

        {/* Caixa */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Caixa</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p>Faturamento (Hoje)</p>
              <p className="font-semibold">R$ 1.480,00</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Pagamentos Pendentes</p>
              <p className="font-semibold">3</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Ticket Médio</p>
              <p className="font-semibold">R$ 123,33</p>
            </div>
            <button className="mt-2 w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors">
              Registrar Pagamento
            </button>
          </div>
        </div>
      </div>

      {/* Próximos Agendamentos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Próximos Agendamentos</h2>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700 transition-colors">
            Novo Agendamento
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissional</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { time: '14:00', client: 'Juliana Costa', phone: '(11) 98765-4321', service: 'Escova', professional: 'Camila Costa', status: 'Confirmado' },
                { time: '14:30', client: 'Roberto Alves', phone: '(11) 91234-5678', service: 'Corte Masculino', professional: 'Marcos Oliveira', status: 'Confirmado' },
                { time: '15:00', client: 'Marina Silva', phone: '(11) 99876-5432', service: 'Manicure', professional: 'Renata Lima', status: 'Confirmado' },
                { time: '15:30', client: 'Carlos Mendes', phone: '(11) 97654-3210', service: 'Barba', professional: 'João Santos', status: 'Aguardando' },
                { time: '16:00', client: 'Paula Fernandes', phone: '(11) 92345-6789', service: 'Coloração', professional: 'Amanda Martins', status: 'Aguardando' },
              ].map((appointment, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 whitespace-nowrap">{appointment.time}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{appointment.client}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{appointment.phone}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{appointment.service}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{appointment.professional}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'Confirmado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                      Check-in
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Clientes em Espera */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Clientes em Espera</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Juliana Costa', time: '14:00', waiting: '5 min', professional: 'Camila Costa' },
            { name: 'Roberto Alves', time: '14:30', waiting: '0 min', professional: 'Marcos Oliveira' },
          ].map((client, i) => (
            <div key={i} className="border border-gray-200 rounded-md p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-500">Agendado: {client.time}</p>
                <p className="text-sm text-gray-500">Profissional: {client.professional}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Espera: {client.waiting}</p>
                <button className="mt-2 text-sm text-green-600 hover:text-green-800">
                  Iniciar Atendimento
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 