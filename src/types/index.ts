export interface UserData {
  nombre: string;
  email: string;
  rol: string;
  comercio: {
    nombre: string;
    activo: boolean;
  } | null;
}