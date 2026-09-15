"use client";

import { useState, useTransition } from "react";
import { App, Button } from "antd";
import { reintentarPago, simularPagoAprobado, simularPagoRechazado } from "@/app/actions/pedidos";

type Props = {
  orderId: string;
  estado: "PENDING_PAYMENT" | "PAYMENT_FAILED";
};

function SimuladorPagoInterior({ orderId, estado }: Props) {
  const { message } = App.useApp();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const pagoAprobado = () => {
    setError(null);
    iniciarTransicion(async () => {
      try {
        const resultado = await simularPagoAprobado(orderId);
        if (!resultado.ok) {
          setError(resultado.errores.join(" "));
        } else if (resultado.estado === "PAID") {
          message.success("Pago confirmado: pedido pagado y stock descontado.");
        } else if (resultado.estado === "PAID_STOCK_ISSUE") {
          message.warning("Pago recibido, pero no hay stock suficiente: quedó para gestión manual.");
        } else {
          message.info("El pedido ya había sido procesado.");
        }
      } catch {
        setError("La acción no se pudo completar. Revisa el estado del pedido.");
      }
    });
  };

  const pagoRechazado = () => {
    setError(null);
    iniciarTransicion(async () => {
      try {
        const resultado = await simularPagoRechazado(orderId);
        if (resultado.ok) {
          message.success("Pago simulado rechazado.");
        } else {
          setError(resultado.errores.join(" "));
        }
      } catch {
        setError("La acción no se pudo completar. Revisa el estado del pedido.");
      }
    });
  };

  const reintentar = () => {
    setError(null);
    iniciarTransicion(async () => {
      try {
        const resultado = await reintentarPago(orderId);
        if (resultado.ok) {
          message.success("Pedido listo para pagar de nuevo.");
        } else {
          setError(resultado.errores.join(" "));
        }
      } catch {
        setError("La acción no se pudo completar. Revisa el estado del pedido.");
      }
    });
  };

  return (
    <div className="simulador-pago">
      <p className="simulador-pago__nota">
        Solo entorno de desarrollo — en Fase 3 esto lo ejecuta el webhook de la pasarela.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {estado === "PENDING_PAYMENT" && (
          <>
            <Button type="primary" loading={pendiente} onClick={pagoAprobado}>
              Simular pago aprobado
            </Button>
            <Button danger loading={pendiente} onClick={pagoRechazado}>
              Simular pago rechazado
            </Button>
          </>
        )}
        {estado === "PAYMENT_FAILED" && (
          <Button type="primary" loading={pendiente} onClick={reintentar}>
            Reintentar pago
          </Button>
        )}
      </div>
      {error && <p className="simulador-pago__error">{error}</p>}
    </div>
  );
}

export default function SimuladorPago(props: Props) {
  return (
    <App>
      <SimuladorPagoInterior {...props} />
    </App>
  );
}
