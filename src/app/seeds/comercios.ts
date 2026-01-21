import prisma from "@/src/lib/prisma";
import { 
    PRODUCTOS_BODEGA_A, 
    PRODUCTOS_TIENDA_B, 
    METODOS_BODEGA_A, 
    METODOS_TIENDA_B 
} from "./data";

export async function seedComercios() {
    console.log("Verificando Comercios y Datos...");

    const bodega = await prisma.comercio.upsert({
        where: { slug: "bodega-esquina" },
        update: {},
        create: {
            nombre: "Bodega La Esquina",
            slug: "bodega-esquina",
            activo: true,
        },
    });

    // Sincronizar Métodos de Pago Bodega
    await sincronizarMetodosPago(bodega.id, METODOS_BODEGA_A);
    // Sincronizar Productos Bodega
    await sincronizarProductos(bodega.id, PRODUCTOS_BODEGA_A);

    const ferreteria = await prisma.comercio.upsert({
        where: { slug: "ferreteria-tuerca" },
        update: {},
        create: {
            nombre: "Ferretería El Tuerca",
            slug: "ferreteria-tuerca",
            activo: true,
        },
    });

    // Sincronizar Métodos de Pago Ferretería
    await sincronizarMetodosPago(ferreteria.id, METODOS_TIENDA_B);
    // Sincronizar Productos Ferretería
    await sincronizarProductos(ferreteria.id, PRODUCTOS_TIENDA_B);

    console.log("Comercios sincronizados correctamente.");
}

async function sincronizarProductos(comercioId: string, listaProductos: any[]) {
    // 1. Obtener nombres de productos que YA existen en este comercio
    const productosExistentes = await prisma.producto.findMany({
        where: { comercioId },
        select: { nombre: true }
    });

    // Crear un Set para búsqueda rápida
    const nombresExistentes = new Set(productosExistentes.map(p => p.nombre.toLowerCase().trim()));

    // 2. Filtrar: Quedarse solo con los que NO están en la base de datos
    const nuevosProductos = listaProductos.filter(p => 
        !nombresExistentes.has(p.nombre.toLowerCase().trim())
    );

    // 3. Insertar solo los nuevos
    if (nuevosProductos.length > 0) {
        console.log(`   Agregando ${nuevosProductos.length} productos nuevos al comercio...`);
        await prisma.producto.createMany({
            data: nuevosProductos.map(p => ({
                ...p,
                comercioId
            }))
        });
    } else {
        console.log(`   Productos al día (${productosExistentes.length} encontrados).`);
    }
}

async function sincronizarMetodosPago(comercioId: string, listaMetodos: string[]) {
    // 1. Obtener métodos existentes
    const metodosExistentes = await prisma.metodosPago.findMany({
        where: { comercioId },
        select: { nombre: true }
    });

    const nombresExistentes = new Set(metodosExistentes.map(m => m.nombre.toLowerCase().trim()));

    // 2. Filtrar nuevos
    const nuevosMetodos = listaMetodos.filter(nombre => 
        !nombresExistentes.has(nombre.toLowerCase().trim())
    );

    // 3. Insertar nuevos
    if (nuevosMetodos.length > 0) {
        console.log(` Agregando ${nuevosMetodos.length} métodos de pago nuevos...`);
        await prisma.metodosPago.createMany({
            data: nuevosMetodos.map(nombre => ({
                nombre,
                comercioId
            }))
        });
    }
}