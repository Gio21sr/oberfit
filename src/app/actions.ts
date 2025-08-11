// src/app/actions.ts
"use server";

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { Prisma, PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ErrorWithMessage extends Error {
  message: string;
}

interface ErrorWithCode extends Error {
  code: string;
  meta?: {
    target?: string | string[];
  };
}

interface ErrorWithRedirect extends Error {
  message: 'NEXT_REDIRECT';
}


// ✅ INICIO DE LA SOLUCIÓN: Agrega estas funciones
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

function isErrorWithRedirect(error: unknown): error is ErrorWithRedirect {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    (error as any).message === 'NEXT_REDIRECT'
  );
}
// Añade esta interfaz con las demás interfaces
interface User {
  id: number;
  name: string | null;
  fullName: string | null;
  email: string | null;
  password: string | null;
  role: string | null;
  es_socio: boolean | null;
  clases_restantes: number | null;
  last_reset_month: Date | null;
}

interface VisitorInscriptionData {
  id: number;
  nombre: string;
  correo: string;
  claseNombre: string;
  claseFechaHora: Date;
  codigo: number;
  metodoPago: string;
  detallesPago: {
    banco: string;
    cuenta: string;
    clabe: string;
    beneficiario: string;
  } | null;
}

interface FullUserData {
  id: number;
  username: string | null;
  fullName: string | null;
  email: string | null;
  role: string | null;
  es_socio: boolean | null;
  clases_restantes: number | null;
}

interface UserFormData {
  id: number;
  username: string;
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: 'empleado' | 'socio';
  clases_restantes?: string;
}

interface UserData {
  id_usuario: number;
  nom_usuario: string | null; // Puede ser null
  clases_restantes: number | null;
}

/**
 * Registra un nuevo usuario (socio) en la base de datos `usuarios` (modelo `User`).
 * @param formData Objeto FormData con 'username', 'fullName', 'email', 'password', y 'confirmPassword'.
 * @returns Un objeto con `success: boolean` y un `message: string`
 */

export async function registerUser(formData: FormData) {
  const username = formData.get('username') as string;
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Modificación: Retorna un objeto en lugar de lanzar un error para validaciones iniciales.
  if (!username || !fullName || !email || !password || !confirmPassword) {
    return { success: false, message: "Todos los campos son requeridos." };
  }
  if (password !== confirmPassword) {
    return { success: false, message: "Las contraseñas no coinciden." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.name === username) {
        // Modificación: Retorna un objeto en lugar de lanzar un error.
        return { success: false, message: 'El nombre de usuario ya existe.' };
      }
      if (existingUser.email === email) {
        // Modificación: Retorna un objeto en lugar de lanzar un error.
        return { success: false, message: 'El correo electrónico ya existe.' };
      }
    }

    const newUser = await prisma.user.create({
      data: {
        name: username,
        fullName: fullName,
        email: email,
        password: hashedPassword,
        role: "socio",
        es_socio: true,
        clases_restantes: 8,
        last_reset_month: new Date(),
      },
    });

    console.log('Socio registrado en DB (tabla usuarios/User):', newUser);

    return { success: true, message: `¡Bienvenido, ${newUser.fullName}! Tu cuenta ha sido creada.` };

  } catch (error: unknown) {
    // Si es un error de redirección, lo lanzamos.
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    
    // Modificación: Retorna un objeto en lugar de lanzar un error para errores de Prisma.
    if (isErrorWithCode(error) && error.code === 'P2002') {
      const target = (error.meta?.target) ? (Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target) : 'campo desconocido';
      return { success: false, message: `Ya existe un usuario con este ${target}.` };
    }
    
    // Modificación: Retorna un objeto para cualquier otro error.
    console.error('Error al registrar socio:', error);
    return { success: false, message: isErrorWithMessage(error) ? error.message : 'Error al registrar el socio. Inténtalo de nuevo.' };
  }
}

/**
 * Registra una nueva clase en la base de datos `clases`.
 * @param formData Objeto FormData con 'className', 'description', 'dateTime', 'capacity'.
 * @returns Un objeto que indica el éxito o fracaso de la operación y un mensaje.
 */
