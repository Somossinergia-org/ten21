import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ten21 - Gestion de Tienda",
  description: "Sistema de gestion para tiendas de muebles y electrodomesticos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
