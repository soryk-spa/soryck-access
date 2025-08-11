'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QRCodeDisplay from '@/components/qr-code-display';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, ArrowLeft, Download } from 'lucide-react';
import type { Prisma } from '@prisma/client';

type TicketWithEvent = Prisma.TicketGetPayload<{
  include: {
    event: {
      select: {
        title: true;
        startDate: true;
        location: true;
        imageUrl: true;
      };
    };
  };
}>;

interface TicketDetailClientProps {
  ticket: TicketWithEvent;
}

export default function TicketDetailClient({ ticket }: TicketDetailClientProps) {
  const eventDate = new Date(ticket.event.startDate);
  const eventTime = eventDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
  const fullEventDate = eventDate.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container mx-auto max-w-md py-8">
      {/* Botón para volver al Dashboard */}
      <div className="mb-4">
        <Button asChild variant="ghost">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Tickets
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-2xl border-none bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {ticket.event.imageUrl && (
          <div className="relative h-40 w-full">
            <Image
              src={ticket.event.imageUrl}
              alt={ticket.event.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h2 className="text-2xl font-bold text-white shadow-lg">{ticket.event.title}</h2>
            </div>
          </div>
        )}

        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2">
              <h3 className="text-xs uppercase text-muted-foreground font-semibold">Evento</h3>
              <p className="font-bold text-lg">{ticket.event.title}</p>
            </div>
            <div>
              <h3 className="text-xs uppercase text-muted-foreground font-semibold">Estado</h3>
              <Badge
                variant={ticket.isUsed ? 'secondary' : 'default'}
                className={ticket.isUsed ? '' : 'bg-green-600 text-white'}
              >
                {ticket.isUsed ? 'UTILIZADO' : 'VÁLIDO'}
              </Badge>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="font-semibold">{fullEventDate}</p>
                <p className="text-sm text-muted-foreground">{eventTime} hrs.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="font-semibold">{ticket.event.location}</p>
                <p className="text-sm text-muted-foreground">Ubicación del evento</p>
              </div>
            </div>
          </div>
          
          <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-700 my-6"></div>

          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-muted-foreground">
              Presenta este código en la entrada
            </p>
            
            <QRCodeDisplay qrCodeValue={ticket.qrCode} />

            <div className="text-center">
              <p className="text-xs text-muted-foreground">ID del Ticket</p>
              <p className="font-mono text-sm">{ticket.id}</p>
            </div>
          </div>

        </CardContent>
        <div className="bg-gray-100 dark:bg-gray-800/50 p-4">
           <Button variant="outline" className="w-full" disabled>
             <Download className="h-4 w-4 mr-2" />
             Descargar Ticket (Próximamente)
           </Button>
        </div>
      </Card>
    </div>
  );
}