export async function registerClass(formData: FormData) {
  const name = formData.get('className') as string;
  const description = formData.get('description') as string;
  const dateTimeString = formData.get('dateTime') as string;
  const capacityString = formData.get('capacity') as string;

  // Modificación: Se retorna un objeto en lugar de lanzar Error
  if (!name || !description || !dateTimeString || !capacityString) {
    return { success: false, message: "Todos los campos son obligatorios." };
  }
  if (name.length > 100) {
    return { success: false, message: "El nombre de la clase no puede exceder 100 caracteres." };
  }

  // Procesamiento de fecha (viene en UTC desde el frontend)
  const fechaHora = new Date(dateTimeString);
  if (isNaN(fechaHora.getTime())) {
    return { success: false, message: "Formato de fecha y hora inválido." };
  }

  const capacity = parseInt(capacityString, 10);
  if (isNaN(capacity) || capacity < 1) {
    return { success: false, message: "El cupo debe ser un número válido mayor a 0." };
  }

  // Validación de fecha/hora (convertir a CDMX)
  const cdmxOffset = -6 * 60 * 60 * 1000; // UTC-6
  const fechaHoraCDMX = new Date(fechaHora.getTime() + cdmxOffset);
  const nowCDMX = new Date(Date.now() + cdmxOffset);

  if (fechaHoraCDMX < nowCDMX) {
    return { success: false, message: "No se pueden registrar clases en fechas pasadas." };
  }

  const dayOfWeek = fechaHoraCDMX.getDay();
  const classHours = fechaHoraCDMX.getHours();
  const classMinutes = fechaHoraCDMX.getMinutes();

  if (classMinutes !== 0) {
    return { success: false, message: "La hora de inicio debe ser en punto (ej. 10:00)." };
  }

  // Validación de horario del gimnasio (CDMX)
  let isScheduleValid = false;
  switch (dayOfWeek) {
    case 1: case 2: case 3: case 4: // Lunes a Jueves
      isScheduleValid = classHours >= 6 && classHours < 22;
      break;
    case 5: // Viernes
      isScheduleValid = classHours >= 6 && classHours < 21;
      break;
    case 6: // Sábado
      isScheduleValid = classHours >= 6 && classHours < 14;
      break;
    case 0: // Domingo
      isScheduleValid = classHours >= 7 && classHours < 14;
      break;
    default:
      isScheduleValid = false;
  }

  if (!isScheduleValid) {
    return { success: false, message: "El horario seleccionado no está dentro del horario de operación del gimnasio." };
  }

  const existingClass = await prisma.clase.findFirst({
    where: {
      fecha_hora: fechaHora,
    },
  });

  if (existingClass) {
    return { success: false, message: "Ya existe una clase programada para esta fecha y hora. Por favor, selecciona otro horario." };
  }

  try {
    const newClass = await prisma.clase.create({
      data: {
        nombre_clase: name,
        descripcion: description,
        fecha_hora: fechaHora, // Se guarda en UTC
        cupo: capacity,
        capacidad_maxima: capacity,
      },
    });

    console.log('Clase registrada exitosamente:', newClass);
    return { success: true, message: "Clase registrada con éxito." };

  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    
    if (isErrorWithCode(error)) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (Array.isArray(target) && target.includes('nombre_clase')) {
          return { success: false, message: "Ya existe una clase con este nombre." };
        }
        return { success: false, message: "Error de duplicado en la base de datos." };
      }
      if (error.code === 'P2025') {
        return { success: false, message: "Operación rechazada por validación de base de datos." };
      }
    }

    return {
      success: false,
      message: isErrorWithMessage(error) ? error.message : "Error desconocido al registrar la clase. Por favor intente nuevamente."
    };
  }
}


/**
 * 💡 CORREGIDO: Ahora devuelve un objeto con las propiedades `success` y `classes`.
 * Obtiene todas las clases de la base de datos.
 * @returns Un objeto que indica el éxito o fracaso y un array de clases.
 */
