// COMERCIO A: BODEGA / VÍVERES
// ==========================================
export const PRODUCTOS_BODEGA_A = [
    // Básicos
    { nombre: "HARINA PAN", precio: 1.5 },
    { nombre: "ARROZ MARY 1KG", precio: 1.2 },
    { nombre: "PASTA PRIMOR 1KG", precio: 1.8 },
    { nombre: "ACEITE VATEL 1L", precio: 3.5 },
    
    // Verduras (Por Peso)
    { nombre: "PAPA", precio: 1.8, porPeso: true },
    { nombre: "CEBOLLA", precio: 2.0, porPeso: true },
    { nombre: "TOMATE", precio: 2.5, porPeso: true },
    { nombre: "PLÁTANO", precio: 1.2, porPeso: true },
];

export const METODOS_BODEGA_A = ["Efectivo", "Pago Movil", "Biopago"];


// COMERCIO B: FERRETERÍA
// ==========================================
export const PRODUCTOS_TIENDA_B = [
    // Herramientas Manuales
    { nombre: "MARTILLO", precio: 8.5 },
    { nombre: "CINTA METRICA 5M", precio: 4.0 },
    { nombre: "DESTORNILLADOR PLANO", precio: 3.5 },

    // Materiales de Construcción (Por Peso/Granel)
    { nombre: "CLAVOS 1 PULG", precio: 3.0, porPeso: true },
    { nombre: "CLAVOS DE ACERO", precio: 5.0, porPeso: true },
    { nombre: "CEMENTO GRIS", precio: 10.0 },
];

export const METODOS_TIENDA_B = ["Zelle", "Efectivo", "Punto de Venta"];