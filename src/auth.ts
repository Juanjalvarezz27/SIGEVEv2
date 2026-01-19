import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/prisma";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    // Metemos los datos del usuario al Token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.comercioId = user.comercioId;
        // @ts-ignore
        token.rol = user.rol?.nombre;
      }
      return token;
    },
    // Pasamos los datos del Token a la Sesión (lo que ves en el frontend)
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.comercioId = token.comercioId;
        // @ts-ignore
        session.user.rol = token.rol;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // Buscar usuario en DB
          const user = await prisma.usuario.findUnique({
            where: { email },
            include: { rol: true }
          });

          if (!user) return null;

          // Verificar contraseña
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
});