export async function getClasses() {
  try {
    const classes = await prisma.clase.findMany({
      orderBy: {
        fecha_hora: 'asc',
      }
    });
    console.log('Clases obtenidas de DB:', classes);
    // ✅ Devuelve un objeto con la propiedad 'success' y los datos
    return { success: true, classes, message: 'Clases cargadas correctamente.' };
  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error al obtener clases de DB:', error);
    // ✅ Devuelve un objeto de error que el frontend puede manejar
    return { success: false, message: 'Error al obtener las clases. Inténtalo de nuevo.' };
  }
}

/**
 * Actualiza los detalles de una clase existente en la base de datos.
 * @param formData Objeto FormData con id_clase, name, description, dateTime, capacity, capacidadMaxima.
 * @returns El objeto de la clase actualizada.
 * @throws Error si los datos son inválidos o hay un problema en la DB.
 */
export async function updateClass(formData: FormData) {
  const id_clase = parseInt(formData.get('id_clase') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const dateTimeString = formData.get('dateTime') as string;
  const newCapacity = parseInt(formData.get('capacity') as string);
  const newCapacidadMaxima = parseInt(formData.get('capacidadMaxima') as string);

  // Validaciones básicas
  if (isNaN(id_clase) || !name || !description || !dateTimeString || 
      isNaN(newCapacity) || newCapacity < 0 || 
      isNaN(newCapacidadMaxima) || newCapacidadMaxima < 1) {
    throw new Error("Todos los campos son requeridos y deben ser válidos.");
  }

  if (newCapacity > newCapacidadMaxima) {
    throw new Error("El cupo disponible no puede ser mayor que la capacidad máxima.");
  }

  // Procesamiento de fecha (UTC)
  const fechaHora = new Date(dateTimeString);
  if (isNaN(fechaHora.getTime())) {
    throw new Error("Formato de fecha y hora inválido.");
  }

  // Validación de fecha/hora (convertir a CDMX)
  const cdmxOffset = -6 * 60 * 60 * 1000; // UTC-6
  const fechaHoraCDMX = new Date(fechaHora.getTime() + cdmxOffset);
  const nowCDMX = new Date(Date.now() + cdmxOffset);

  if (fechaHoraCDMX < nowCDMX) {
    throw new Error("No se pueden programar clases en fechas pasadas.");
  }

  const dayOfWeek = fechaHoraCDMX.getDay();
  const classHours = fechaHoraCDMX.getHours();
  const classMinutes = fechaHoraCDMX.getMinutes();

  if (classMinutes !== 0) {
    throw new Error("La hora de inicio debe ser en punto (ej. 10:00).");
  }

  // Validación de horario del gimnasio (CDMX)
  let isScheduleValid = false;
  switch (dayOfWeek) {
    case 1: case 2: case 3: case 4: // Lunes a Jueves
      isScheduleValid = classHours >= 6 && classHours < 22;
      break;
    case 5: // Viernes
      isScheduleValid = classHours >= 6 && classHours < 21;
      break;
    case 6: // Sábado
      isScheduleValid = classHours >= 6 && classHours < 14;
      break;
    case 0: // Domingo
      isScheduleValid = classHours >= 7 && classHours < 14;
      break;
    default:
      isScheduleValid = false;
  }

  if (!isScheduleValid) {
    throw new Error("El horario seleccionado no está dentro del horario de operación del gimnasio.");
  }

  try {
    const updatedClass = await prisma.clase.update({
      where: { id_clase },
      data: {
        nombre_clase: name,
        descripcion: description,
        fecha_hora: fechaHora, // Se guarda en UTC
        cupo: newCapacity,
        capacidad_maxima: newCapacidadMaxima,
      },
    });

    console.log('Clase actualizada exitosamente:', updatedClass);
    return updatedClass;

  } catch (error: unknown) {
    console.error('Error al actualizar clase:', error);
    
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case 'P2025':
          throw new Error("La clase que intentas actualizar no existe.");
        case 'P2002':
          throw new Error("Ya existe una clase con este nombre.");
        case 'P2003':
          throw new Error("No se puede actualizar debido a restricciones de base de datos.");
        default:
          throw new Error("Error de base de datos al actualizar la clase.");
      }
    }

    throw new Error(
      isErrorWithMessage(error)
        ? error.message
        : "Error desconocido al actualizar la clase. Por favor intente nuevamente."
    );
  }
}

