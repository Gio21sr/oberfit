// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters"; // Importar Adapter interface
import prisma from "@/lib/prisma"; // Tu instancia de Prisma
import bcrypt from 'bcryptjs'; // Para verificar contraseñas
// Importa los tipos directamente para usarlos en los callbacks
import { JWT } from "next-auth/jwt"; 
import { Session, User } from "next-auth"; 

// Extiende la interfaz de User de NextAuth.js para incluir el rol
declare module "next-auth" {
  interface User {
    role?: string | null; // Propiedad 'role' puede ser un string o null (según tu DB)
  }
  interface Session {
    user: {
      id: string; // ID del usuario 
      name?: string | null; // Nombre del usuario
      email?: string | null; // Email del usuario
      role?: string | null; // Rol del usuario
    };
  }
}

// Extiende la interfaz de JWT para incluir el ID y el rol
declare module "next-auth/jwt" {
  interface JWT {
    id?: string; // ID del usuario
    role?: string | null; // Rol del usuario (puede ser null)
  }
}

// Define la lógica de autenticación y sesión para NextAuth.js
export const authOptions = {
  // Conecta NextAuth.js con tu base de datos a través de Prisma
  adapter: PrismaAdapter(prisma) as Adapter, 
  
  // Define los proveedores de autenticación (aquí, solo credenciales de usuario/contraseña)
  providers: [
    CredentialsProvider({
      name: "Credentials", // Nombre del proveedor (visible en interfaz de NextAuth si la usaras)
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        // Este 'roleIntent' es para saber qué tipo de usuario (Admin, Empleado, Socio)
        // está intentando loguearse. Se pasará desde el frontend.
        roleIntent: { label: "Role Intent", type: "text" } 
      },
      // Función que NextAuth.js llama para verificar las credenciales
      async authorize(credentials) {
        if (!credentials) {
          return null; // Si no hay credenciales, no se puede autenticar
        }

        const username = credentials.username;
        const password = credentials.password;
        const roleIntent = credentials.roleIntent; // Rol que se intenta loguear

        // Buscamos directamente en la tabla 'usuarios' (modelo 'User')
        // Usamos findFirst para buscar por 'name' (nom_usuario)
        const userInUnifiedTable = await prisma.user.findFirst({ 
            where: { name: username } // 'name' es el campo 'nom_usuario' en tu DB
        });

        if (!userInUnifiedTable) {
            console.warn(`Intento de login fallido: Usuario '${username}' no encontrado en tabla 'usuarios'.`);
            return null; // Usuario no existe
        }

        const passwordMatch = await bcrypt.compare(password, userInUnifiedTable.password || ''); // Compara con el hash almacenado
        
        if (!passwordMatch) {
            console.warn(`Intento de login fallido para '${username}': Contraseña incorrecta.`);
            return null; // Contraseña incorrecta
        }

        // Opcional: Verificación adicional de rol para reforzar la seguridad
        // Si el rol en la DB no coincide con el rol que el usuario intentó loguear.
        // Esto es crucial para la seguridad basada en roles.
        if (userInUnifiedTable.role !== roleIntent) {
            console.warn(`Intento de login fallido para '${username}': Rol incorrecto ('${roleIntent}' vs '${userInUnifiedTable.role}').`);
            return null;
        }

        // Si las credenciales son válidas y el rol coincide, NextAuth.js necesita un objeto 'user'.
        // Este objeto User será el que se guarde en la sesión.
        // El 'id' debe ser el ID de la tabla 'usuarios' (User de NextAuth.js).
        return {
            id: userInUnifiedTable.id.toString(), // ID debe ser string para NextAuth.js
            name: userInUnifiedTable.name, // Nombre de usuario (nom_usuario)
            email: userInUnifiedTable.email, // Correo
            role: userInUnifiedTable.role, // Rol del usuario
        };
      },
    }),
  ],
  
  // Configuración de páginas de NextAuth.js
  pages: {
    signIn: "/login", // Redirige a /login si no está autenticado
  },
  
  // Estrategia de sesión: "jwt" es más escalable para Next.js Server Components y API Routes
  session: {
    strategy: "jwt" as const, // <-- ¡CORRECCIÓN AQUÍ!
    maxAge: 30 * 24 * 60 * 60, // 30 días de duración de la sesión
  },
  
  // Se necesita una clave secreta para firmar los tokens de sesión
  secret: process.env.NEXTAUTH_SECRET, 

  // Callbacks para añadir información extra (como el rol) al token JWT y a la sesión
  callbacks: {
    // Se ejecuta cuando se crea un JWT o se actualiza
    // TIPAR EXPLÍCITAMENTE 'token' y 'user' aquí para evitar errores de 'any'
    async jwt({ token, user, trigger, session }: { token: JWT; user?: User; trigger?: "signIn" | "signUp" | "update"; session?: Session; }) {
      if (user) { // user tendrá el tipo extendido 'User'
        token.id = user.id; // user.id ya es string gracias a la extensión
        token.role = user.role; // user.role ya es string | null gracias a la extensión
      }
      // Manejar el trigger "update" para actualizar el rol en el token si cambia en la sesión
      if (trigger === "update" && session && session.user) { // Asegura que session.user no sea null
        token.role = session.user.role;
        token.name = session.user.name;
        token.email = session.user.email;
      }
      return token;
    },
    // Se ejecuta cuando se crea una sesión
    // TIPAR EXPLÍCITAMENTE 'session' y 'token' aquí
    async session({ session, token }: { session: Session; token: JWT; }) {
      // Asegura que el ID y el rol estén disponibles en el objeto de sesión
      if (session.user) { // Asegura que session.user no es null
        session.user.id = token.id ?? ''; // Usa nullish coalescing si token.id puede ser undefined
        session.user.role = token.role;
      }
      return session;
    },
  },
};

// Crea el handler de NextAuth.js
const handler = NextAuth(authOptions);

// Exporta los handlers GET y POST
export { handler as GET, handler as POST };