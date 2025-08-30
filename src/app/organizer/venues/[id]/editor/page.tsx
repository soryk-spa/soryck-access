"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SeatingEditor } from "@/components/seating/seating-editor";

interface Seat {
  id: string;
  row: string;
  number: string;
  x: number;
  y: number;
  status: 'AVAILABLE' | 'BLOCKED' | 'MAINTENANCE';
  isAccessible: boolean;
}

interface Section {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  priceZone?: string;
  seats: Seat[];
}

export default function VenueEditorPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [layoutData, setLayoutData] = useState<{ venueId: string; sections: Section[] } | null>(null);
  const [venue, setVenue] = useState<{ name: string; description?: string } | null>(null);

  // Cargar datos del venue
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setIsLoading(true);

        // Cargar información básica del venue
        const venueResponse = await fetch(`/api/venues/${venueId}`);
        if (venueResponse.ok) {
          const venueData = await venueResponse.json();
          setVenue(venueData);
        }

        // Cargar layout del venue
        const layoutResponse = await fetch(`/api/venues/${venueId}/layout`);
        if (layoutResponse.ok) {
          const data = await layoutResponse.json();
          setLayoutData(data);
        } else {
          // Si no hay layout, crear uno vacío
          setLayoutData({
            venueId,
            sections: [],
          });
        }
      } catch (error) {
        console.error("Error loading venue data:", error);
        toast.error("Error al cargar los datos del venue");
      } finally {
        setIsLoading(false);
      }
    };

    if (venueId) {
      fetchVenueData();
    }
  }, [venueId]);

  const handleSaveLayout = async (sections: Section[]) => {
    try {
      const response = await fetch(`/api/venues/${venueId}/layout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el layout");
      }

      toast.success("Layout guardado exitosamente");
      
      // Actualizar datos locales
      setLayoutData({
        venueId,
        sections,
      });

    } catch (error) {
      console.error("Error saving layout:", error);
      toast.error("Error al guardar el layout");
    }
  };

  const handleFinish = () => {
    toast.success("Venue configurado exitosamente");
    router.push("/organizer/venues");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p>Cargando editor de venue...</p>
      </div>
    );
  }

  if (!layoutData) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>Error al cargar el venue</p>
        <Button asChild className="mt-4">
          <Link href="/organizer/venues">
            Volver a Venues
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/organizer/venues">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                Configurar Asientos: {venue?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Diseña el layout de asientos para este venue
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleFinish}
              variant="outline"
            >
              Finalizar
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <SeatingEditor
          initialSections={layoutData.sections}
          onSave={handleSaveLayout}
        />
      </div>
    </div>
  );
}
