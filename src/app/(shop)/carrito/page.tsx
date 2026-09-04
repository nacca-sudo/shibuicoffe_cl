import type { Metadata } from "next";
import CarritoClient from "@/components/shop/CarritoClient";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa los productos de tu carrito antes de finalizar la compra.",
};

export default function CarritoPage() {
  return (
    <>
      <h1 style={{ margin: "0 0 32px" }}>Tu carrito</h1>
      <CarritoClient />
    </>
  );
}
