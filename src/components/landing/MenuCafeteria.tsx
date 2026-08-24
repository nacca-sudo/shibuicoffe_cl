import { MENU_CATEGORIAS, menuCafeteria } from "@/lib/data/menu";
import { formatCLP } from "@/lib/utils";

export default function MenuCafeteria() {
  return (
    <section id="menu" className="seccion">
      <div className="contenedor">
        <h2 className="seccion__titulo">Menú de la cafetería</h2>
        <p className="seccion__subtitulo">
          Lo que servimos todos los días en el local.
        </p>
        {MENU_CATEGORIAS.map((categoria) => (
          <div key={categoria} className="menu-grupo">
            <h3>{categoria}</h3>
            {menuCafeteria
              .filter((item) => item.categoria === categoria)
              .map((item) => (
                <div key={item.nombre} className="menu-item">
                  <div>
                    <span className="menu-item__nombre">{item.nombre}</span>
                    <p className="menu-item__descripcion">{item.descripcion}</p>
                  </div>
                  <span className="menu-item__precio">{formatCLP(item.precio)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
