// /src/lib/fechas.ts
export function obtenerFechasVenezuela() {
  const ahora = new Date();
  
  // Convertir a hora de Venezuela
  const ahoraVenezuela = new Date(ahora.toLocaleString('en-US', {
    timeZone: 'America/Caracas'
  }));
  
  // Ajustar al día actual en Venezuela
  const inicioDia = new Date(ahoraVenezuela);
  inicioDia.setHours(0, 0, 0, 0);
  
  const finDia = new Date(ahoraVenezuela);
  finDia.setHours(23, 59, 59, 999);
  
  return { inicioDia, finDia, ahoraVenezuela };
}

export function ajustarFechaAVenezuela(fecha: Date): Date {
  return new Date(fecha.toLocaleString('en-US', {
    timeZone: 'America/Caracas'
  }));
}

export function formatearFechaVenezuela(fecha: Date): string {
  return fecha.toLocaleString('es-VE', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}