/**
 * Elimina una clase de la base de datos de forma definitiva.
 * Elimina primero todas las inscripciones asociadas y luego la clase,
 * sin importar si es una clase futura o pasada.
 * @param formData Objeto FormData que contiene 'id_clase'.
 * @returns El objeto de la clase eliminada.
 * @throws Error si hay un problema al eliminar la clase.
 */
export async function deleteClass(formData: FormData) {
  const id_clase = parseInt(formData.get('id_clase') as string);

  if (isNaN(id_clase)) {
    throw new Error("ID de clase inválido para eliminar.");
  }

  try {
    const clase = await prisma.clase.findUnique({
      where: { id_clase: id_clase },
      select: {
        fecha_hora: true
      }
    });

    if (!clase) {
      throw new Error("La clase a eliminar no existe.");
    }
    
    console.log(`Eliminando clase ID ${id_clase} y todas sus inscripciones, sin importar la fecha.`);
    
    // Usa una transacción para asegurar que todo se complete o nada se haga
    const transactionResult = await prisma.$transaction([
      prisma.inscripcion.deleteMany({
        where: { id_clase: id_clase },
      }),
      prisma.inscripcionVisitante.deleteMany({
        where: { id_clase: id_clase },
      }),
      prisma.clase.delete({
        where: { id_clase: id_clase },
      }),
    ]);
    
    console.log('Clase y todas sus inscripciones eliminadas de DB:', transactionResult);
    
    // Retorna la clase eliminada (que es el tercer elemento de la transacción)
    return transactionResult[2];

  } catch (error: unknown) {
    // Manejo de errores simplificado, ya que P2003 ya no es posible.
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    // Manejo del error de registro no encontrado P2025
    if (isErrorWithCode(error) && error.code === 'P2025') {
      throw new Error('La clase a eliminar no existe.');
    }
    console.error('Error al eliminar clase de DB:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al eliminar la clase. Inténtalo de nuevo.');
  }
}


/**
 * Registra un nuevo usuario (Empleado o Socio) en la tabla 'usuarios' (modelo 'User').
 * Esta función es llamada por el Administrador.
 * @param formData Objeto FormData con 'username', 'fullName', 'email', 'password', 'confirmPassword', 'role'.
 * @returns Un objeto con {success: boolean, message: string, user?: User}
 */
export async function registerUserByAdmin(formData: FormData): Promise<{
  success: boolean;
  message: string;
  user?: User;
}> {
  const username = formData.get('username') as string;
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const role = formData.get('role') as 'empleado' | 'socio';

  // Validaciones básicas
  if (!username || !fullName || !email || !password || !confirmPassword || !role) {
    return { success: false, message: "Todos los campos son requeridos." };
  }
  if (password !== confirmPassword) {
    return { success: false, message: "Las contraseñas no coinciden." };
  }
  if (password.length < 8) {
    return { success: false, message: "La contraseña debe tener al menos 8 caracteres." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si el usuario o email ya existen
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.name === username) {
        return { success: false, message: 'El nombre de usuario ya existe.' };
      }
      if (existingUser.email === email) {
        return { success: false, message: 'El correo electrónico ya existe.' };
      }
    }

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        name: username,
        fullName: fullName,
        email: email,
        password: hashedPassword,
        role: role,
        es_socio: role === 'socio',
        clases_restantes: role === 'socio' ? 8 : null,
        last_reset_month: role === 'socio' ? new Date() : null,
      },
    });

    console.log(`Nuevo usuario '${username}' (${role}) creado:`, newUser);
    return { 
      success: true, 
      message: `Usuario ${newUser.name} registrado correctamente como ${role}.`,
      user: newUser
    };

  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    
    if (isErrorWithCode(error)) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (Array.isArray(target)) {
          if (target.includes('email')) {
            return { success: false, message: 'El correo electrónico ya está registrado.' };
          }
          if (target.includes('name')) {
            return { success: false, message: 'El nombre de usuario ya está registrado.' };
          }
        }
        return { success: false, message: 'Error de duplicado en la base de datos.' };
      }
    }

    console.error('Error al registrar usuario por Admin:', error);
    return { 
      success: false, 
      message: isErrorWithMessage(error) ? error.message : 'Error al registrar el usuario. Inténtalo de nuevo.' 
    };
  }
}
/**
 * Obtiene usuarios de la base de datos por su rol (Empleados o Socios) desde la tabla 'usuarios'.
 * @returns Un objeto que contiene arrays de empleados y socios.
 * @throws Error si hay un problema al obtener los usuarios.
 */
