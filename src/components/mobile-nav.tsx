"use client"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { canOrganizeEvents, canAccessAdmin, ROLE_LABELS } from '@/lib/roles'
import { 
  Menu, 
  Calendar, 
  LayoutDashboard, 
  Plus, 
  Settings, 
  User,
  LogIn,
  UserPlus,
  Home,
  Ticket,
  Building2
} from 'lucide-react'
import { UserRole } from '@prisma/client'
import Image from 'next/image'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: UserRole
}

interface MobileNavProps {
  user: User | null
  userId: string | null
}

const SorykPassLogo = ({
  className = "",
  size = "default",
  variant = "auto",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "light" | "dark" | "auto";
}) => {
  const sizeClasses = {
    sm: "h-8 w-auto",
    default: "h-10 w-auto",
    lg: "h-12 w-auto",
  };

  return (
    <Link
      href="/"
      className={`transition-transform hover:scale-105 ${className}`}
    >
      {variant === "auto" ? (
        <>
          <Image
            src="/sorykpass_horizontal_black.png"
            alt="SorykPass"
            width={200}
            height={40}
            className={`${sizeClasses[size]} dark:hidden`}
            priority
          />
          <Image
            src="/sorykpass_horizontal_white.png"
            alt="SorykPass"
            width={200}
            height={40}
            className={`${sizeClasses[size]} hidden dark:block`}
            priority
          />
        </>
      ) : (
        <Image
          src={variant === "dark" ? "/logo/logo-white.svg" : "/logo/logo.svg"}
          alt="SorykPass"
          width={200}
          height={40}
          className={sizeClasses[size]}
          priority
        />
      )}
    </Link>
  );
};

export default function MobileNav({ user, userId }: MobileNavProps) {
  
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  const navigationItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: Home,
      show: true,
      gradient: 'from-[#01CBFE] to-[#0053CC]'
    },
    {
      href: '/events',
      label: 'Eventos',
      icon: Calendar,
      show: true,
      gradient: 'from-[#0053CC] to-[#01CBFE]'
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: !!userId,
      gradient: 'from-[#0053CC] to-[#CC66CC]'
    },
    {
      href: '/dashboard/tickets',
      label: 'Mis Tickets',
      icon: Ticket,
      show: !!userId,
      gradient: 'from-[#01CBFE] to-[#CC66CC]'
    },
    {
      href: '/organizer',
      label: 'Organizar',
      icon: Building2,
      show: userId && user && canOrganizeEvents(user.role),
      gradient: 'from-[#FDBD00] to-[#CC66CC]'
    },
    {
      href: '/events/create',
      label: 'Crear Evento',
      icon: Plus,
      show: userId && user && canOrganizeEvents(user.role),
      gradient: 'from-[#CC66CC] to-[#FE4F00]'
    },
    {
      href: '/admin',
      label: 'Administración',
      icon: Settings,
      show: userId && user && canAccessAdmin(user.role),
      gradient: 'from-[#FE4F00] to-[#FDBD00]'
    }
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden relative hover:bg-[#01CBFE]/10 border-0"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-[280px] sm:w-[320px] bg-background border-l border-border"
      >
        <SheetHeader className="text-left pb-6 border-b border-border">
          <SheetTitle className="text-xl font-bold bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">
            <SorykPassLogo className="h-8 w-auto" />
          </SheetTitle>
          {userId && user && (
            <div className="mt-4 p-3 bg-gradient-to-r from-[#01CBFE]/10 to-[#0053CC]/10 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {user.firstName || user.email.split('@')[0]}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                  <Badge 
                    className={`text-xs mt-2 border-0 ${
                      user.role === 'ADMIN' 
                        ? 'bg-gradient-to-r from-[#CC66CC] to-[#0053CC] text-white' 
                        : user.role === 'ORGANIZER'
                        ? 'bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] text-white'
                        : 'bg-gradient-to-r from-[#01CBFE] to-[#0053CC] text-white'
                    }`}
                  >
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              if (!item.show) return null
              
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors group border-0"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-foreground group-hover:text-[#0053CC] transition-colors">
                      {item.label}
                    </span>
                  </Link>
                </SheetClose>
              )
            })}
          </div>
          {!userId && (
            <div className="pt-6 border-t border-border space-y-3">
              <SignInButton>
                <div 
                  className="w-full cursor-pointer"
                  onClick={handleLinkClick}
                >
                  <div className="flex items-center justify-start space-x-3 px-3 py-3 rounded-lg border-2 border-[#0053CC]/20 text-[#0053CC] hover:bg-[#0053CC]/5 hover:border-[#0053CC]/40 transition-all duration-200 bg-background">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-lg flex items-center justify-center">
                      <LogIn className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Iniciar Sesión</span>
                  </div>
                </div>
              </SignInButton>
              
              <SignUpButton>
                <div 
                  className="w-full cursor-pointer"
                  onClick={handleLinkClick}
                >
                  <div className="flex items-center justify-start space-x-3 px-3 py-3 rounded-lg bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 transition-all duration-200 text-white border-0">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">Registrarse</span>
                  </div>
                </div>
              </SignUpButton>
            </div>
          )}
          <div className="pt-6 border-t border-border">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                SorykPass - La puerta de entrada al presente
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-[#FDBD00] rounded-full"></div>
                <div className="w-2 h-2 bg-[#FE4F00] rounded-full"></div>
                <div className="w-2 h-2 bg-[#CC66CC] rounded-full"></div>
                <div className="w-2 h-2 bg-[#0053CC] rounded-full"></div>
                <div className="w-2 h-2 bg-[#01CBFE] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}