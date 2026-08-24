"use client";

import { MailOutlined, PhoneOutlined, InstagramOutlined } from "@ant-design/icons";

// Datos placeholder claramente editables
const EMAIL = "hola@shibuicafe.cl";
const TELEFONO = "+56 9 1234 5678";

export default function Contacto() {
  return (
    <section id="contacto" className="seccion seccion--alterna">
      <div className="contenedor" style={{ textAlign: "center" }}>
        <h2 className="seccion__titulo">Contacto</h2>
        <p className="seccion__subtitulo">
          Reservas, prensa o simplemente saludar.
        </p>
        <p style={{ fontSize: "1.1rem" }}>
          <MailOutlined style={{ marginRight: 8 }} />
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <span style={{ margin: "0 16px" }}>·</span>
          <PhoneOutlined style={{ marginRight: 8 }} />
          <a href={`tel:${TELEFONO.replace(/\s/g, "")}`}>{TELEFONO}</a>
          <span style={{ margin: "0 16px" }}>·</span>
          <InstagramOutlined style={{ marginRight: 8 }} />
          <a href="https://instagram.com/shibui_coffee" target="_blank" rel="noopener noreferrer">
            @shibui_coffee
          </a>
        </p>

      </div>
    </section>
  );
}
