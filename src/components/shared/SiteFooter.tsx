import Link from "next/link";

// Datos de contacto placeholder — actualizar con los datos reales del negocio
const CONTACTO = {
  direccion: "Av. Alameda Libertador Bernardo O'Higgins 333, Santiago",
  email: "hola@shibuicafe.cl",
  telefono: "+56 9 1234 5678",
};

const REDES = [
  { href: "https://instagram.com/shibui_coffee", label: "Instagram" },

];

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="contacto-footer">
      <div className="contenedor">
        <div className="site-footer__grid">
          <div>
            <h4>Shibui Coffee</h4>
            <p>
              Café de especialidad en Santiago de Chile. Tostamos, preparamos y
              compartimos café con calma, a la manera japonesa.
            </p>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>{CONTACTO.direccion}</li>
              <li>
                <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>
              </li>
              <li>
                <a href={`tel:${CONTACTO.telefono.replace(/\s/g, "")}`}>
                  {CONTACTO.telefono}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Síguenos</h4>
            <ul>
              {REDES.map((red) => (
                <li key={red.href}>
                  <a href={red.href} target="_blank" rel="noopener noreferrer">
                    {red.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/tienda">Tienda online</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="site-footer__legal">
          <span>© {new Date().getFullYear()} Shibui Coffee. Todos los derechos reservados.</span>
          <span>Santiago de Chile</span>
        </div>
      </div>
    </footer>
  );
}
