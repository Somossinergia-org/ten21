import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { CursorGlow } from "@/components/effects/cursor-glow";
import { TopProgress } from "@/components/effects/top-progress";
import { FloatingAgent } from "@/components/agent/floating-agent";
import "./globals.css";

export const metadata: Metadata = {
  title: "TodoMueble - Control de Tienda",
  description: "Sistema de gestion para TodoMueble Guardamar",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#050a14",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TodoMueble",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <ToastProvider>
            <TopProgress />
            <CursorGlow />
            {children}
            <FloatingAgent />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
