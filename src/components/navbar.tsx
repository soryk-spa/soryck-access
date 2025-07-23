import Link from 'next/link'
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function Navbar() {
  const { userId } = await auth()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SA</span>
              </div>
              <span className="font-bold text-xl text-foreground">
                Soryck Access
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/events" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Eventos
            </Link>
            {userId && (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/events/create" 
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Crear Evento
                </Link>
              </>
            )}
          </div>

          {/* Auth and Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {userId ? (
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton>
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button size="sm">
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