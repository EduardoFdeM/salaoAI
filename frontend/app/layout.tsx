import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/auth-context'
import { ClientLayout } from '@/components/layout/client-layout'
import { cn } from '@/lib/utils'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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