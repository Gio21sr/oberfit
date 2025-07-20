// middleware.ts
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` aumenta tu `Request` con el token del usuario.
  async function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token; // Accede al token del usuario desde la sesión

    // --- DEBUGGING: Logs para ver el flujo ---
    console.log(`[Middleware] Pathname: ${pathname}`);
    console.log(`[Middleware] Token: ${token ? 'Presente' : 'Ausente'}`);
    if (token) {
      console.log(`[Middleware] User Role (from token): ${token.role}`);
      console.log(`[Middleware] User ID (from token): ${token.id}`);
    }
    // --- FIN DEBUGGING ---

    // =======================================================
    // Lógica de Redirección para usuarios NO autenticados
    // =======================================================
    // Si NO hay token Y la ruta NO es /login Y la ruta NO es /acceso-denegado
    // Y la ruta NO es /visitante/* (porque visitante es público) Y la ruta NO es la raíz (/)
    if (!token && 
        !pathname.startsWith('/login') && 
        !pathname.startsWith('/acceso-denegado') &&
        !pathname.startsWith('/visitante') && // Las rutas de visitante son públicas
        pathname !== '/' // La página de inicio es pública
    ) {
      console.log(`[Middleware] -> Redirigiendo a /login (no autenticado a ruta protegida): ${pathname}`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // =======================================================
    // Lógica de Redirección para usuarios YA autenticados
    // =======================================================
    if (token) {
      const userRole = token.role as string; // El rol del usuario desde el token

      // Si el usuario autenticado intenta acceder a la página de login, redirigir a su dashboard
      if (pathname.startsWith('/login')) {
        console.log(`[Middleware] -> Usuario autenticado intentando ir a /login. Redirigiendo a /${userRole}`);
        if (userRole === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
        if (userRole === 'empleado') return NextResponse.redirect(new URL('/empleado', request.url));
        if (userRole === 'socio') return NextResponse.redirect(new URL('/socio', request.url));
        // Fallback si el rol no coincide con admin/empleado/socio
        return NextResponse.redirect(new URL('/', request.url)); 
      }

      // =======================================================
      // Lógica de Protección por Rol (Acceso Denegado)
      // =======================================================
      const protectedRoutes = {
        admin: ['/admin', '/admin/clases', '/admin/gestion-usuarios', '/admin/listado-asistentes', '/admin/registro-clases', '/admin/registro-usuarios'],
        empleado: ['/empleado', '/empleado/clases-disponibles', '/empleado/listado-asistentes', '/empleado/registro-clases'],
        socio: ['/socio', '/socio/clases-disponibles', '/socio/mis-clases'],
        // Las rutas de visitante son públicas y no necesitan autenticación (no se protegen aquí)
      };
      
      let isAuthorized = false; // Indica si el usuario está autorizado para la ruta actual

      // Recorrer las rutas protegidas por rol
      for (const roleKey of Object.keys(protectedRoutes)) {
        const routes = protectedRoutes[roleKey as keyof typeof protectedRoutes];
        for (const route of routes) {
          // Convertir el patrón de ruta a una RegExp para manejar sub-rutas (:path*)
          const pattern = new RegExp(`^${route.replace(/\/:path\*/g, '(?:/.*)?')}$`);
          
          if (pattern.test(pathname)) { // Si la ruta actual coincide con un patrón protegido
            // Lógica de permiso:
            // Admin puede acceder a admin, empleado, socio.
            // Empleado puede acceder a empleado, socio.
            // Socio solo puede acceder a socio.
            if (
              (roleKey === 'admin' && userRole === 'admin') ||
              (roleKey === 'empleado' && (userRole === 'empleado' || userRole === 'admin')) || 
              (roleKey === 'socio' && (userRole === 'socio' || userRole === 'admin' || userRole === 'empleado')) 
            ) {
              isAuthorized = true;
              break; // Salir del bucle interno si está autorizado
            } else {
              // Si no está autorizado para esta ruta específica
              console.warn(`[Middleware] -> Acceso Denegado. Usuario '${token.name}' (Rol: ${userRole}) intentó acceder a ${pathname} (requiere: ${roleKey})`);
              return NextResponse.redirect(new URL('/acceso-denegado', request.url));
            }
          }
        }
        if (isAuthorized) break; // Salir del bucle externo si ya está autorizado
      }
      
      // Si la ruta no es una de las protegidas por rol (ni admin, empleado, socio)
      // Y tampoco es una ruta de visitante (que son públicas)
      // Y no es la raíz
      if (!isAuthorized && !pathname.startsWith('/visitante') && pathname !== '/') {
          // Si no se ajusta a ningún patrón protegido, y no es una ruta de visitante o la raíz,
          // entonces es una ruta no manejada por la protección de roles.
          // Para ser estrictos y seguros:
          console.warn(`[Middleware] -> Acceso Denegado a ruta no explícitamente pública/protegida: ${pathname}`);
          return NextResponse.redirect(new URL('/acceso-denegado', request.url));
      }

      // Permitir el acceso a rutas de visitante si el usuario está logueado (pueden ver esas páginas públicas)
      if (token && pathname.startsWith('/visitante')) {
        return NextResponse.next();
      }
      
    } else { // No hay token (usuario no autenticado)
      // Permitir acceso a rutas de visitante o la página principal para no autenticados
      if (pathname.startsWith('/visitante') || pathname === '/') {
        return NextResponse.next();
      }
    }
    
    // Si no hay token y no es /login ni ruta pública, NextAuth.js lo redirigirá.
    console.log(`[Middleware] -> Acceso Permitido para ${pathname}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Este callback se ejecuta ANTES de la función `middleware` de arriba.
        // Sirve para determinar si hay una sesión activa (token presente).
        // Si devuelve 'false', NextAuth.js redirige automáticamente a `pages.signIn`.
        // Si devuelve 'true', la función `middleware` de arriba se ejecuta para la lógica de roles.
        return !!token; 
      },
    },
    pages: {
      signIn: "/login", // Página a la que NextAuth.js redirige si `authorized` es `false` para una ruta protegida.
    },
  }
);

// Configuración del matcher para especificar qué rutas deben pasar por el middleware.
// Solo las rutas que coincidan con estos patrones ejecutarán el middleware.
// Las rutas de la API de NextAuth.js ([...nextauth]) se excluyen automáticamente.
export const config = {
  matcher: [
    "/",                  // Coincide con la raíz para manejar redirecciones de "/" si autenticado
    "/admin/:path*",      // Protege /admin y todas sus sub-rutas
    "/empleado/:path*",   // Protege /empleado y todas sus sub-rutas
    "/socio/:path*",      // Protege /socio y todas sus sub-rutas
    "/login",             // Incluimos /login para manejar redirección si ya está autenticado
    "/acceso-denegado",   // Incluimos para que no se redirija infinitamente
    "/visitante/:path*",  // Incluye rutas de visitante (para que el middleware las vea y aplique reglas)
  ],
};