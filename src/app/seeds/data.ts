// COMERCIO A: BODEGA / VÍVERES
// ==========================================
export const PRODUCTOS_BODEGA_A = [
    // Básicos
    { nombre: "HARINA PAN", precio: 1.5 },
    { nombre: "ARROZ MARY 1KG", precio: 1.2 },
    { nombre: "PASTA PRIMOR 1KG", precio: 1.8 },
    { nombre: "ACEITE VATEL 1L", precio: 3.5 },
    { nombre: "MARGARINA MAVESA 500G", precio: 2.5 },
    { nombre: "AZÚCAR MONTALBAN", precio: 1.3 },
    { nombre: "SAL 1KG", precio: 0.8 },
    { nombre: "CAFÉ FAMA DE AMERICA 250G", precio: 3.0 },
    { nombre: "LECHE EN POLVO", precio: 8.0 },
    
    // Charcutería y Carnes (Por Peso)
    { nombre: "QUESO BLANCO", precio: 5.0, porPeso: true },
    { nombre: "QUESO AMARILLO", precio: 9.0, porPeso: true },
    { nombre: "JAMÓN DE ESPALDA", precio: 6.5, porPeso: true },
    { nombre: "MORTADELA TAPARA", precio: 4.5, porPeso: true },
    { nombre: "CARNE MOLIDA", precio: 6.5, porPeso: true },
    { nombre: "POLLO ENTERO", precio: 3.5, porPeso: true },
    { nombre: "CHULETA AHUMADA", precio: 7.5, porPeso: true },
    { nombre: "TOCINETA", precio: 12.0, porPeso: true },
    
    // Bebidas y Snacks
    { nombre: "REFRESCO 2L", precio: 2.0 },
    { nombre: "REFRESCO 1.5L", precio: 1.8 },
    { nombre: "MALTA POLAR", precio: 1.0 },
    { nombre: "AGUA MINERAL 5L", precio: 2.5 },
    { nombre: "JUGO DE NARANJA 1L", precio: 2.2 },
    { nombre: "GALLETAS MARIA", precio: 1.5 },
    { nombre: "PEPITO", precio: 0.8 },
    { nombre: "DORITOS", precio: 1.2 },
    { nombre: "OREO PAQUETE", precio: 1.5 },

    // Limpieza e Higiene
    { nombre: "JABÓN LAS LLAVES", precio: 1.5 },
    { nombre: "CLORO NEVEX", precio: 1.2 },
    { nombre: "DESINFECTANTE", precio: 1.5 },
    { nombre: "JABÓN EN POLVO 1KG", precio: 2.8 },
    { nombre: "PAPEL HIGIÉNICO 4 ROLLOS", precio: 3.0 },
    { nombre: "PASTA DENTAL", precio: 2.0 },
    { nombre: "JABÓN DE BAÑO", precio: 1.0 },
    { nombre: "CHAMPÚ", precio: 3.5 },

    // Verduras (Por Peso)
    { nombre: "PAPA", precio: 1.8, porPeso: true },
    { nombre: "CEBOLLA", precio: 2.0, porPeso: true },
    { nombre: "TOMATE", precio: 2.5, porPeso: true },
    { nombre: "PLÁTANO", precio: 1.2, porPeso: true },
    { nombre: "ZANAHORIA", precio: 1.5, porPeso: true },
    
    // Varios
    { nombre: "CARTÓN DE HUEVOS", precio: 5.0 },
    { nombre: "SARDINA EN LATA", precio: 1.0 },
    { nombre: "ATÚN EN LATA", precio: 2.2 }
];

export const METODOS_BODEGA_A = ["Efectivo", "Pago Movil", "Biopago"];


// COMERCIO B: FERRETERÍA
// ==========================================
export const PRODUCTOS_TIENDA_B = [
    // Herramientas Manuales
    { nombre: "MARTILLO", precio: 8.5 },
    { nombre: "CINTA METRICA 5M", precio: 4.0 },
    { nombre: "DESTORNILLADOR PLANO", precio: 3.5 },
    { nombre: "DESTORNILLADOR ESTRIA", precio: 3.5 },
    { nombre: "ALICATE UNIVERSAL", precio: 6.0 },
    { nombre: "ALICATE DE PRESIÓN", precio: 9.0 },
    { nombre: "LLAVE INGLESA 10 PULG", precio: 12.0 },
    { nombre: "SIERRA MANUAL", precio: 7.5 },
    { nombre: "NIVEL DE MANO", precio: 6.5 },
    { nombre: "ESPÁTULA 3 PULG", precio: 2.5 },

    // Materiales de Construcción (Por Peso/Granel)
    { nombre: "CLAVOS 1 PULG", precio: 3.0, porPeso: true },
    { nombre: "CLAVOS DE ACERO", precio: 5.0, porPeso: true },
    { nombre: "CEMENTO GRIS", precio: 10.0 },
    { nombre: "PEGO GRIS", precio: 5.0 },
    { nombre: "YESO", precio: 3.0, porPeso: true },
    { nombre: "ARENA LAVADA", precio: 2.0, porPeso: true },
    { nombre: "ALAMBRE DULCE", precio: 2.5, porPeso: true },

    // Electricidad
    { nombre: "BOMBILLO LED 9W", precio: 1.5 },
    { nombre: "BOMBILLO LED 12W", precio: 2.0 },
    { nombre: "SOCATE DE PORCELANA", precio: 1.0 },
    { nombre: "TOMACORRIENTE DOBLE", precio: 3.5 },
    { nombre: "INTERRUPTOR SENCILLO", precio: 2.5 },
    { nombre: "TEIPE ELÉCTRICO", precio: 1.5 },
    { nombre: "CABLE #12", precio: 1.0, porPeso: true }, 
    { nombre: "CABLE #10", precio: 1.5, porPeso: true },

    // Plomería
    { nombre: "TUBO PVC 1/2", precio: 4.0 },
    { nombre: "CODO PVC 1/2", precio: 0.5 },
    { nombre: "TEE PVC 1/2", precio: 0.6 },
    { nombre: "LLAVE DE ARRESTO", precio: 3.0 },
    { nombre: "CINTA TEFLÓN", precio: 0.8 },
    { nombre: "PEGA PARA TUBO", precio: 2.5 },

    // Pinturas y Acabados
    { nombre: "PINTURA CAUCHO BCO", precio: 25.0 },
    { nombre: "BROCHA 2 PULG", precio: 2.5 },
    { nombre: "RODILLO ANTIGOTA", precio: 4.0 },
    { nombre: "BANDEJA PARA PINTAR", precio: 2.0 },
    { nombre: "LIJA DE AGUA", precio: 0.5 },
    { nombre: "SILICONA TRANSPARENTE", precio: 3.5 },
    { nombre: "TIRRO DE PAPEL", precio: 1.8 },

    // Fijaciones
    { nombre: "TORNILLOS DRYWALL", precio: 4.0, porPeso: true },
    { nombre: "TORNILLOS MADERA", precio: 3.5, porPeso: true },
    { nombre: "RAMPLUG ROJO PAQ", precio: 1.0 },
    { nombre: "Maooooo", precio: 5.0 },
];

export const METODOS_TIENDA_B = ["Zelle", "Efectivo", "Punto de Venta"];