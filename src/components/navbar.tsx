import Link from 'next/link'
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { getCurrentUser } from '@/lib/auth'
import { canOrganizeEvents, canAccessAdmin, ROLE_LABELS, UserRole } from '@/lib/roles'

// Componente del logo de SorykPass según el branbook
const SorykPassNavLogo = () => (
  <div className="flex items-center space-x-2">
    {/* Símbolo hexagonal con gradiente según el branbook - versión compacta para navbar */}
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDBD00] via-[#FE4F00] to-[#01CBFE] rounded-lg transform rotate-12"></div>
      <div className="absolute inset-0.5 bg-background rounded-md flex items-center justify-center">
        <span className="text-sm font-bold bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">S</span>
      </div>
    </div>
    <span className="font-bold text-xl text-foreground tracking-tight">
      SORYKPASS
    </span>
  </div>
)

export default async function Navbar() {
  const { userId } = await auth()
  const user = await getCurrentUser()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="transition-transform hover:scale-105">
              <SorykPassNavLogo />
            </Link>
          </div>
          
          {/* Navegación principal */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/events" 
              className="text-foreground hover:text-[#0053CC] transition-colors font-medium relative group"
            >
              Eventos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] transition-all group-hover:w-full"></span>
            </Link>
            
            {userId && (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-foreground hover:text-[#0053CC] transition-colors font-medium relative group"
                >
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] transition-all group-hover:w-full"></span>
                </Link>
                
                {user && canOrganizeEvents(user.role) && (
                  <Link 
                    href="/events/create" 
                    className="text-foreground hover:text-[#CC66CC] transition-colors font-medium relative group"
                  >
                    Crear Evento
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] transition-all group-hover:w-full"></span>
                  </Link>
                )}
                
                {user && canAccessAdmin(user.role) && (
                  <Link 
                    href="/admin" 
                    className="text-foreground hover:text-[#FE4F00] transition-colors font-medium relative group"
                  >
                    Admin
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FE4F00] to-[#FDBD00] transition-all group-hover:w-full"></span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Área de usuario y controles */}
          <div className="flex items-center space-x-4">
            {/* Badge de rol con colores del branbook */}
            {user && (
              <div className="relative">
                <div 
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    user.role === 'ADMIN' 
                      ? 'bg-gradient-to-r from-[#CC66CC] to-[#0053CC] text-white' 
                      : user.role === 'ORGANIZER'
                      ? 'bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] text-white'
                      : 'bg-gradient-to-r from-[#01CBFE] to-[#0053CC] text-white'
                  }`}
                >
                  {ROLE_LABELS[user.role as UserRole]}
                </div>
              </div>
            )}
            
            <ThemeToggle />
            
            {userId ? (
              <div className="relative">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-2 ring-[#01CBFE]/20 hover:ring-[#01CBFE]/40 transition-all"
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <SignInButton>
                  <Button variant="ghost" size="sm" className="hover:text-[#0053CC] hover:bg-[#01CBFE]/10">
                    Iniciar Sesión
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white shadow-lg"
                  >
                    Registrarse
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}