export async function getUsersByRole() {
  try {
    const empleados = await prisma.user.findMany({
      where: { role: 'empleado' },
      orderBy: {
        id: 'asc',
      },
      select: { // Seleccionar solo los campos necesarios para la lista de usuarios
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    const socios = await prisma.user.findMany({
      where: { role: 'socio' },
      orderBy: {
        id: 'asc',
      },
      select: { // Seleccionar solo los campos necesarios
        id: true,
        name: true,
        email: true,
        role: true,
        es_socio: true,
        clases_restantes: true,
      }
    });
    console.log('Usuarios obtenidos de DB - Empleados (unified):', empleados);
    console.log('Usuarios obtenidos de DB - Socios (unified):', socios);
    return { empleados, socios };
  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error al obtener usuarios por rol de DB:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al obtener los usuarios. Inténtalo de nuevo.');
  }
}

/**
 * Elimina un usuario (Empleado o Socio) de la base de datos `usuarios`.
 * @param formData Objeto FormData que contiene 'userId' y 'roleToDelete'.
 * @returns El objeto del usuario eliminado.
 * @throws Error si el usuario no existe, o si hay un problema al eliminar.
 */
export async function deleteUserByAdmin(formData: FormData) {
  const userId = parseInt(formData.get('userId') as string);
  const roleToDelete = formData.get('roleToDelete') as string;

  if (isNaN(userId) || !roleToDelete) {
    throw new Error("ID de usuario y rol son requeridos para eliminar.");
  }

  try {
    // Usar una transacción para asegurar la integridad de los datos
    const deletedUser = await prisma.$transaction(async (tx) => {
      // 1. Primero eliminar todas las inscripciones del usuario (socio)
      await tx.inscripcion.deleteMany({
        where: { id_usuario: userId },
      });

      // 2. Luego eliminar el usuario
      return await tx.user.delete({
        where: { id: userId },
      });
    });

    console.log(`Usuario (${roleToDelete}) eliminado de DB (unified):`, deletedUser);
    return deletedUser;
  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    if (isErrorWithCode(error) && error.code === 'P2025') {
      throw new Error('El usuario a eliminar no existe.');
    }
    console.error('Error al eliminar usuario por Admin:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al eliminar el usuario. Inténtalo de nuevo.');
  }
}

/**
 * 💡 MODIFICADO: Ahora devuelve un objeto de resultado para todas las validaciones.
 * Inscribe a un socio en una clase.
 * @param formData Objeto FormData con 'claseId', 'userId'.
 * @returns Un objeto con `success: boolean`, `message: string` y el objeto de la inscripción creada.
 */
export async function enrollInClass(formData: FormData) {
  const claseId = parseInt(formData.get('claseId') as string);
  const userId = parseInt(formData.get('userId') as string);

  if (isNaN(claseId) || isNaN(userId)) {
    return { success: false, message: "Datos de inscripción incompletos o inválidos." };
  }

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const clase = await tx.clase.findUnique({
        where: { id_clase: claseId },
      });

      const socio = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!clase) {
        return { success: false, message: "La clase no existe." };
      }
      // 💡 NUEVA VALIDACIÓN: No permitir inscripción a clases pasadas.
      const now = new Date();
      if (clase.fecha_hora < now) {
        return { success: false, message: "No puedes inscribirte a una clase que ya ha pasado." };
      }

      if (!socio || socio.role !== 'socio' || !socio.es_socio) {
        return { success: false, message: "El usuario no es un socio válido para inscribirse." };
      }

      const existingInscription = await tx.inscripcion.findFirst({
        where: {
          id_usuario: userId,
          id_clase: claseId,
        },
      });
      if (existingInscription) {
        return { success: false, message: "Ya estás inscrito en esta clase." };
      }
      
      let currentClasesRestantes = socio.clases_restantes || 0;
      if (!socio.last_reset_month || socio.last_reset_month.getMonth() !== now.getMonth() || socio.last_reset_month.getFullYear() !== now.getFullYear()) {
        currentClasesRestantes = 8;
        console.log(`Reinicio mensual para socio ${socio.name}. Clases restantes: 8.`);
      }

      if (clase.cupo <= 0) {
        return { success: false, message: "No hay cupo disponible para esta clase." };
      }
      if (currentClasesRestantes <= 0) {
        return { success: false, message: "No tienes clases restantes para inscribirte este mes." };
      }

      const inscripcion = await tx.inscripcion.create({
        data: {
          id_usuario: userId,
          id_clase: claseId,
          metodo_pago: 'socio',
        },
      });

      await tx.clase.update({
        where: { id_clase: claseId },
        data: { cupo: { decrement: 1 } },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          clases_restantes: { decrement: 1 },
          last_reset_month: now,
        },
      });

      return { success: true, message: "Inscripción creada con éxito.", inscription: inscripcion };
    });

    console.log('Inscripción creada con éxito:', result);
    return result;

  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error en inscripción:', error);
    // 💡 MODIFICADO: Retorna un objeto en lugar de lanzar un nuevo Error.
    return { success: false, message: isErrorWithMessage(error) ? error.message : 'Error al inscribir a la clase. Por favor, intenta de nuevo.' };
  }
}

