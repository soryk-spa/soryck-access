import Link from 'next/link'
import Image from 'next/image'

const SorykPassFooterLogo = ({
  className = "",
  size = "default",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
}) => {
  const sizeClasses = {
    sm: "h-6 w-auto",
    default: "h-8 w-auto",
    lg: "h-10 w-auto",
  };

  return (
    <Link
      href="/"
      className={`transition-opacity hover:opacity-80 ${className}`}
    >
      <Image
        src="/sorykpass_horizontal_black.png"
        alt="SorykPass"
        width={120}
        height={30}
        className={`${sizeClasses[size]} dark:hidden`}
        priority
      />
      <Image
        src="/sorykpass_horizontal_white.png"
        alt="SorykPass"
        width={120}
        height={30}
        className={`${sizeClasses[size]} hidden dark:block`}
        priority
      />
    </Link>
  );
};

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const links = [
    { name: 'Privacidad', href: '/privacy' },
    { name: 'Términos', href: '/terms' },
    { name: 'Contacto', href: '/contact' },
    { name: 'Ayuda', href: '/help' },
  ]

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <SorykPassFooterLogo size="sm" />
            <div className="hidden md:flex items-center gap-4">
              {links.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {currentYear} SorykPass. Todos los derechos reservados.
          </p>
        </div>
        
        {}
        <div className="md:hidden flex justify-center gap-4 mt-4 pt-4 border-t border-border">
          {links.map((link) => (
            <Link 
              key={link.name}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}