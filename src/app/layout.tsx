import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SorykPass - La Puerta de Entrada al Presente",
  description: "Plataforma digital que funciona como una tarjeta de acceso inteligente o pase digital. Un sistema ágil, confiable y sin fricciones para eventos.",
  keywords: "sorykpass, eventos, tickets digitales, pase digital, acceso inteligente, chile",
  authors: [{ name: "SorykPass Team" }],
  creator: "SorykPass",
  publisher: "SorykPass",
  openGraph: {
    title: "SorykPass - La Puerta de Entrada al Presente",
    description: "Un sistema ágil, confiable y sin fricciones, donde el pase digital se vuelve parte natural del día a día.",
    url: "https://sorykpass.com",
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
    description: "Un sistema ágil, confiable y sin fricciones para eventos digitales.",
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
    // Añadir códigos de verificación cuando estén disponibles
    // google: "google-verification-code",
    // yandex: "yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
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
          className={`${montserrat.variable} font-montserrat antialiased`}
        >
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}