/**
 * Obtiene los datos de un usuario por su ID desde la tabla `usuarios` (modelo `User`).
 * Se usa para obtener el nombre de usuario y el contador de clases restantes para la interfaz del Socio.
 * @param userId El ID del usuario en la tabla `usuarios`.
 * @returns Un objeto con los datos del usuario (id, name, clases_restantes) o lanza un error.
 * @throws Error si el usuario no se encuentra o hay un problema en la DB.
 */
export async function getUserById(userId: number): Promise<UserData> {
  if (isNaN(userId)) {
    throw new Error("ID de usuario inválido.");
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }
    return {
      id_usuario: user.id,
      nom_usuario: user.name,
      clases_restantes: user.clases_restantes,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Error al obtener usuario por ID:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al obtener los datos del usuario.');
  }
}

/**
 * Obtiene las inscripciones de un socio específico, incluyendo detalles de la clase.
 * @param userId El ID del usuario (socio) para el que se buscan las inscripciones.
 * @returns Un array de objetos de inscripción con detalles de la clase.
 * @throws Error si hay un problema al obtener las inscripciones.
 */
export async function getSocioInscriptions(userId: number) {
  if (isNaN(userId)) {
    throw new Error("ID de usuario inválido para obtener inscripciones.");
  }

  try {
    const inscriptions = await prisma.inscripcion.findMany({
      where: { id_usuario: userId },
      include: {
        usuario: {
          select: { id: true, name: true, email: true },
        },
        clase: true,
      },
      orderBy: {
        fecha_registro: 'desc',
      },
    });

    console.log(`Inscripciones obtenidas para el socio ID ${userId}:`, inscriptions);
    return inscriptions;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Error al obtener inscripciones del socio:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al obtener tus clases inscritas. Inténtalo de nuevo.');
  }
}

/**
 * Registra una nueva inscripción de visitante en la base de datos.
 * @param formData Objeto FormData con 'nombre', 'correo', 'claseId', 'metodoPago'.
 * @returns Un objeto con 'success: true' y los detalles de la inscripción para mostrar en la UI.
 * @throws Error si los datos son inválidos, el cupo es insuficiente, o hay un problema en la DB.
 */
