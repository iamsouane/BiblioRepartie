import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Geist, Source_Serif_4 } from "next/font/google"
import { SiteProvider } from "@/components/site-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "BiblioRépartie — Réseau des BU mutualisées UGB · UCAD · UADB",
  description:
    "Console de gestion des bibliothèques universitaires mutualisées : base de données répartie, fragmentation horizontale et transactions distribuées entre l'UGB, l'UCAD et l'UADB.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#1f4a3d",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`light ${geistSans.variable} ${sourceSerif.variable}`}>
      <body className="bg-background font-sans antialiased">
        <SiteProvider>{children}</SiteProvider>
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
