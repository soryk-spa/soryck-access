"use client"
import Image from "next/image"
import React, { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useOutsideClick } from "@/hooks/use-outside-click"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Users,
  Tag,
} from "lucide-react"

interface Event {
  id: string
  title: string
  description: string | null
  location: string
  startDate: string
  endDate: string | null
  price: number
  capacity: number
  isFree: boolean
  imageUrl: string | null
  category: {
    id: string
    name: string
  }
  organizer: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
  ticketTypes: {
    id: string
    name: string
    price: number
    currency: string
  }[]
  _count: {
    tickets: number
    orders: number
  }
}

interface EventCardData {
  id: string
  title: string
  description: string
  location: string
  startDate: string
  category: string
  price: string
  imageUrl: string
  capacity: number
  soldTickets: number
  organizer: string
  ctaLink: string
  content: () => React.ReactNode
}

export function EventsExpandableCards({ events }: { events: Event[] }) {
  const [active, setActive] = useState<EventCardData | boolean | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false)
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden"
      document.body.style.paddingRight = "0px" // Prevent layout shift
    } else {
      document.body.style.overflow = "auto"
      document.body.style.paddingRight = ""
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active])

  useOutsideClick(ref, () => setActive(null))

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("es-ES", { month: "short" }),
      weekday: date.toLocaleDateString("es-ES", { weekday: "short" }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      full: date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getEventPriceDisplay = (event: Event) => {
    if (event.isFree || !event.ticketTypes.length) {
      return "Gratis"
    }

    const prices = event.ticketTypes
      .map(t => t.price)
      .filter(p => p > 0)

    if (prices.length === 0) {
      return "Gratis"
    }

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    if (minPrice === maxPrice) {
      return formatPrice(minPrice)
    }

    return `Desde ${formatPrice(minPrice)}`
  }

  const getAvailability = (event: Event) => {
    const available = event.capacity - event._count.tickets
    const percentage = ((event.capacity - available) / event.capacity) * 100

    if (available === 0) {
      return {
        status: "sold-out",
        text: "Agotado",
        color: "bg-red-500/10 text-red-400 border border-red-500/20",
      }
    } else if (percentage > 80) {
      return {
        status: "limited",
        text: "Últimas entradas",
        color: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
      }
    } else {
      return {
        status: "available",
        text: "Disponible",
        color: "bg-green-500/10 text-green-400 border border-green-500/20",
      }
    }
  }

  const transformEventsToCards = (events: Event[]): EventCardData[] => {
    return events.map((event) => {
      const startDate = formatDate(event.startDate)
      const availability = getAvailability(event)
      const priceDisplay = getEventPriceDisplay(event)
      const organizerName = event.organizer.firstName && event.organizer.lastName 
        ? `${event.organizer.firstName} ${event.organizer.lastName}`
        : event.organizer.email

      return {
        id: event.id,
        title: event.title,
        description: `${startDate.weekday}, ${startDate.day} ${startDate.month} • ${event.location}`,
        location: event.location,
        startDate: event.startDate,
        category: event.category.name,
        price: priceDisplay,
        imageUrl: event.imageUrl || "/sorykpass_black.png",
        capacity: event.capacity,
        soldTickets: event._count.tickets,
        organizer: organizerName,
        ctaLink: `/events/${event.id}`,
        content: () => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha</span>
                </div>
                <p className="font-medium">{startDate.full}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{startDate.time}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <MapPin className="h-4 w-4" />
                  <span>Ubicación</span>
                </div>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Users className="h-4 w-4" />
                  <span>Capacidad</span>
                </div>
                <p className="font-medium">{event.capacity} personas</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {event._count.tickets} tickets vendidos
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Tag className="h-4 w-4" />
                  <span>Precio</span>
                </div>
                <p className="font-medium text-lg">{priceDisplay}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={availability.color}>
                  {availability.text}
                </Badge>
                <Badge variant="secondary">
                  {event.category.name}
                </Badge>
              </div>
            </div>

            {event.description && (
              <div className="space-y-2">
                <h4 className="font-medium">Descripción</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">Organizador</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {organizerName}
              </p>
            </div>
          </div>
        ),
      }
    })
  }

  const cards = transformEventsToCards(events)

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
          <Calendar className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
          No hay eventos próximos
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          ¡Mantente atento! Pronto habrán nuevos eventos emocionantes.
        </p>
        <Button asChild>
          <Link href="/events">Ver todos los eventos</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm h-full w-full z-10"
            onClick={() => setActive(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && typeof active === "object" && (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4">
            <motion.button
              key={`button-close-${active.title}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white dark:bg-neutral-800 rounded-full h-8 w-8 z-10"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <Image
                  priority
                  width={500}
                  height={300}
                  src={active.imageUrl}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-center"
                />
              </motion.div>

              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start p-6 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex-1">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-xl text-neutral-900 dark:text-neutral-100 mb-2"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.div
                    layoutId={`button-${active.title}-${id}`}
                    className="ml-4"
                  >
                    <Button asChild size="lg" className="bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] hover:from-[#FE4F00]/90 hover:to-[#CC66CC]/90">
                      <Link href={active.ctaLink}>
                        Ver Evento
                      </Link>
                    </Button>
                  </motion.div>
                </div>

                <div className="flex-1 p-6 overflow-auto">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-neutral-600 dark:text-neutral-400"
                  >
                    {active.content()}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Grid layout like the test component */}
      <ul className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="group p-6 flex flex-col hover:bg-white/5 dark:hover:bg-neutral-800/50 rounded-2xl cursor-pointer transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex gap-4 mb-4">
              <motion.div
                layoutId={`image-${card.title}-${id}`}
                className="flex-shrink-0"
              >
                <Image
                  width={120}
                  height={120}
                  src={card.imageUrl}
                  alt={card.title}
                  className="h-24 w-24 rounded-xl object-cover object-center"
                />
                <div className="absolute -top-2 -right-2">
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/90 text-neutral-800">
                    {card.category}
                  </Badge>
                </div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-bold text-lg text-white group-hover:text-white/90 transition-colors mb-2 truncate"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-white/60 text-sm mb-3 line-clamp-2"
                >
                  {card.description}
                </motion.p>

                <div className="flex items-center gap-4 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{card.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{card.soldTickets}/{card.capacity}</span>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              layoutId={`button-${card.title}-${id}`}
              className="mt-auto"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-white">{card.price}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white hover:text-white group-hover:bg-gradient-to-r group-hover:from-[#FE4F00] group-hover:to-[#CC66CC] transition-all duration-300"
                >
                  Ver más
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </ul>
    </>
  )
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black dark:text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="m18 6 -12 12" />
      <path d="m6 6 12 12" />
    </motion.svg>
  )
}
