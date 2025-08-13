import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowLeft, Search } from "lucide-react";

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Evento no encontrado
              </h1>
              <p className="text-muted-foreground">
                El evento que buscas no existe o ha sido eliminado.
              </p>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Esto puede suceder si:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>El enlace es incorrecto</li>
                <li>El evento fue eliminado</li>
                <li>El evento no está publicado</li>
                <li>No tienes permisos para verlo</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/events">
                  <Search className="w-4 h-4 mr-2" />
                  Explorar Eventos
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                ¿Necesitas ayuda? Contacta a{" "}
                <a
                  href="mailto:soporte@soryckaccess.com"
                  className="text-primary hover:underline"
                >
                  soporte@sorykpass.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
