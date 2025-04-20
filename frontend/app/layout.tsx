import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/auth-context'
import { ClientLayout } from '@/components/layout/client-layout'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Agendamento Cabeleireiros',
  description: 'Sistema de agendamento e gerenciamento para salões de cabeleireiros e barbearias',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          "selection:bg-primary-500/10"
        )}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ClientLayout>
            {children}
            <Toaster />
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
} 