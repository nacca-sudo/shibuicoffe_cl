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
    default: "Shibui Café — Café de especialidad en Santiago",
    template: "%s | Shibui Café",
  },
  description:
    "Cafetería de especialidad en Santiago de Chile. Café de origen, métodos filtrados, pastelería y tienda online: granos, tazas, poleras y accesorios.",
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "Shibui Café",
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
                colorPrimary: "#6F4E37",
                colorBgLayout: "#FAF7F2",
                colorText: "#2B2622",
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
