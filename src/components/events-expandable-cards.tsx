"use client"

import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useOutsideClick } from "@/hooks/use-outside-click"

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

export function EventsExpandableCards({ events }: { events?: Event[] }) {
  
  const transformEventsToCards = (evts: Event[]) =>
    evts.map((e) => ({
      title: e.title,
      description: e.category.name,
      location: e.location,
      date: new Date(e.startDate).toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      }),
      time: new Date(e.startDate).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      src: e.imageUrl ?? "/sorykpass_1.jpg",
      ctaText: e.isFree ? "Gratis" : `$${e.price.toLocaleString()}`,
      ctaLink: `/events/${e.id}`,
      capacity: e.capacity,
      ticketsSold: e._count.tickets,
      organizer: `${e.organizer.firstName} ${e.organizer.lastName}`.trim(),
      content: () => (
        <div className="space-y-4">
          <p className="text-neutral-700 dark:text-neutral-300">
            {e.description || "Descripción del evento no disponible."}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">📅 Fecha:</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {new Date(e.startDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">⏰ Hora:</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {new Date(e.startDate).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">📍 Ubicación:</span>
                <span className="text-neutral-600 dark:text-neutral-400">{e.location}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">💰 Precio:</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {e.isFree ? "Gratis" : `$${e.price.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">👥 Capacidad:</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {e._count.tickets}/{e.capacity} entradas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">🏷️ Categoría:</span>
                <span className="text-neutral-600 dark:text-neutral-400">{e.category.name}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">👤 Organizador:</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {`${e.organizer.firstName} ${e.organizer.lastName}`.trim() || e.organizer.email}
              </span>
            </div>
          </div>
        </div>
      ),
    }))

  
  const cards: CardItem[] = events && events.length > 0 ? transformEventsToCards(events) : []

  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  )
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
    } else {
      document.body.style.overflow = "auto"
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active])

  useOutsideClick(ref, () => setActive(null))

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <Image
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-base mb-2"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-sm"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      
      {}
      {cards.length > 0 ? (
        <ul className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4">
          {cards.map((card: CardItem) => (
            <motion.div
              layoutId={`card-${card.title}-${id}`}
              key={card.title}
              onClick={() => setActive(card)}
              className="p-4 flex flex-col  hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
            >
              <div className="flex gap-4 flex-col  w-full">
                <motion.div layoutId={`image-${card.title}-${id}`}>
                  <Image
                    width={400}
                    height={240}
                    src={card.src}
                    alt={card.title}
                    className="h-60 w-full  rounded-lg object-cover object-top"
                  />
                </motion.div>
                <div className="flex justify-center items-center flex-col">
                  <motion.h3
                    layoutId={`title-${card.title}-${id}`}
                    className="font-medium text-neutral-800 dark:text-neutral-200 text-center text-base mb-1"
                  >
                    {card.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${card.description}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400 text-center text-sm mb-2"
                  >
                    {card.description}
                  </motion.p>
                  
                  {}
                  {card.date && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <span>📅 {card.date}</span>
                        {card.time && <span>• ⏰ {card.time}</span>}
                      </div>
                      {card.location && (
                        <div className="flex items-center justify-center gap-1">
                          <span>📍 {card.location}</span>
                        </div>
                      )}
                      {card.ticketsSold !== undefined && card.capacity && (
                        <div className="flex items-center justify-center gap-1">
                          <span>🎫 {card.ticketsSold}/{card.capacity}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </ul>
      ) : (
        <div className="max-w-2xl mx-auto w-full text-center py-12">
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-8">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-medium text-neutral-800 dark:text-neutral-200 mb-2">
              No hay eventos disponibles
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Aún no se han creado eventos en la plataforma. ¡Sé el primero en crear uno!
            </p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              ✨ Crear evento
            </Link>
          </div>
        </div>
      )}
    </>
  )
}export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  )
}

type CardItem = {
  title: string
  description: string
  src: string
  ctaText: string
  ctaLink: string
  content: string | (() => React.ReactNode)
  location?: string
  date?: string
  time?: string
  capacity?: number
  ticketsSold?: number
  organizer?: string
}



