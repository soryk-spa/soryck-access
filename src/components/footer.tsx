import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Instagram, 
  Linkedin,
  Github,
  ExternalLink
} from 'lucide-react'

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
    { name: 'Twitter', href: 'https://twitter.com/soryckaccess', icon: Twitter },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/soryckaccess', icon: Linkedin },
    { name: 'Instagram', href: 'https://instagram.com/soryckaccess', icon: Instagram },
    { name: 'GitHub', href: 'https://github.com/soryckaccess', icon: Github },
  ]

  return (
    <footer className="bg-background border-t border-border">
      {/* Newsletter Section */}
      <div className="bg-muted">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Mantente al día con Soryck Access
            </h3>
            <p className="text-muted-foreground mb-6">
              Recibe las últimas actualizaciones, consejos para organizadores y casos de éxito directamente en tu inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Suscribirse
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Sin spam. Cancela cuando quieras.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">
                Soryck Access
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              La plataforma más confiable para crear, gestionar y vender tickets de eventos. 
              Solo cobramos cuando tú vendes.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:hola@soryckaccess.com" className="hover:text-foreground transition-colors">
                  hola@soryckaccess.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:+56912345678" className="hover:text-foreground transition-colors">
                  +56 9 1234 5678
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Valdivia, Los Ríos, Chile</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-muted hover:bg-primary transition-colors rounded-lg flex items-center justify-center group"
                >
                  <social.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Producto</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                Todos los sistemas operativos
              </Badge>
              <a 
                href="https://status.soryckaccess.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Ver estado del sistema
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {currentYear} Soryck Access. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}