export async function registerVisitorInscription(formData: FormData): Promise<{ success: boolean; inscriptionDetails: VisitorInscriptionData }> {
  const nombre = formData.get('nombre') as string;
  const correo = formData.get('correo') as string;
  const claseId = parseInt(formData.get('claseId') as string);
  const metodoPagoString = formData.get('metodoPago') as string;

  if (!nombre || !correo || isNaN(claseId) || !metodoPagoString) {
    throw new Error("Todos los campos son requeridos para la inscripción.");
  }

  const metodoPagoBoolean = metodoPagoString === 'caja';

  try {
    const transactionResult = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const clase = await tx.clase.findUnique({
        where: { id_clase: claseId },
      });

      if (!clase) {
        throw new Error("La clase seleccionada no existe.");
      }
      if (clase.cupo <= 0) {
        throw new Error("No hay cupo disponible para esta clase.");
      }

      const newInscription = await tx.inscripcionVisitante.create({
        data: {
          nombre: nombre,
          correo: correo,
          id_clase: claseId,
          metodo_pago: metodoPagoBoolean,
          codigo: Math.floor(100000 + Math.random() * 900000),
        },
      });

      await tx.clase.update({
        where: { id_clase: claseId },
        data: { cupo: { decrement: 1 } },
      });

      return { newInscription, clase }; 
    });

    const newVisitorInscriptionData = transactionResult.newInscription;
    const classDetailsForConfirmation = transactionResult.clase;

    console.log('Inscripción de visitante creada con éxito en DB:', newVisitorInscriptionData.id_visitante);

    return { 
        success: true, 
        inscriptionDetails: {
            id: newVisitorInscriptionData.id_visitante,
            nombre: newVisitorInscriptionData.nombre,
            correo: newVisitorInscriptionData.correo,
            claseNombre: classDetailsForConfirmation.nombre_clase,
            claseFechaHora: classDetailsForConfirmation.fecha_hora,
            codigo: newVisitorInscriptionData.codigo,
            metodoPago: metodoPagoString === 'caja' ? 'Pago en Caja' : 'Transferencia Bancaria',
            detallesPago: metodoPagoString === 'transferencia' ? {
                banco: 'Tu Banco Aquí',
                cuenta: '1234567890',
                clabe: '012345678901234567',
                beneficiario: 'Oberfit S.A. de C.V.'
            } : null
        }
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Error al registrar inscripción de visitante:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al registrar la inscripción de visitante. Inténtalo de nuevo.');
  }
}

/**
 * Obtiene el listado de asistentes (socios e inscritos visitantes) para una clase específica.
 * @param classId El ID de la clase para la que se buscan los asistentes.
 * @returns Un array de objetos que representan los asistentes, con su tipo (socio/visitante) y datos relevantes.
 * @throws Error si hay un problema al obtener los asistentes.
 */
