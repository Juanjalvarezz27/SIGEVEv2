-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "porPeso" BOOLEAN,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "totalBs" DOUBLE PRECISION NOT NULL,
    "tasaBCV" DOUBLE PRECISION NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'America/Caracas'),
    "metodoPagoId" INTEGER NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaProducto" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "peso" TEXT,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "precioUnitarioBs" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VentaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetodosPago" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "MetodosPago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VentaProducto_ventaId_productoId_key" ON "VentaProducto"("ventaId", "productoId");

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "MetodosPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
