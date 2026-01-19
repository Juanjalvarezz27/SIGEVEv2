import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      nombre: string;
      comercioId: string | null; 
      rol: string;
    };
  }

  interface User {
    id: string;
    comercioId: string | null;
    rol?: { nombre: string };
  }
}