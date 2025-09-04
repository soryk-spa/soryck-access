import type { Metadata } from "next";
import { Montserrat, Inter, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalLayout from "@/components/conditional-layout";
import { esMX } from "@clerk/localizations";
import { Toaster } from "sonner";


const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});


const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http:
  title: "SorykPass - La Puerta de Entrada al Presente",
  description:
    "Plataforma digital que funciona como una tarjeta de acceso inteligente o pase digital. Un sistema ágil, confiable y sin fricciones para eventos.",
  keywords:
    "sorykpass, eventos, tickets digitales, pase digital, acceso inteligente, chile",
  authors: [{ name: "SorykPass Team" }],
  creator: "SorykPass",
  publisher: "SorykPass",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "SorykPass - La Puerta de Entrada al Presente",
    description:
      "Un sistema ágil, confiable y sin fricciones, donde el pase digital se vuelve parte natural del día a día.",
    url: "https:
    siteName: "SorykPass",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SorykPass - Plataforma de Eventos Digital",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SorykPass - La Puerta de Entrada al Presente",
    description:
      "Un sistema ágil, confiable y sin fricciones para eventos digitales.",
    images: ["/og-image.jpg"],
    creator: "@sorykpass",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    
    
    
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esMX}>
      <html lang="es" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0053CC" />
          <meta name="msapplication-TileColor" content="#0053CC" />
        </head>
        <body
          className={`${montserrat.variable} ${inter.variable} ${roboto.variable} font-montserrat antialiased`}
        >
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster 
              position="top-center"
              richColors
              closeButton
              duration={4000}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}