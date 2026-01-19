import prisma from "@/src/lib/prisma";

export async function def() {
  try {
    console.log("Verificando si la base de datos necesita población...");

    // Verificar si ya hay datos
    const hayMetodosPago = await prisma.metodosPago.count();
    const hayProductos = await prisma.producto.count();

    if (hayMetodosPago > 0 && hayProductos > 0) {
      console.log("Base de datos ya poblada. Saltando...");
      console.log(`   • Métodos de pago: ${hayMetodosPago} registros`);
      console.log(`   • Productos: ${hayProductos} registros`);
      return;
    }

    console.log("Poblando base de datos...");

    // 1. Métodos de pago (solo si no existen)
    if (hayMetodosPago === 0) {
      console.log("Creando métodos de pago...");
      await prisma.metodosPago.createMany({
        data: [
          { nombre: "Efectivo" },
          { nombre: "Punto de Venta" },
          { nombre: "Biopago" },
          { nombre: "Pago Movil" },
          { nombre: "Transferencia" },
        ],
      });
      console.log("✅ Métodos de pago creados");
    }

    // 2. Productos alimenticios (solo si no existen)
    if (hayProductos === 0) {
      console.log("Creando productos...");
      await prisma.producto.createMany({
        data: [
          { nombre: "DORITOS P", precio: 1.11 },
          { nombre: "PEPITO  PEQUEÑO RISTRA", precio: 0.81 },
          { nombre: "CHISKESITOS P", precio: 0.74 },
          { nombre: "CHESITOS", precio: 0.24 },
          { nombre: "SUPERBOLI FARMILIAR", precio: 1.26 },
          { nombre: "CHICHARRON", precio: 1.40 },
          { nombre: "QUESITOS FAMILIAR", precio: 1.33 },
          { nombre: "GALLETA RELLENA INDEPENDENCIA", precio: 0.66 },
          { nombre: "GALLETA CHARMY CHOCOMOST", precio: 0.27 },
          { nombre: "BUONA MULTIPACK CHOCOLATE", precio: 0.35 },
          { nombre: "WAFER CREMADITAS DE FRESA Y VAINILLA", precio: 0.28 },
          { nombre: "SALRICA GALLETA SALADA", precio: 0.78 },
          { nombre: "WAFER RIKAS VAINILLA", precio: 0.19 },
          { nombre: "MARIA ROLLO PUIG", precio: 0.22 },
          { nombre: "OREO", precio: 0.55 },
          { nombre: "TAKY CHOCOLATE", precio: 0.09 },
          { nombre: "PALITO CHOCOLATE", precio: 0.55 },
          { nombre: "CLUB SOCIAL", precio: 0.33 },
          { nombre: "OREO TUBO", precio: 1.60 },
          { nombre: "CARAMELO DURO FRESA", precio: 0.04 },
          { nombre: "CARAMELO MASTICABLE TUTIFRUTI", precio: 0.04 },
          { nombre: "AGOGO CHICLE", precio: 0.22 },
          { nombre: "JELLY MINI GELATINA POTE", precio: 0.15 },
          { nombre: "SAMBA DE FRESA", precio: 1.07 },
          { nombre: "COCOSETTE MAXI", precio: 1.05 },
          { nombre: "MONEDA SABOR CHOCOLATE", precio: 0.18 },
          { nombre: "CHOCOGOL", precio: 0.15 },
          { nombre: "BAMBI DE GELATINA", precio: 0.15 },
          { nombre: "BOMBOMBUM SURTIDA", precio: 0.15 },
          { nombre: "NUTELLINI DISPLAY", precio: 0.33 },
          { nombre: "TRULULU AROS", precio: 0.11 },
          { nombre: "TRULULU GOMAS", precio: 1.09 },
          { nombre: "LOKINOS BARRA", precio: 0.09 },
          { nombre: "BIANCHI SNACK CHOCOLORES", precio: 1.11 },
          { nombre: "CHOCOLATE SAVOY", precio: 1.48 },
          { nombre: "TRIDENTN", precio: 0.63 },
          { nombre: "CARAMELO DE MENTA", precio: 0.03 },

          { nombre: "HARINA MARY LEUDANTE 900", precio: 1.6 },
          { nombre: "ARROZ MARY TRADICIONAL 900", precio: 1.95 },
          { nombre: "HARINA JUANA 900", precio: 1.25 },
          { nombre: "HARINA MIMASA BLANCA 900", precio: 1.1 },
          { nombre: "PASTA CAPRI CORTA 500", precio: 1.3 },
          { nombre: "PASTA MARY P CORTA 500", precio: 1.62 },
          { nombre: "AVENA PANTERA 200", precio: 1.05 },
          { nombre: "MAIZ DE COTUFA PANTERA 250", precio: 1.25 },
          { nombre: "ADOBO CHEPELCA 200", precio: 1.6 },
          { nombre: "SALSA TOMATE PAMPERO 198", precio: 1.65 },
          { nombre: "SALSA TOMATE PAMPERO 397", precio: 2.75 },
          { nombre: "SALSA TOMATE HEINZ 198", precio: 1.6 },
          { nombre: "CAFÉ DELLA NONNA 100", precio: 1.56 },
          { nombre: "CAFÉ AMANECER 100", precio: 1.56 },
          { nombre: "CAFÉ ADRIANI 200", precio: 2.2 },
          { nombre: "CAFÉ ADRIANI 100", precio: 1.2 },
          { nombre: "CAFÉ PROTECTORA 100", precio: 1.42 },
          { nombre: "CALDO DE POLLO 42", precio: 0.11 },
          { nombre: "MAIZINA AMERICA 90", precio: 0.8 },
          { nombre: "VAINILLA VANICOL 250", precio: 1 },
          { nombre: "CREMA DENTAL ALIDEN 100", precio: 1.43 },
          { nombre: "TOALHA ALIVE NOCHE 8", precio: 1.67 },
          { nombre: "TOALHA ALIVE 8", precio: 1.5 },
          { nombre: "LAVAPLATO CREMA HUGME 225", precio: 1.97 },
          { nombre: "LAVAPLATO CREMA AXION 150", precio: 1.35 },
          { nombre: "LAVAPLATO CREMA ZAGAZ 235", precio: 1.63 },
          { nombre: "JABON PALMOLIVE 85", precio: 1.02 },
          { nombre: "JABON ANITA 80", precio: 0.98 },
          { nombre: "JABON ARMONI 75", precio: 0.64 },
          { nombre: "ESPONJAS DE ALAMBRE ALICLEAN 1", precio: 0.45 },
          { nombre: "ESPONJAS DOBLE USO ETERNA 1", precio: 1.3 },
          { nombre: "JABON EN PASTA OSO BLANCO 135", precio: 1.15 },
          { nombre: "JABON LAS LLAVES FLOR 250", precio: 1.2 },
          { nombre: "JABON LLAVES FLOR 200", precio: 1 },
          { nombre: "JABON POPULAR 150", precio: 1.06 },
          { nombre: "JABON LAS LLAVES BB 160", precio: 0.99 },
          { nombre: "DETERGENTE ALIVE 1000", precio: 2.8 },
          { nombre: "DETERGENTE ALIVE 500", precio: 1.45 },
          { nombre: "DETERGENTE ALIVE 200", precio: 0.6 },
          { nombre: "PAÑALA BABY FINGER M 10", precio: 0.31 },
          { nombre: "PAÑALA BABY FINGER G 10", precio: 0.35 },
          { nombre: "COMPOTA TIGO 100", precio: 1.08 },
          { nombre: "HARINA MARY 900", precio: 1.35 },
          { nombre: "VELAS AMARICOLORE G 1", precio: 0.32 },
          { nombre: "VINAGRE VINGRIN 500", precio: 0.95 },
          { nombre: "MAYONESA ADD 445", precio: 3.35 },
          { nombre: "ARROZ MONICA 900", precio: 1.99 },
          { nombre: "HILO PABILO 3R", precio: 1.37 },
          { nombre: "HARINA KALY BLANCA 900", precio: 1.2 },
          { nombre: "HARINA DE TRIGO PAMPA LEUDANTE 920", precio: 1.25 },
          { nombre: "AZUCAR KRISTAL 900", precio: 1.7 },
          { nombre: "SAL RUBY 1000", precio: 0.25 },
          { nombre: "SAL ESMERALDA 1000", precio: 0.48 },
          { nombre: "HARINA TODO USO MARY 900", precio: 1.4 },
          { nombre: "PASTA MARY TRADICIONAL LARGA 500", precio: 1.23 },
          { nombre: "PASTA MARY TRADICIONAL LARGA 1000", precio: 2 },
          { nombre: "ACEITE LAPAMPA 500", precio: 2.1 },
          { nombre: "MANTEQUILLA NELLY 250", precio: 1.39 },
          { nombre: "MANTEQUILLA NELLY 500", precio: 2.7 },
          { nombre: "PAPEL CARICIAS 215H 1", precio: 0.32 },
          { nombre: "MAYONESA ADD 175", precio: 1.7 },
          { nombre: "PAPEL MAPLE 400H 4", precio: 2 },
          { nombre: "TOALLIN MAPLE 80H 1", precio: 1.73 },
          { nombre: "PEGALOCA 1", precio: 0.4 },
          { nombre: "REFRESCO THE SUN 400 30", precio: 0.4 },
          { nombre: "REFRESCO THE SUN 1L 12", precio: 0.7 },
          { nombre: "REFRESCO THE SUN 2L 12", precio: 1.05 },
          { nombre: "REFRESCO CHINOTO Y FRESCOLITA 1.5L 18", precio: 1.07 },
          { nombre: "REFRESCO COCA COLA 2L 12", precio: 1.8 },
          { nombre: "REFRESCO COCA COLA 1.5 6", precio: 1.4 },
          { nombre: "REFRESCO COCA COLA 1L 6", precio: 1.1 },
          { nombre: "REFRESCO FANTA DE NARANJA 1,5L 6", precio: 1.07 },
          { nombre: "LECHE DOBON 120", precio: 1.71 },
          { nombre: "SERVILLETAS CARICIAS GRANDES 6", precio: 1.5 },
          { nombre: "LECHE CONDENSADA CREMOR 325", precio: 2.31 },
          { nombre: "ATUN EN ACEITE BUBBA 140", precio: 2.18 },
          { nombre: "SARDINA PEÑERO 170", precio: 1.1 },
          { nombre: "SARDINA OMEGA 170", precio: 1.05 },
          { nombre: "MAYONESA MAVESA 445", precio: 4.2 },
          { nombre: "CHAMPU DE SOBRE HEAD AND SHOULDERS 18", precio: 0.65 },
          { nombre: "DESODORANDE LADY SP 9", precio: 0.85 },
          { nombre: "MAYONESA MAVESA 175", precio: 2.1 },
          { nombre: "YESQUERO 60", precio: 0.3 },
          { nombre: "PRESTOBARBAS DORCO 5 ", precio: 0.37 },
          { nombre: "ACEITE COPOSA 850L 850", precio: 3.9 },
          { nombre: "JUGO MANILO 250", precio: 0.7 },
          { nombre: "HUEVOS 12", precio: 6.6 },
          { nombre: "UNIDAD HUEVOS 1", precio: 0.21 },
          { nombre: "QUESO", precio: 6.6, porPeso: true },
          { nombre: "MARGARINA LA PAMPA 6", precio: 1.2 },
          { nombre: "HARINA PAN 1000", precio: 1.5 },
          { nombre: "MOSTAZA HEINZ 113", precio: 1.8 },
          { nombre: "COLGATE TRIPLE ACCION 60", precio: 1.6 },
          { nombre: "SUAVIZANTE ALIVE ", precio: 1 },
          { nombre: "SIAVITEL ", precio: 1.05 },
          { nombre: "PAN SOBADO ", precio: 1.3 }
        ],
      });
      console.log("✅ Productos creados");
    }

    console.log("Base de lista lista para usar");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}