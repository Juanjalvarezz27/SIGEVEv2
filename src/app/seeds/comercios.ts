import prisma from "@/src/lib/prisma";
import { PRODUCTOS_BODEGA_A, PRODUCTOS_TIENDA_B, METODOS_BODEGA_A, METODOS_TIENDA_B } from "./data";

export async function seedComercios() {
  console.log("Verificando Comercios de prueba...");

  // 1. Crear Bodega
  const comercioA = await prisma.comercio.upsert({
    where: { slug: "bodega-esquina" },
    update: {},
    create: {
      nombre: "Bodega La Esquina",
      slug: "bodega-esquina",
      activo: true,
    },
  });

  // Poblar datos SOLO si es un comercio nuevo (o si queremos forzarlo, aquí revisamos si tiene productos)
  const prodCountA = await prisma.producto.count({ where: { comercioId: comercioA.id } });
  
  if (prodCountA === 0) {
    console.log(` Poblando ${comercioA.nombre}...`);
    
    // Crear Métodos de Pago
    await prisma.metodosPago.createMany({
        data: METODOS_BODEGA_A.map(nombre => ({ nombre, comercioId: comercioA.id }))
    });

    // Crear Productos
    await prisma.producto.createMany({
        data: PRODUCTOS_BODEGA_A.map(p => ({ ...p, comercioId: comercioA.id }))
    });
  }


  // 2. Crear Ferreteria
  const comercioB = await prisma.comercio.upsert({
    where: { slug: "ferreteria-tuerca" },
    update: {},
    create: {
      nombre: "Ferretería El Tuerca",
      slug: "ferreteria-tuerca",
      activo: true,
    },
  });

  const prodCountB = await prisma.producto.count({ where: { comercioId: comercioB.id } });
  
  if (prodCountB === 0) {
    console.log(` Poblando ${comercioB.nombre}...`);
    
    await prisma.metodosPago.createMany({
        data: METODOS_TIENDA_B.map(nombre => ({ nombre, comercioId: comercioB.id }))
    });

    await prisma.producto.createMany({
        data: PRODUCTOS_TIENDA_B.map(p => ({ ...p, comercioId: comercioB.id }))
    });
  }

  console.log(" Comercios y sus datos listos");
}