export async function getAttendeesByClass(classId: number) {
  if (isNaN(classId)) {
    throw new Error("ID de clase inválido para obtener asistentes.");
  }

  try {
    const allAttendees: Array<{ type: string; id: number; name: string | null; email?: string | null; }> = [];

    // 1. Obtener inscripciones de socios para esta clase
    const socioInscriptions = await prisma.inscripcion.findMany({
      where: { id_clase: classId },
      include: {
        usuario: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    socioInscriptions.forEach((inv:{ usuario: { id: number; name: string | null; email: string | null; } | null; }) => {
      if (inv.usuario) {
        allAttendees.push({
          type: 'socio',
          id: inv.usuario.id,
          name: inv.usuario.name,
          email: inv.usuario.email,
        });
      }
    });

    // 2. Obtener inscripciones de visitantes para esta clase
    const visitanteInscriptions = await prisma.inscripcionVisitante.findMany({
        where: { id_clase: classId },
        select: { id_visitante: true, nombre: true, correo: true, metodo_pago: true }, 
    });

    visitanteInscriptions.forEach((inv:{ id_visitante: number; nombre: string; correo: string; metodo_pago: boolean; }) => {
        allAttendees.push({
            type: 'visitante',
            id: inv.id_visitante,
            name: inv.nombre,
            email: inv.correo,
        });
    });

    allAttendees.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    console.log(`Asistentes para clase ID ${classId}:`, allAttendees);
    return allAttendees;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Error al obtener asistentes por clase:', error);
    throw new Error((error as Error).message || 'Error al obtener el listado de asistentes.');
  }
}

/**
 * Obtiene un usuario completo por su ID para edición
 */
export async function getFullUserById(userId: number): Promise<{success: boolean; message?: string; user?: FullUserData}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    return { 
      success: true,
      user: {
        id: user.id,
        username: user.name,
        fullName: user.fullName,
        email: user.email,
        role: user.role as 'empleado' | 'socio',
        es_socio: user.es_socio,
        clases_restantes: user.clases_restantes
      }
    };
  } catch (error: unknown) {
    console.error('Error al obtener usuario:', error);
    return { 
      success: false, 
      message: isErrorWithMessage(error) ? error.message : 'Error al obtener los datos del usuario.' 
    };
  }
}

/**
 * Actualiza un usuario existente en la base de datos
 */
export async function updateUser(formData: FormData): Promise<{success: boolean; message: string; user?: User}> {
  const id = parseInt(formData.get('id') as string);
  const username = formData.get('username') as string;
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const role = formData.get('role') as 'empleado' | 'socio';
  const clasesRestantes = formData.get('clases_restantes') as string | null;

  // Validaciones básicas
  if (isNaN(id)) {
    return { success: false, message: "ID de usuario inválido." };
  }
  if (!username || !fullName || !email || !role) {
    return { success: false, message: "Todos los campos son requeridos excepto la contraseña." };
  }
  if (password && password !== confirmPassword) {
    return { success: false, message: "Las contraseñas no coinciden." };
  }
  if (password && password.length < 8) {
    return { success: false, message: "La contraseña debe tener al menos 8 caracteres." };
  }

  try {
    const updateData: Prisma.UserUpdateInput = {
      name: username,
      fullName: fullName,
      email: email,
      role: role,
      es_socio: role === 'socio',
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (role === 'socio') {
      updateData.clases_restantes = clasesRestantes ? parseInt(clasesRestantes) : 0;
      updateData.last_reset_month = new Date();
    } else {
      updateData.clases_restantes = null;
      updateData.last_reset_month = null;
    }

    // Verificar unicidad de email y username
    const existingUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: [{ name: username }, { email: email }] }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.name === username) {
        return { success: false, message: 'El nombre de usuario ya está en uso.' };
      }
      if (existingUser.email === email) {
        return { success: false, message: 'El correo electrónico ya está en uso.' };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return { 
      success: true, 
      message: `Usuario ${updatedUser.name} actualizado correctamente.`,
      user: updatedUser
    };
  } catch (error: unknown) {
    if (isErrorWithCode(error)) {
      if (error.code === 'P2025') {
        return { success: false, message: 'El usuario a actualizar no existe.' };
      }
      if (error.code === 'P2002') {
        return { success: false, message: 'Error de duplicado en la base de datos.' };
      }
    }
    console.error('Error al actualizar usuario:', error);
    return { 
      success: false, 
      message: isErrorWithMessage(error) ? error.message : 'Error desconocido al actualizar el usuario.' 
    };
  }
}
/**
 * Actualiza la contraseña de un usuario (socio o empleado).
 * @param formData Objeto FormData con 'currentPassword', 'newPassword', 'confirmNewPassword'.
 * @returns Un objeto con `success: boolean` y un `message: string`.
 */
export async function updatePassword(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return { success: false, message: "No está autenticado para realizar esta acción." };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmNewPassword = formData.get('confirmNewPassword') as string;

  // Validaciones básicas
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return { success: false, message: "Todos los campos son obligatorios." };
  }
  if (newPassword !== confirmNewPassword) {
    return { success: false, message: "La nueva contraseña y su confirmación no coinciden." };
  }
  if (newPassword.length < 8) {
    return { success: false, message: "La nueva contraseña debe tener al menos 8 caracteres." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }

    if (!user.password) {
      return { success: false, message: "No se encontró una contraseña actual para este usuario." };
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return { success: false, message: "La contraseña actual es incorrecta." };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    console.log(`Contraseña del usuario ${user.name} actualizada con éxito.`);
    return { success: true, message: "Contraseña actualizada exitosamente." };

  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    
    console.error('Error al actualizar la contraseña:', error);
    return { 
      success: false, 
      message: isErrorWithMessage(error) ? error.message : "Ocurrió un error inesperado al actualizar la contraseña. Por favor, inténtalo de nuevo." 
    };
  }
}