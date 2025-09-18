"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Clock,
  Ticket,
  Heart,
  Calendar,
  Plus,
} from "lucide-react";

interface Region {
  id: string;
  name: string;
  code: string;
  _count: {
    comunas: number;
    events: number;
  };
}

interface Comuna {
  id: string;
  name: string;
  regionId: string;
  region: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    events: number;
  };
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  address: string | null;
  comuna: string | null;
  region: string | null;
  regionId: string | null;
  comunaId: string | null;
  startDate: string;
  endDate: string | null;
  price: number;
  capacity: number;
  isFree: boolean;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
  organizer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  ticketTypes: {
    id: string;
    name: string;
    price: number;
    currency: string;
  }[];
  regionRef?: {
    id: string;
    name: string;
    code: string;
  };
  comunaRef?: {
    id: string;
    name: string;
    region: {
      id: string;
      name: string;
      code: string;
    };
  };
  _count: {
    tickets: number;
    orders: number;
  };
}

const EventCard = ({ event }: { event: Event }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { day, month, time } = formatDate(event.startDate);
  
  const getPriceDisplay = () => {
    
    if (event.isFree) return { text: "Gratis", isGreen: true };
    
    
    const allPrices: number[] = [];
    
    
    if (event.price && event.price > 0) {
      allPrices.push(event.price);
    }
    
    
    if (event.ticketTypes?.length) {
      const ticketPrices = event.ticketTypes.map((t) => t.price).filter((p) => p > 0);
      allPrices.push(...ticketPrices);
    }
    
    
    if (allPrices.length === 0) return { text: "Gratis", isGreen: true };
    
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    
    
    if (minPrice === maxPrice) {
      return { text: `$${minPrice.toLocaleString()}`, isGreen: false };
    }
    
    
    return { text: `Desde $${minPrice.toLocaleString()}`, isGreen: false };
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-gray-900 shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={event.imageUrl || "/sorykpass_1.jpg"}
          alt={event.title}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white">
            {event.category.name}
          </Badge>
        </div>
        
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
        
        <div className="absolute bottom-3 left-3 bg-white/95 rounded-lg p-2 min-w-[60px] text-center">
          <div className="text-xs text-gray-600 uppercase">{month}</div>
          <div className="text-lg font-bold text-gray-900">{day}</div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-gray-900 dark:text-white">
          {event.title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{time}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="line-clamp-1 font-medium">{event.location}</div>
              <div className="line-clamp-1 text-xs opacity-75">
                {event.comunaRef?.name || event.comuna}
                {(event.regionRef?.name || event.region) && 
                  `, ${event.regionRef?.name || event.region}`
                }
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-1">
            <div className={`text-lg font-bold ${getPriceDisplay().isGreen ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
              {getPriceDisplay().text}
            </div>
            <div className="text-xs text-gray-500">por persona</div>
          </div>
          
          <Button 
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6"
          >
            <Link href={`/events/${event.id}`}>
              <Ticket className="w-4 h-4 mr-2" />
              Comprar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedComuna, setSelectedComuna] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const eventsResponse = await fetch('/api/events/public');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          const eventsArray = eventsData.events || [];
          setEvents(eventsArray);
          
          
          const uniqueCategories = Array.from(
            new Set(eventsArray.map((event: Event) => event.category.name))
          ) as string[];
          setCategories(uniqueCategories);
        }

        
        const regionsResponse = await fetch('/api/regions');
        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json();
          setRegions(regionsData.regions || []);
        }

        
        const comunasResponse = await fetch('/api/comunas');
        if (comunasResponse.ok) {
          const comunasData = await comunasResponse.json();
          setComunas(comunasData.comunas || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
  const filteredComunas = selectedRegion === "all" 
    ? comunas 
    : comunas.filter(comuna => comuna.regionId === selectedRegion);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.comuna?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.comunaRef?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.regionRef?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || event.category.name === selectedCategory;
    
    const matchesComuna = selectedComuna === "all" || 
                         event.comunaId === selectedComuna ||
                         event.comuna === selectedComuna;
    
    const matchesRegion = selectedRegion === "all" || 
                         event.regionId === selectedRegion ||
                         event.region === selectedRegion ||
                         event.comunaRef?.region.id === selectedRegion;
    
    return matchesSearch && matchesCategory && matchesComuna && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {}
      <div className="relative w-full h-[600px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&h=600&fit=crop&crop=center"
          alt="Banner de eventos"
          fill
          className="object-cover"
          priority
        />
        
        {}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        
        {}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-7xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
              Vive la Experiencia
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 drop-shadow-md">
              Los mejores eventos te están esperando
            </p>
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => {
                document.getElementById('events-section')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              Explorar Eventos
            </Button>
          </div>
        </div>
      </div>

      {}
      <div id="events-section" className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Descubre eventos increíbles
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Encuentra y compra entradas para los mejores eventos en tu ciudad
            </p>
          </div>

          {}
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar eventos por nombre, descripción, venue, comuna o región..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Región</h3>
                <Select 
                  value={selectedRegion} 
                  onValueChange={(value) => {
                    setSelectedRegion(value);
                    setSelectedComuna("all"); 
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las regiones</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name.replace('Región de ', '').replace('Región ', '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comuna</h3>
                <Select value={selectedComuna} onValueChange={setSelectedComuna}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar comuna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las comunas</SelectItem>
                    {filteredComunas.map((comuna) => (
                      <SelectItem key={comuna.id} value={comuna.id}>
                        {comuna.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron eventos
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Intenta ajustar tus filtros de búsqueda
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedComuna("all");
              setSelectedRegion("all");
            }}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-300">
                {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>

      {}
      <div className="bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            ¿Organizas eventos?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Crea y gestiona tus eventos de manera profesional con nuestra plataforma
          </p>
          <Button 
            asChild
            variant="secondary" 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Link href="/organizer">
              <Plus className="w-4 h-4 mr-2" />
              Crear evento
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
