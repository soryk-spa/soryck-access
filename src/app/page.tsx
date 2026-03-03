import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Smartphone,
  QrCode,
  BarChart3,
  Users,
  ShieldCheck,
  Zap,
  Star,
  Download,
  LayoutDashboard,
} from "lucide-react";

const appFeatures = [
  {
    icon: QrCode,
    title: "Tickets digitales",
    description: "Compra y gestiona tus entradas 100% digitales desde tu teléfono.",
    gradient: "from-[#0053CC] to-[#01CBFE]",
  },
  {
    icon: ShieldCheck,
    title: "Acceso seguro",
    description: "Validación instantánea con QR único e infalsificable en la puerta.",
    gradient: "from-[#01CBFE] to-[#CC66CC]",
  },
  {
    icon: Zap,
    title: "Sin fricciones",
    description: "Ingresa al evento en segundos. Sin papel, sin espera.",
    gradient: "from-[#CC66CC] to-[#FE4F00]",
  },
  {
    icon: Star,
    title: "Tu historial de eventos",
    description: "Revisa todos los eventos a los que has asistido en un solo lugar.",
    gradient: "from-[#FE4F00] to-[#FDBD00]",
  },
];

const organizerFeatures = [
  {
    icon: LayoutDashboard,
    title: "Panel de control",
    description: "Gestiona tus eventos, ventas y asistentes desde un dashboard profesional.",
  },
  {
    icon: BarChart3,
    title: "Estadísticas en tiempo real",
    description: "Monitorea ventas, ingresos y ocupación mientras ocurre el evento.",
  },
  {
    icon: Users,
    title: "Gestión de acceso",
    description: "Administra equipos de scanners y controla los accesos al recinto.",
  },
  {
    icon: Smartphone,
    title: "App de scanner",
    description: "Tus staff validan entradas con SoryckPass directamente desde su celular.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0053CC] via-[#0053CC] to-[#01CBFE] text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#01CBFE]/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left – text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium">
                <Smartphone className="w-4 h-4" />
                Descarga la app gratuita
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                La puerta de entrada
                <span className="block bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] bg-clip-text text-transparent">
                  al presente
                </span>
              </h1>

              <p className="text-lg text-white/80 max-w-lg leading-relaxed">
                Con <strong className="text-white">SoryckPass</strong> compra tus tickets, accede a los eventos
                y guarda tu historial, todo desde la app móvil. Sin papel, sin fila.
              </p>

              {/* App store buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#"
                  className="flex items-center gap-3 bg-black hover:bg-gray-900 transition-colors rounded-xl px-5 py-3 border border-white/10 group"
                >
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white flex-shrink-0">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-white/70 leading-none">Disponible en</div>
                    <div className="text-sm font-semibold text-white leading-tight mt-0.5">App Store</div>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-3 bg-black hover:bg-gray-900 transition-colors rounded-xl px-5 py-3 border border-white/10 group"
                >
                  <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0">
                    <path fill="#EA4335" d="m12 .5-8.5 15h3.25L12 7l5.25 8.5H20.5z" />
                    <path fill="#FBBC05" d="M3.5 15.5h17l-2.5-4.25H6z" />
                    <path fill="#34A853" d="m9 10.75-5.5 4.75h3.25L12 7z" />
                    <path fill="#4285F4" d="m15 10.75 5.5 4.75h-3.25L12 7z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-white/70 leading-none">Disponible en</div>
                    <div className="text-sm font-semibold text-white leading-tight mt-0.5">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right – phone mockup */}
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="w-56 h-[460px] bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center gap-6 p-6">
                  <Image
                    src="/sorykpass_vertical_white.png"
                    alt="SoryckPass App"
                    width={140}
                    height={140}
                    className="opacity-90"
                  />
                  <div className="text-center space-y-2">
                    <p className="text-white font-semibold text-sm">SoryckPass</p>
                    <p className="text-white/60 text-xs leading-relaxed">
                      Tu pase digital para todos los eventos
                    </p>
                  </div>
                  <div className="w-full space-y-2">
                    {["Ticket QR · Concierto 2025", "Acceso · Festival Arte", "Entrada · Partido Copa"].map((t) => (
                      <div key={t} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                        <QrCode className="w-4 h-4 text-[#FDBD00] flex-shrink-0" />
                        <span className="text-white/80 text-xs truncate">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FDBD00]/20 to-transparent rounded-[3rem] -z-10 blur-2xl scale-110" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS APP ──────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#0053CC] uppercase tracking-wider mb-3">
              Para asistentes
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Todo lo que necesitas en tu bolsillo
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Descarga SoryckPass y olvídate del papel. Tu ticket digital siempre disponible, incluso sin conexión.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {appFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="#" className="inline-flex items-center gap-2 text-[#0053CC] font-medium hover:underline">
              <Download className="w-4 h-4" />
              Descargar SoryckPass gratis
            </a>
          </div>
        </div>
      </section>

      {/* ── DIVISOR ──────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── PLATAFORMA ORGANIZADORES ─────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left – dashboard mockup */}
            <div className="order-2 lg:order-1">
              <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                {/* Fake browser bar */}
                <div className="bg-muted border-b border-border px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FE4F00]/60" />
                  <div className="w-3 h-3 rounded-full bg-[#FDBD00]/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <div className="ml-4 flex-1 bg-background rounded-md h-5 text-xs text-muted-foreground flex items-center px-3">
                    manage.sorykpass.com
                  </div>
                </div>
                {/* Fake dashboard content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Bienvenido</p>
                      <p className="font-bold text-foreground">Panel de Organizador</p>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] text-white">
                      ORGANIZER
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Eventos activos", val: "4" },
                      { label: "Entradas vendidas", val: "1.240" },
                      { label: "Ingresos", val: "$3.7M" },
                    ].map((s) => (
                      <div key={s.label} className="bg-muted rounded-xl p-3 text-center">
                        <div className="font-bold text-foreground text-lg">{s.val}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {["Festival de Rock · 12 Mar", "Obra de Teatro · 20 Mar", "Conferencia Tech · 5 Abr"].map((ev) => (
                      <div key={ev} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2.5">
                        <span className="text-sm text-foreground">{ev}</span>
                        <span className="text-xs text-green-600 font-medium">Publicado</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right – text */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <p className="text-sm font-semibold text-[#FE4F00] uppercase tracking-wider mb-3">
                  Para organizadores y administradores
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Gestiona tus eventos
                  <span className="block text-[#0053CC]">con total control</span>
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Esta plataforma web está diseñada exclusivamente para organizadores y administradores.
                  Crea eventos, vende entradas, gestiona accesos y analiza resultados en un solo lugar.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {organizerFeatures.map((feature) => (
                  <div key={feature.title} className="flex gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#0053CC] to-[#01CBFE] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white border-0 shadow-lg"
                >
                  <Link href="/sign-in">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Acceder al panel
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/sign-up">
                    Solicitar acceso
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-[#FDBD00] via-[#FE4F00] to-[#CC66CC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            ¿Eres asistente a eventos?
          </h2>
          <p className="text-white/90 text-lg max-w-xl mx-auto">
            Descarga la app móvil de SoryckPass. Allí encontrarás todos los eventos disponibles
            y podrás comprar tus entradas de forma rápida y segura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#0053CC] font-semibold rounded-xl px-8 py-3 hover:bg-white/90 transition-colors shadow-lg"
            >
              <Download className="w-5 h-5" />
              Descargar App
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
