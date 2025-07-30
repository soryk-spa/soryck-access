import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Instagram, 
  Linkedin,
  Github,
  ExternalLink
} from 'lucide-react'

const SorykPassFooterLogo = () => (
  <div className="flex items-center space-x-3">
    {/* Símbolo hexagonal con gradiente según el branbook */}
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDBD00] via-[#FE4F00] to-[#01CBFE] rounded-lg transform rotate-12"></div>
      <div className="absolute inset-1 bg-background rounded-md flex items-center justify-center">
        <span className="text-lg font-bold bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">S</span>
      </div>
    </div>
    <span className="font-bold text-2xl text-foreground tracking-tight">
      SORYKPASS
    </span>
  </div>
)

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
      name: 'Twitter', 
      href: 'https://twitter.com/sorykpass', 
      icon: Twitter,
      gradient: 'from-[#01CBFE] to-[#0053CC]'
    },
    { 
      name: 'LinkedIn', 
      href: 'https://linkedin.com/company/sorykpass', 
      icon: Linkedin,
      gradient: 'from-[#0053CC] to-[#CC66CC]'
    },
    { 
      name: 'Instagram', 
      href: 'https://instagram.com/sorykpass', 
      icon: Instagram,
      gradient: 'from-[#CC66CC] to-[#FE4F00]'
    },
    { 
      name: 'GitHub', 
      href: 'https://github.com/sorykpass', 
      icon: Github,
      gradient: 'from-[#FE4F00] to-[#FDBD00]'
    },
  ]

  return (
    <footer className="bg-gradient-to-br from-background to-muted border-t border-border relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#01CBFE]/5 to-[#0053CC]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#FDBD00]/5 to-[#FE4F00]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Información principal de la empresa */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <SorykPassFooterLogo />
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
              La plataforma más confiable para crear, gestionar y vender tickets de eventos. 
              Un sistema ágil, confiable y sin fricciones.
            </p>
            
            {/* Información de contacto */}
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
                  +56 9 1234 5678
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span>Valdivia, Los Ríos, Chile</span>
              </div>
            </div>
            
            {/* Redes sociales */}
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

          {/* Enlaces del producto */}
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

          {/* Enlaces de la empresa */}
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

          {/* Enlaces de soporte */}
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

          {/* Enlaces legales */}
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

        {/* Sección inferior */}
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