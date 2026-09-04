"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, App, Button, Empty, Form, Input, Radio, Select, Spin } from "antd";
import { crearPedido, obtenerResumenCarrito } from "@/app/actions/pedidos";
import { useCarrito, useCarritoHidratado } from "@/lib/cart/store";
import { REGIONES } from "@/lib/data/regiones";
import { COSTO_ENVIO_CLP, formatCLP } from "@/lib/utils";
import type { ResumenCarrito } from "@/lib/pedidos";

type FormularioCheckout = {
  nombre: string;
  email: string;
  telefono: string;
  metodoEntrega: "PICKUP" | "SHIPPING";
  calle?: string;
  numero?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  notas?: string;
};

function CheckoutInterior() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm<FormularioCheckout>();
  const metodoEntrega = Form.useWatch("metodoEntrega", form) ?? "PICKUP";

  const items = useCarrito((estado) => estado.items);
  const limpiar = useCarrito((estado) => estado.limpiar);

  const hidratado = useCarritoHidratado();
  const itemsKey = JSON.stringify(items.map((i) => [i.variantId, i.quantity]));
  const [resumen, setResumen] = useState<{ key: string; datos: ResumenCarrito } | null>(null);
  const [erroresServidor, setErroresServidor] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  // Al hidratar (y ante cada cambio del carrito) revalidar precios y stock contra la DB
  useEffect(() => {
    if (!hidratado || items.length === 0) return;
    let cancelado = false;
    obtenerResumenCarrito(items.map(({ variantId, quantity }) => ({ variantId, quantity })))
      .then((datos) => {
        if (!cancelado) setResumen({ key: itemsKey, datos });
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [hidratado, items, itemsKey]);

  // true mientras el resumen no corresponde al contenido actual del carrito
  const cargandoResumen = items.length > 0 && resumen?.key !== itemsKey;
  const datosResumen = resumen?.key === itemsKey ? resumen.datos : null;

  if (!hidratado) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty description="Tu carrito está vacío" style={{ padding: "48px 0" }}>
        <Link href="/tienda">
          <Button type="primary" size="large">
            Ir a la tienda
          </Button>
        </Link>
      </Empty>
    );
  }

  const costoEnvio = metodoEntrega === "SHIPPING" ? COSTO_ENVIO_CLP : 0;
  const subtotal = datosResumen?.subtotal ?? 0;

  const confirmarPedido = async (valores: FormularioCheckout) => {
    setErroresServidor([]);
    setEnviando(true);
    try {
      const resultado = await crearPedido({
        nombre: valores.nombre,
        email: valores.email,
        telefono: valores.telefono,
        metodoEntrega: valores.metodoEntrega,
        direccion:
          valores.metodoEntrega === "SHIPPING"
            ? {
                calle: valores.calle ?? "",
                numero: valores.numero ?? "",
                comuna: valores.comuna ?? "",
                ciudad: valores.ciudad ?? "",
                region: valores.region ?? "",
                notas: valores.notas?.trim() ? valores.notas : undefined,
              }
            : undefined,
        items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      });

      if (resultado.ok) {
        limpiar();
        router.push(`/pedido/${resultado.orderId}`);
        return;
      }

      setErroresServidor(resultado.errores);
      // Refrescar el resumen: puede haber cambiado el stock real
      const r = await obtenerResumenCarrito(
        items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      );
      setResumen({ key: itemsKey, datos: r });
      message.error("No pudimos confirmar el pedido. Revisa los avisos.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="checkout-grid">
      <div>
        {erroresServidor.length > 0 && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            title="No pudimos confirmar tu pedido"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {erroresServidor.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            }
          />
        )}
        {datosResumen?.hayProblemas && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
            title="Algunos productos cambiaron su disponibilidad"
            description="Revisa el resumen: ajusta las cantidades o quita los productos sin stock antes de confirmar."
          />
        )}
        <Form
          form={form}
          layout="vertical"
          initialValues={{ metodoEntrega: "PICKUP" }}
          onFinish={confirmarPedido}
          requiredMark="optional"
        >
          <h2 style={{ fontSize: "1.4rem" }}>Tus datos</h2>
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: "Ingresa tu nombre" }, { min: 2, message: "Ingresa tu nombre" }]}
          >
            <Input placeholder="Ej.: Camila Rojas" autoComplete="name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Ingresa tu email" },
              { type: "email", message: "Ingresa un email válido" },
            ]}
          >
            <Input placeholder="tucorreo@ejemplo.cl" autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="telefono"
            label="Teléfono"
            rules={[{ required: true, message: "Ingresa tu teléfono" }, { min: 8, message: "Ingresa un teléfono válido" }]}
          >
            <Input placeholder="+56 9 1234 5678" autoComplete="tel" />
          </Form.Item>

          <h2 style={{ fontSize: "1.4rem" }}>Entrega</h2>
          <Form.Item name="metodoEntrega" label="Método de entrega">
            <Radio.Group
              options={[
                { value: "PICKUP", label: "Retiro en tienda (gratis)" },
                { value: "SHIPPING", label: `Envío a domicilio (+${formatCLP(COSTO_ENVIO_CLP)})` },
              ]}
            />
          </Form.Item>

          {metodoEntrega === "SHIPPING" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Form.Item
                  name="calle"
                  label="Calle"
                  rules={[{ required: true, message: "Ingresa la calle" }]}
                >
                  <Input placeholder="Ej.: Av. Italia" autoComplete="address-line1" />
                </Form.Item>
                <Form.Item
                  name="numero"
                  label="Número"
                  rules={[{ required: true, message: "Ingresa el número" }]}
                >
                  <Input placeholder="1234" autoComplete="address-line2" />
                </Form.Item>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Form.Item
                  name="comuna"
                  label="Comuna"
                  rules={[{ required: true, message: "Ingresa la comuna" }]}
                >
                  <Input placeholder="Ej.: Providencia" autoComplete="address-level3" />
                </Form.Item>
                <Form.Item
                  name="ciudad"
                  label="Ciudad"
                  rules={[{ required: true, message: "Ingresa la ciudad" }]}
                >
                  <Input placeholder="Ej.: Santiago" autoComplete="address-level2" />
                </Form.Item>
              </div>
              <Form.Item
                name="region"
                label="Región"
                rules={[{ required: true, message: "Selecciona la región" }]}
              >
                <Select
                  showSearch
                  placeholder="Selecciona la región"
                  options={REGIONES.map((region) => ({ value: region, label: region }))}
                />
              </Form.Item>
              <Form.Item name="notas" label="Notas para la entrega (opcional)">
                <Input.TextArea rows={2} placeholder="Depto, timbre, indicaciones…" maxLength={500} />
              </Form.Item>
            </>
          )}

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              block
              loading={enviando}
              disabled={cargandoResumen || datosResumen?.hayProblemas}
            >
              Confirmar pedido
            </Button>
          </Form.Item>
        </Form>
      </div>

      <aside className="carrito-resumen">
        <h2 style={{ marginTop: 0, fontSize: "1.4rem" }}>Tu pedido</h2>
        {cargandoResumen || !datosResumen ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <Spin />
          </div>
        ) : (
          <>
            {datosResumen.lineas.map((linea) => (
              <div key={linea.variantId} className="carrito-resumen__linea">
                <div>
                  <div className="carrito-item__nombre">{linea.productName}</div>
                  <div className="carrito-item__variante">
                    {linea.variantName} × {linea.quantity}
                  </div>
                  {(!linea.disponibleParaComprar || linea.stockDisponible < linea.quantity) && (
                    <div className="carrito-item__aviso">
                      {!linea.disponibleParaComprar
                        ? "Ya no está disponible"
                        : linea.stockDisponible === 0
                          ? "Sin stock"
                          : `Quedan ${linea.stockDisponible} unidades`}
                    </div>
                  )}
                </div>
                <span>{formatCLP(linea.subtotal)}</span>
              </div>
            ))}
            <div className="carrito-resumen__fila" style={{ marginTop: 16 }}>
              <span>Subtotal</span>
              <span>{formatCLP(subtotal)}</span>
            </div>
            <div className="carrito-resumen__fila">
              <span>Envío</span>
              <span>{costoEnvio === 0 ? "Gratis" : formatCLP(costoEnvio)}</span>
            </div>
            <div className="carrito-resumen__fila carrito-resumen__total">
              <span>Total</span>
              <span>{formatCLP(subtotal + costoEnvio)}</span>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export default function CheckoutClient() {
  return (
    <App>
      <CheckoutInterior />
    </App>
  );
}
