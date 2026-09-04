/**
 * Genera public/menu-shibui.pdf — placeholder del menú descargable de la landing.
 * Sin dependencias: escribe un PDF 1.4 de una página (A4) con fuentes base
 * (Helvetica / Helvetica-Bold, WinAnsiEncoding para los acentos).
 *
 * Uso: node scripts/generate-menu-pdf.mjs
 *
 * TODO: reemplazar por el PDF real del cliente cuando esté disponible
 * (basta sobrescribir public/menu-shibui.pdf, no hay que tocar código).
 */
import { writeFileSync } from "node:fs";

// Contenido placeholder — mismo criterio que la antigua carta estática
const CARTA = [
  {
    categoria: "Cafés de especialidad",
    items: [
      ["Espresso", "Doble shot de nuestro blend de la casa.", 2500],
      ["Cortado", "Espresso con un toque de leche texturizada.", 2800],
      ["Flat white", "Doble ristretto y microespuma sedosa.", 3500],
      ["Capuchino", "El clásico: espresso, leche y espuma en tercios.", 3500],
      ["Latte", "Suave y cremoso, con latte art de la casa.", 3800],
      ["Mocha", "Espresso, chocolate 70 % y leche texturizada.", 4000],
    ],
  },
  {
    categoria: "Métodos filtrados",
    items: [
      ["V60", "Filtrado limpio y brillante; café de origen a elección.", 4000],
      ["Chemex", "Taza dulce y cristalina, ideal para compartir.", 4500],
      ["Aeropress", "Cuerpo medio y dulzor concentrado.", 4000],
      ["Cold brew", "Infusión en frío por 18 horas. Servido con hielo.", 4200],
    ],
  },
  {
    categoria: "Para acompañar",
    items: [
      ["Croissant", "Mantequilla francesa, horneado cada mañana.", 2800],
      ["Kuchen de nuez", "Receta sureña, masa de mantequilla y nueces caramelizadas.", 3500],
      ["Cheesecake de maracuyá", "Cremoso, con coulis de maracuyá fresco.", 4200],
      ["Sándwich ave palta", "Pan de masa madre, pollo desmechado y palta.", 4800],
    ],
  },
];

const clp = (n) => "$" + n.toLocaleString("es-CL");
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const linea = (texto, fuente, tam, x, y, gris = 0) =>
  `${gris} g BT /${fuente} ${tam} Tf ${x} ${y} Td (${esc(texto)}) Tj ET`;

// ── Contenido de la página (A4: 595 x 842 pt) ──────────────────────────
const partes = [];
partes.push(linea("Shibui Coffee", "F1", 22, 60, 780, 0.15));
partes.push(linea("Menú de la cafetería — Santiago de Chile", "F2", 11, 60, 760, 0.35));
partes.push("0.75 g 60 744 475 1 re f");

let y = 716;
for (const grupo of CARTA) {
  partes.push(linea(grupo.categoria, "F1", 13, 60, y, 0.15));
  y -= 22;
  for (const [nombre, descripcion, precio] of grupo.items) {
    partes.push(linea(`${nombre} — ${descripcion}`.slice(0, 78), "F2", 10.5, 60, y, 0.1));
    partes.push(linea(clp(precio), "F2", 10.5, 490, y, 0.1));
    y -= 16;
  }
  y -= 14;
}
partes.push(linea("Precios en pesos chilenos (CLP), IVA incluido. Carta sujeta a disponibilidad del día.", "F2", 8.5, 60, 48, 0.4));

const contenido = partes.join("\n");

// ── Ensamblado del PDF con xref calculado ──────────────────────────────
let pdf = "%PDF-1.4\n";
const offsets = [0];
const obj = (n, cuerpo) => {
  offsets[n] = Buffer.byteLength(pdf, "latin1");
  pdf += `${n} 0 obj\n${cuerpo}\nendobj\n`;
};

obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>");
obj(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
obj(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
obj(6, `<< /Length ${Buffer.byteLength(contenido, "latin1")} >>\nstream\n${contenido}\nendstream`);

const xrefPos = Buffer.byteLength(pdf, "latin1");
pdf += "xref\n0 7\n0000000000 65535 f \n";
for (let n = 1; n <= 6; n++) {
  pdf += `${String(offsets[n]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

writeFileSync("public/menu-shibui.pdf", Buffer.from(pdf, "latin1"));
console.log(`OK: public/menu-shibui.pdf (${Buffer.byteLength(pdf, "latin1")} bytes)`);
