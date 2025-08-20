import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { 
  Mail,
  Phone,
  MapPin,
  Instagram,
  ExternalLink
} from 'lucide-react'
import Image from 'next/image'

const SorykPassFooterLogo = ({
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

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const productLinks = [
    { name: 'Características', href: '#features' },
    { name: 'Precios', href: '#pricing' },
    { name: 'Demo', href: '/demo' },
    { name: 'Casos de Uso', href: '/use-cases' },
  ]

  const companyLinks = [
    { name: 'Sobre Nosotros', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Carreras', href: '/careers' },
    { name: 'Prensa', href: '/press' },
  ]

  const supportLinks = [
    { name: 'Centro de Ayuda', href: '/help' },
    { name: 'Documentación', href: '/docs' },
    { name: 'API', href: '/api-docs' },
    { name: 'Contacto', href: '/contact' },
  ]

  const legalLinks = [
    { name: 'Privacidad', href: '/privacy' },
    { name: 'Términos', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'Seguridad', href: '/security' },
  ]

  const socialLinks = [
    { 
      name: 'Instagram', 
      href: 'https://instagram.com/sorykpass', 
      icon: Instagram,
      gradient: 'from-[#CC66CC] to-[#FE4F00]'
    },
  ]

  return (
    <footer className="bg-gradient-to-br from-background to-muted border-t border-border relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#01CBFE]/5 to-[#0053CC]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#FDBD00]/5 to-[#FE4F00]/5 rounded-full blur-3xl"></div> 
      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <SorykPassFooterLogo />
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
              La plataforma más confiable para crear, gestionar y vender tickets de eventos. 
              Un sistema ágil, confiable y sin fricciones.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-[#0053CC] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#01CBFE] to-[#0053CC] flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <a href="mailto:hola@sorykpass.com" className="hover:text-foreground transition-colors">
                  hola@sorykpass.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-[#0053CC] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <a href="tel:+56912345678" className="hover:text-foreground transition-colors">
                  +56 9 5653 2975
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span>Valdivia, Los Ríos, Chile</span>
              </div>
            </div>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-gradient-to-r ${social.gradient} hover:scale-110 transition-all duration-300 rounded-lg flex items-center justify-center group shadow-lg`}
                >
                  <social.icon className="h-4 w-4 text-white" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Producto</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#0053CC] transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] transition-all group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#CC66CC] transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] transition-all group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#FE4F00] transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FE4F00] to-[#FDBD00] transition-all group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#FDBD00] transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FDBD00] to-[#01CBFE] transition-all group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Badge 
                variant="outline" 
                className="text-[#01CBFE] border-[#01CBFE] bg-[#01CBFE]/10 hover:bg-[#01CBFE]/20 transition-colors"
              >
                <div className="w-2 h-2 bg-[#01CBFE] rounded-full mr-2 animate-pulse"></div>
                Todos los sistemas operativos
              </Badge>
              <a 
                href="https://status.sorykpass.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-[#0053CC] transition-colors flex items-center gap-1 group"
              >
                Ver estado del sistema
                <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {currentYear} SorykPass. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}