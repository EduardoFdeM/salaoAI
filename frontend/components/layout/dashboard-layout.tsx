"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/auth-context'
import { UserRole } from '../../types/auth'
import {
  LayoutDashboard,
  Users,
  Scissors,
  Calendar,
  Settings,
  UserCog,
  CreditCard,
  HelpCircle,
  Store,
  Clock,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ClipboardList
} from 'lucide-react'

interface NavItemProps {
  href: string
  label: string
  icon?: React.ReactNode
  isActive: boolean
  sidebarOpen: boolean
}

const NavItem = ({ href, label, icon, isActive, sidebarOpen }: NavItemProps) => (
  <Link 
    href={href}
    className={`flex items-center px-4 py-2 mx-2 rounded-md transition-all duration-300 relative group ${
      isActive 
        ? 'bg-primary text-primary-foreground font-medium' 
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    } ${!sidebarOpen ? 'justify-center' : ''}`}
  >
    {icon || (
      <span className="w-5 h-5 flex items-center justify-center">
        {label.charAt(0)}
      </span>
    )}
    <span className={`transition-all duration-300 ${
      !sidebarOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 ml-3'
    }`}>
      {label}
    </span>
    {!sidebarOpen && (
      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20">
        {label}
      </span>
    )}
  </Link>
)

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Definir itens de navegação com base no papel do usuário
  const getNavItems = () => {
    const isSalonRoute = pathname.startsWith('/salon')
    
    // Menu específico para Recepcionista na área do Salão
    if (isSalonRoute && user?.role === UserRole.RECEPTIONIST) {
      return [
        { href: '/salon/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: '/salon/appointments', label: 'Agendamentos', icon: <Calendar className="w-5 h-5" /> },
        { href: '/salon/clients', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
        { href: '/salon/professionals', label: 'Profissionais', icon: <Scissors className="w-5 h-5" /> },
        { href: '/salon/cashier', label: 'Caixa', icon: <Wallet className="w-5 h-5" /> },
      ]
    }
    
    // Menus para outros papéis ou Dono de Salão na área do Salão
    switch (user?.role) {
      case UserRole.SUPERUSER:
      case UserRole.ADMIN:
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: '/admin/salons', label: 'Salões', icon: <Store className="w-5 h-5" /> },
          { href: '/admin/users', label: 'Usuários', icon: <Users className="w-5 h-5" /> },
          { href: '/admin/plans', label: 'Planos', icon: <CreditCard className="w-5 h-5" /> },
          { href: '/admin/support', label: 'Suporte', icon: <HelpCircle className="w-5 h-5" /> },
          { href: '/admin/settings', label: 'Configurações', icon: <Settings className="w-5 h-5" /> },
        ]
      case UserRole.SALON_OWNER:
        // Verifica se está na rota /salon para garantir o menu correto
        if (isSalonRoute) {
          return [
            { href: '/salon/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
            { href: '/salon/professionals', label: 'Profissionais', icon: <Scissors className="w-5 h-5" /> },
            { href: '/salon/services', label: 'Serviços', icon: <ClipboardList className="w-5 h-5" /> },
            { href: '/salon/clients', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
            { href: '/salon/appointments', label: 'Agendamentos', icon: <Calendar className="w-5 h-5" /> },
            { href: '/salon/financial', label: 'Financeiro', icon: <Wallet className="w-5 h-5" /> },
            { href: '/salon/settings', label: 'Configurações', icon: <Settings className="w-5 h-5" /> },
          ]
        }
        // Caso contrário (se aplicável a outras rotas para SALON_OWNER no futuro)
        return [] 
      case UserRole.PROFESSIONAL:
        return [
          { href: '/professional/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: '/professional/schedule', label: 'Minha Agenda', icon: <Clock className="w-5 h-5" /> },
          { href: '/professional/clients', label: 'Meus Clientes', icon: <Users className="w-5 h-5" /> },
          { href: '/professional/profile', label: 'Meu Perfil', icon: <UserCircle className="w-5 h-5" /> },
        ]
      // Não é necessário case RECEPTIONIST aqui, pois foi tratado acima
      default:
        return []
    }
  }

  // Obtém o título baseado no papel do usuário e na rota atual
  const getTitle = () => {
    const isSalonRoute = pathname.startsWith('/salon')

    if (isSalonRoute && user?.role === UserRole.RECEPTIONIST) {
      // Ex: "Recepção - Maria"
      return "Recepção" + (user?.name ? ` - ${user.name.split(' ')[0]}` : "") 
    }
    
    switch (user?.role) {
      case UserRole.SUPERUSER:
      case UserRole.ADMIN:
        return "Admin Panel"
      case UserRole.SALON_OWNER:
         // Ex: "Salão da Ana" (precisaria buscar o nome do salão) ou genérico
        return "Gestão do Salão" 
      case UserRole.PROFESSIONAL:
        // Ex: "Profissional - João"
        return "Profissional" + (user?.name ? ` - ${user.name.split(' ')[0]}` : "") 
      // Não precisa do case RECEPTIONIST aqui
      default:
        return "Salon App"
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className={`font-bold text-xl transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
            }`}>
              {getTitle()}
            </h1>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                sidebarOpen ? '' : 'w-full flex justify-center'
              }`}
              aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
            >
              <span className="text-gray-500 hover:text-gray-900">
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </span>
            </button>
          </div>
          
          <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
            {getNavItems().map((item) => (
              <NavItem 
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href}
                sidebarOpen={sidebarOpen}
              />
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-gray-200">
            <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className={`ml-3 overflow-hidden transition-all duration-300 ${
                sidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}>
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className={`mt-4 w-full flex items-center text-red-600 hover:text-red-700 transition-colors ${
                sidebarOpen ? 'px-3' : 'justify-center'
              }`}
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
              <span className={`ml-2 transition-all duration-300 ${
                sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
              }`}>
                Sair
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
} 