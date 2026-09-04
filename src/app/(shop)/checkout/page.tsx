import type { Metadata } from "next";
import CheckoutClient from "@/components/shop/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Completa tus datos y confirma tu pedido.",
};

export default function CheckoutPage() {
  return (
    <>
      <h1 style={{ margin: "0 0 32px" }}>Finalizar compra</h1>
      <CheckoutClient />
    </>
  );
}
