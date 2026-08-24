import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shibui Coffee — Café de especialidad en Santiago",
    template: "%s | Shibui Coffee",
  },
  description:
    "Cafetería de especialidad en Santiago de Chile. Café de origen, métodos filtrados, pastelería y tienda online: granos, tazas, poleras y accesorios.",
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "Shibui Coffee",
    images: ["/img/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#495057",    /* Gris medio oscuro para botones primarios y enlaces */
                colorBgLayout: "#F8F9FA",   /* Gris muy claro para el fondo principal */
                colorText: "#212529",       /* Gris muy oscuro / negro suave para el texto */
                colorBorder: "#DEE2E6",     /* Gris claro para bordes de componentes */
                borderRadius: 8,
                fontFamily: "var(--font-inter), Arial, sans-serif",
              },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
