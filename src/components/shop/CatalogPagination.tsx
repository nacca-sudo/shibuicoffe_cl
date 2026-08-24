"use client";

import { useRouter } from "next/navigation";
import { Pagination } from "antd";

type Props = {
  total: number;
  pagina: number;
  pageSize: number;
  /** Filtros actuales, para preservarlos al cambiar de página */
  query: Record<string, string>;
};

export default function CatalogPagination({ total, pagina, pageSize, query }: Props) {
  const router = useRouter();

  const irAPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams(query);
    if (nuevaPagina > 1) {
      params.set("pagina", String(nuevaPagina));
    } else {
      params.delete("pagina");
    }
    const qs = params.toString();
    router.push(qs ? `/tienda?${qs}` : "/tienda");
  };

  if (total <= pageSize) return null;

  return (
    <div className="catalogo-paginacion">
      <Pagination
        current={pagina}
        total={total}
        pageSize={pageSize}
        onChange={irAPagina}
        showSizeChanger={false}
      />
    </div>
  );
}
