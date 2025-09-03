"use client"
import Image from "next/image"
import React, { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useOutsideClick } from "@/hooks/use-outside-click"

export function ExpandableCardDemo() {
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm h-full w-full z-10"
            onClick={() => setActive(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && typeof active === "object" && (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4">
            <motion.button
              key={`button-${active.title}-${id}`}
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
                  src={active.src}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
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

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    {active.ctaText}
                  </motion.a>
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
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ul className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex gap-4">
              <motion.div
                layoutId={`image-${card.title}-${id}`}
                className="flex-shrink-0"
              >
                <Image
                  width={100}
                  height={100}
                  src={card.src}
                  alt={card.title}
                  className="h-20 w-20 rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-left mb-1"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-left text-sm"
                >
                  {card.description}
                </motion.p>
              </div>
            </div>
            <motion.button
              layoutId={`button-${card.title}-${id}`}
              className="mt-4 px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black transition-all duration-300 self-start"
            >
              {card.ctaText}
            </motion.button>
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

const cards = [
  {
    description: "Lana Del Rey",
    title: "Summertime Sadness",
    src: "https://assets.aceternity.com/demos/lana-del-rey.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Lana Del Rey, an iconic American singer-songwriter, is celebrated for
          her melancholic and cinematic music style. Born Elizabeth Woolridge
          Grant in New York City, she has captivated audiences worldwide with
          her haunting voice and introspective lyrics. <br /> <br /> Her songs
          often explore themes of tragic romance, glamour, and melancholia,
          drawing inspiration from both contemporary and vintage pop culture.
          With a career that has seen numerous critically acclaimed albums, Lana
          Del Rey has established herself as a unique voice in the music
          industry, earning a dedicated fan base and cementing her status as a
          modern icon.
        </p>
      )
    },
  },
  {
    description: "Babbu Maan",
    title: "Mitran Di Chhatri",
    src: "https://assets.aceternity.com/demos/babbu-maan.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Babu Maan, a legendary Punjabi singer, is renowned for his soulful
          voice and profound lyrics that resonate deeply with his audience. Born
          in the village of Khant Maanpur in Punjab, India, he has become a
          cultural icon in the Punjabi music industry. <br /> <br /> His songs
          often reflect the struggles and triumphs of everyday life, capturing
          the essence of Punjabi culture and traditions. With a career spanning
          over two decades, Babu Maan has released numerous hit albums and
          singles that have garnered him a massive fan following both in India
          and abroad.
        </p>
      )
    },
  },

  {
    description: "Metallica",
    title: "For Whom The Bell Tolls",
    src: "https://assets.aceternity.com/demos/metallica.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Metallica, an iconic American heavy metal band, is renowned for their
          powerful, fast-paced music and intense live performances that resonate
          deeply with their audience. Formed in Los Angeles, California, they
          have become a cultural icon in the heavy metal music industry. <br />
          <br /> Their songs often reflect themes of aggression, social issues,
          and personal struggles, capturing the essence of heavy metal culture
          and traditions. With a career spanning over four decades, Metallica
          has released numerous hit albums and singles that have garnered them a
          massive fan following both in the United States and abroad.
        </p>
      )
    },
  },
  {
    description: "Led Zeppelin",
    title: "Stairway To Heaven",
    src: "https://assets.aceternity.com/demos/led-zeppelin.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          Led Zeppelin, a legendary British rock band, is renowned for their
          innovative and powerful music that has influenced countless musicians
          and captivated audiences for decades. Formed in London in 1968, they
          have become a cultural icon in the rock music industry. <br /> <br />
          Their songs often feature complex musical arrangements, mystical
          lyrics, and powerful guitar riffs, capturing the essence of rock and
          blues traditions. With a career that produced timeless classics like
          &quot;Stairway to Heaven&quot; and &quot;Whole Lotta Love,&quot; Led
          Zeppelin has left an indelible mark on the music world, earning them a
          place in the Rock and Roll Hall of Fame and a massive global fan
          following.
        </p>
      )
    },
  },
  {
    description: "Mustafa Zahid",
    title: "Toh Phir Aao",
    src: "https://assets.aceternity.com/demos/toh-phir-aao.jpeg",
    ctaText: "Play",
    ctaLink: "https://ui.aceternity.com/templates",
    content: () => {
      return (
        <p>
          &quot;Toh Phir Aao&quot; by Mustafa Zahid is a beautiful and
          emotionally resonant song that touches the hearts of listeners with
          its soulful melody and heartfelt lyrics. Mustafa Zahid, a renowned
          Pakistani singer and songwriter, is known for his powerful vocal
          delivery and ability to convey deep emotions through his music. <br />
          <br /> The song, with its poignant lyrics and captivating tune, has
          garnered significant attention and praise from music lovers across the
          subcontinent. Mustafa Zahid&apos;s ability to blend traditional and
          contemporary musical elements has made him a respected figure in the
          music industry, and &quot;Toh Phir Aao&quot; is a testament to his
          artistic prowess and emotional depth.
        </p>
      )
    },
  },
]
