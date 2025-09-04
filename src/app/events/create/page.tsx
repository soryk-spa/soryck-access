import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateEventForm from "@/components/create-event-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  Users,
  Shield,
  Zap,
  ArrowLeft,
  Info,
  CheckCircle2,
  Star,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Evento | SorykPass",
  description:
    "Crea tu evento y empieza a vender tickets de forma segura y profesional.",
  keywords: "crear evento, vender tickets, organizar eventos, chile",
  openGraph: {
    title: "Crear Evento | SorykPass",
    description:
      "Crea tu evento y empieza a vender tickets de forma segura y profesional.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crear Evento | SorykPass",
    description:
      "Crea tu evento y empieza a vender tickets de forma segura y profesional.",
  },
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color = "blue",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color?: "blue" | "green" | "purple" | "orange";
}) => {
  const colorVariants = {
    blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    green:
      "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    purple:
      "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    orange:
      "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  };

  return (
    <Card
      className={`border ${colorVariants[color]} transition-all duration-200 hover:shadow-lg`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default async function CreateEventPage() {
  const user = await requireOrganizer();

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  
  const [userEvents, userStats] = await Promise.all([
    prisma.event.count({
      where: { organizerId: user.id },
    }),
    prisma.event.aggregate({
      where: {
        organizerId: user.id,
        isPublished: true,
      },
      _sum: { totalRevenue: true },
      _count: { id: true },
    }),
  ]);

  const organizerName = user.firstName || user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/events">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Eventos
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  Crear Nuevo Evento
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hola {organizerName}, crea tu próxima experiencia
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                <Award className="w-3 h-3 mr-1" />
                {userEvents} eventos creados
              </Badge>
              {userStats._count.id > 0 && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />$
                  {(userStats._sum.totalRevenue || 0).toLocaleString("es-CL")}{" "}
                  recaudados
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {}
        {userEvents === 0 && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      ¡Bienvenido a SorykPass! 🎉
                    </h2>
                    <p className="text-blue-700 dark:text-blue-300 mb-4">
                      Estás a punto de crear tu primer evento. Te guiaremos paso
                      a paso para que tengas una experiencia exitosa.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <Clock className="h-4 w-4" />
                      <span>Tiempo estimado: 5-10 minutos</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureCard
                icon={Shield}
                title="Pagos Seguros"
                description="Procesamiento seguro con Transbank"
                color="blue"
              />
              <FeatureCard
                icon={Zap}
                title="Solo 6% Comisión"
                description="Sin costos fijos, solo pagas cuando vendes"
                color="green"
              />
              <FeatureCard
                icon={Users}
                title="Gestión Completa"
                description="Control total de tu evento y asistentes"
                color="purple"
              />
              <FeatureCard
                icon={Calendar}
                title="QR Automático"
                description="Tickets con código QR único"
                color="orange"
              />
            </div>
          </div>
        )}

        {}
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Una vez creado, tu evento estará en
              modo borrador. Podrás publicarlo cuando estés listo desde la
              página de detalles del evento.
            </AlertDescription>
          </Alert>

          {categories.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No hay categorías disponibles. Contacta al administrador para
                que configure las categorías de eventos.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {}
        {categories.length > 0 ? (
          <CreateEventForm categories={categories} mode="create" />
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                No se puede crear el evento
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Necesitamos que un administrador configure al menos una
                categoría antes de que puedas crear eventos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/dashboard/events">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Dashboard
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/contact">Contactar Administrador</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="p-6">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm mb-4">
                Te acompañamos en todo el proceso. Si tienes dudas, revisa
                nuestra guía o contáctanos.
              </p>
              <div className="flex gap-3">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/guide">Ver Guía</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/contact">Soporte</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardContent className="p-6">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                Después de crear tu evento
              </h3>
              <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Podrás previsualizar y editar todos los detalles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Publicar cuando estés listo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Gestionar ventas y asistentes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Ver estadísticas en tiempo real
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
