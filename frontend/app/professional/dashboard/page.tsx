"use client"

import { useAuth } from '../../../contexts/auth-context'

export default function ProfessionalDashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Minha Agenda</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Resumo do Dia */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Hoje</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Agendamentos</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Concluídos</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Próximo</p>
              <p className="text-sm font-bold">14:30</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-gray-500 text-sm">Ocupação</p>
              <p className="text-2xl font-bold">85%</p>
            </div>
          </div>
        </div>

        {/* Indicadores Semanais */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Esta Semana</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p>Total Atendimentos</p>
              <p className="font-semibold">32</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Tempo Médio</p>
              <p className="font-semibold">45 min</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Avaliação Média</p>
              <div className="flex">
                <span className="text-yellow-400">★★★★</span>
                <span className="text-gray-300">★</span>
                <span className="ml-1 text-sm">4.2</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p>Comissão Estimada</p>
              <p className="font-semibold">R$ 840,00</p>
            </div>
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Meus Clientes</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p>Clientes Atendidos</p>
              <p className="font-semibold">86</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Novos (Mês)</p>
              <p className="font-semibold">12</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Recorrentes</p>
              <p className="font-semibold">74%</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Próxima Vez</p>
              <p className="font-semibold">26</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agendamentos do Dia */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Agendamentos de Hoje</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { time: '09:00', client: 'Ana Silva', service: 'Corte Feminino', duration: '45 min', status: 'Concluído' },
                { time: '10:00', client: 'Paulo Mendes', service: 'Barba', duration: '30 min', status: 'Concluído' },
                { time: '11:00', client: 'Carla Santos', service: 'Coloração', duration: '1h 30min', status: 'Concluído' },
                { time: '14:30', client: 'Juliana Costa', service: 'Escova', duration: '45 min', status: 'Aguardando' },
                { time: '15:30', client: 'Roberto Alves', service: 'Corte Masculino', duration: '30 min', status: 'Aguardando' },
                { time: '16:30', client: 'Camila Dias', service: 'Hidratação', duration: '1h', status: 'Aguardando' },
                { time: '18:00', client: 'Pedro Gomes', service: 'Corte e Barba', duration: '1h', status: 'Aguardando' },
                { time: '19:30', client: 'Fernanda Lima', service: 'Finalização', duration: '30 min', status: 'Aguardando' },
              ].map((appointment, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 whitespace-nowrap">{appointment.time}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{appointment.client}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{appointment.service}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{appointment.duration}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'Concluído'
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'Em Andamento'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {appointment.status === 'Aguardando' && (
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Iniciar
                      </button>
                    )}
                    {appointment.status === 'Em Andamento' && (
                      <button className="text-sm text-green-600 hover:text-green-800">
                        Concluir
                      </button>
                    )}
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