// src/app/actions.ts
"use server";

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Asegúrate de que este archivo exista

// --- TUS FUNCIONES DE AYUDA Y TIPOS (SIN CAMBIOS) ---

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

interface UserData {
  id_usuario: number;
  nom_usuario: string | null;
  clases_restantes: number | null;
}

// 💡 PUBLIC: Un usuario nuevo no tiene sesión, por lo que esta acción debe ser pública.
export async function registerUser(formData: FormData) {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!username || !email || !password || !confirmPassword) {
    throw new Error("Todos los campos son requeridos.");
  }
  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden.");
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
        throw new Error('El nombre de usuario ya existe.');
      }
      if (existingUser.email === email) {
        throw new Error('El correo electrónico ya existe.');
      }
    }

    const newUser = await prisma.user.create({
      data: {
        name: username,
        email: email,
        password: hashedPassword,
        role: "socio",
        es_socio: true,
        clases_restantes: 8,
        last_reset_month: new Date(),
      },
    });
    console.log('Socio registrado en DB (tabla usuarios/User):', newUser);

      return { success: true, message: '¡Usuario creado correctamente!' };
  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    if (isErrorWithCode(error) && error.code === 'P2002') {
        const target = (error.meta?.target) ? (Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target) : 'campo desconocido';
        throw new Error(`Ya existe un usuario con este ${target}.`);
    }
    console.error('Error al registrar socio:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al registrar el socio. Inténtalo de nuevo.');
  }
}

// ✅ SECURE: Solo los administradores pueden registrar nuevas clases.
export async function registerClass(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    throw new Error('Acceso denegado: Solo los administradores pueden crear clases.');
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const dateTimeString = formData.get('dateTime') as string;
  const capacity = parseInt(formData.get('capacity') as string);

  if (!name || !description || !dateTimeString || isNaN(capacity) || capacity <= 0) {
    throw new Error("Todos los campos de la clase son requeridos y válidos.");
  }

  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  const fechaHora = new Date(year, month - 1, day, hours, minutes);

  if (isNaN(fechaHora.getTime())) {
      throw new Error("Formato de fecha y hora inválido.");
  }

  try {
    const newClass = await prisma.clase.create({
      data: {
        nombre_clase: name,
        descripcion: description,
        fecha_hora: fechaHora,
        cupo: capacity,
        capacidad_maxima: capacity,
      },
    });
    console.log('Clase registrada en DB:', newClass);
    return newClass;
  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error al registrar clase en DB:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al registrar la clase. Inténtalo de nuevo.');
  }
}

// 💡 PUBLIC: Cualquiera puede ver la lista de clases disponibles.
export async function getClasses() {
  try {
    const classes = await prisma.clase.findMany({
        orderBy: {
            fecha_hora: 'asc',
        }
    });
    console.log('Clases obtenidas de DB:', classes);
    return classes;
  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error al obtener clases de DB:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al obtener las clases. Inténtalo de nuevo.');
  }
}

// ✅ SECURE: Solo los administradores pueden actualizar clases.
export async function updateClass(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    throw new Error('Acceso denegado: Solo los administradores pueden actualizar clases.');
  }

  const id_clase = parseInt(formData.get('id_clase') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const dateTimeString = formData.get('dateTime') as string;
  const newCapacity = parseInt(formData.get('capacity') as string);
  const newCapacidadMaxima = parseInt(formData.get('capacidadMaxima') as string);

  if (isNaN(id_clase) || !name || !description || !dateTimeString || isNaN(newCapacity) || newCapacity < 0 || isNaN(newCapacidadMaxima) || newCapacidadMaxima < 0) {
    throw new Error("Todos los campos de la clase son requeridos y válidos para actualizar.");
  }

  if (newCapacity > newCapacidadMaxima) {
      throw new Error("El cupo disponible no puede ser mayor que la capacidad máxima.");
  }

  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  const fechaHora = new Date(year, month - 1, day, hours, minutes);

  if (isNaN(fechaHora.getTime())) {
      throw new Error("Formato de fecha y hora inválido.");
  }

  try {
    const updatedClass = await prisma.clase.update({
      where: { id_clase: id_clase },
      data: {
        nombre_clase: name,
        descripcion: description,
        fecha_hora: fechaHora,
        cupo: newCapacity,
        capacidad_maxima: newCapacidadMaxima,
      },
    });
    console.log('Clase actualizada en DB:', updatedClass);
    return updatedClass;
  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error al actualizar clase en DB:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al actualizar la clase. Inténtalo de nuevo.');
  }
}

// ✅ SECURE: Solo los administradores pueden eliminar clases.
export async function deleteClass(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    throw new Error('Acceso denegado: Solo los administradores pueden eliminar clases.');
  }

  const id_clase = parseInt(formData.get('id_clase') as string);

  if (isNaN(id_clase)) {
    throw new Error("ID de clase inválido para eliminar.");
  }

  try {
    const deletedClass = await prisma.clase.delete({
      where: { id_clase: id_clase },
    });
    console.log('Clase eliminada de DB:', deletedClass);
    return deletedClass;
  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    if (isErrorWithCode(error) && error.code === 'P2003') {
        throw new Error('No se puede eliminar la clase porque tiene inscripciones asociadas.');
    }
    console.error('Error al eliminar clase de DB:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al eliminar la clase. Inténtalo de nuevo.');
  }
}

// ✅ SECURE: Solo los administradores pueden registrar otros usuarios.
export async function registerUserByAdmin(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    throw new Error('Acceso denegado: Acción solo para administradores.');
  }

  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const role = formData.get('role') as 'empleado' | 'socio';

  if (!username || !email || !password || !confirmPassword || !role) {
    throw new Error("Todos los campos son requeridos.");
  }
  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden.");
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
        throw new Error('El nombre de usuario ya existe.');
      }
      if (existingUser.email === email) {
        throw new Error('El correo electrónico ya existe.');
      }
    }

    const newUser = await prisma.user.create({
      data: {
        name: username,
        email: email,
        password: hashedPassword,
        role: role,
        es_socio: role === 'socio',
        clases_restantes: role === 'socio' ? 8 : null,
        last_reset_month: role === 'socio' ? new Date() : null,
      },
    });
    console.log(`Nuevo usuario '${username}' (${role}) creado en la tabla 'usuarios':`, newUser);

  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    if (isErrorWithCode(error) && error.code === 'P2002') {
        const target = (error.meta?.target) ? (Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target) : 'campo desconocido';
        throw new Error(`Ya existe un usuario con este ${target}.`);
    }
    console.error('Error al registrar usuario por Admin:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al registrar el usuario. Inténtalo de nuevo.');
  }
}

// ✅ SECURE: Solo los administradores pueden ver la lista completa de usuarios.
export async function getUsersByRole() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    throw new Error('Acceso denegado: Acción solo para administradores.');
  }

  try {
    const empleados = await prisma.user.findMany({
      where: { role: 'empleado' },
      orderBy: {
        id: 'asc',
      },
      select: {
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
      select: {
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

// ✅ SECURE: Solo los administradores pueden eliminar usuarios.
export async function deleteUserByAdmin(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    throw new Error('Acceso denegado: Acción solo para administradores.');
  }

  const userId = parseInt(formData.get('userId') as string);
  const roleToDelete = formData.get('roleToDelete') as string;

  if (isNaN(userId) || !roleToDelete) {
    throw new Error("ID de usuario y rol son requeridos para eliminar.");
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
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
    if (isErrorWithCode(error) && error.code === 'P2003') {
        throw new Error('No se puede eliminar el usuario porque tiene registros asociados (ej. inscripciones).');
    }
    console.error('Error al eliminar usuario por Admin:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al eliminar el usuario. Inténtalo de nuevo.');
  }
}

// ✅ SECURE: Un socio debe estar logueado para inscribirse. El ID se toma de la sesión.
export async function enrollInClass(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'socio') {
    throw new Error('Acceso denegado: Debes ser un socio conectado para inscribirte.');
  }

  const claseId = parseInt(formData.get('claseId') as string);
  const userId = parseInt(session.user.id); // <-- MÁS SEGURO: ID desde la sesión

  if (isNaN(claseId)) {
    throw new Error("Datos de inscripción incompletos o inválidos.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const clase = await tx.clase.findUnique({
        where: { id_clase: claseId },
      });

      const socio = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!clase) {
        throw new Error("La clase no existe.");
      }
      if (!socio || socio.role !== 'socio' || !socio.es_socio) {
        throw new Error("El usuario no es un socio válido para inscribirse.");
      }

      const existingInscription = await tx.inscripcion.findFirst({
        where: {
          id_usuario: userId,
          id_clase: claseId,
        },
      });
      if (existingInscription) {
        throw new Error("Ya estás inscrito en esta clase.");
      }

      const now = new Date();
      let currentClasesRestantes = socio.clases_restantes || 0;

      if (!socio.last_reset_month || socio.last_reset_month.getMonth() !== now.getMonth() || socio.last_reset_month.getFullYear() !== now.getFullYear()) {
        currentClasesRestantes = 8;
        console.log(`Reinicio mensual para socio ${socio.name}. Clases restantes: 8.`);
      }

      if (clase.cupo <= 0) {
        throw new Error("No hay cupo disponible para esta clase.");
      }

      if (currentClasesRestantes <= 0) {
        throw new Error("No tienes clases restantes para inscribirte este mes.");
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

      return inscripcion;
    });

    console.log('Inscripción creada con éxito:', result);
    return { success: true, inscription: result };
  } catch (error: unknown) {
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error en inscripción:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al inscribir a la clase.');
  }
}

// ✅ SECURE: Un usuario logueado solo puede ver sus propios datos.
export async function getUserById() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error('Acceso denegado: Debes estar conectado.');
  }
  const userId = parseInt(session.user.id);

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
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error al obtener usuario por ID:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al obtener los datos del usuario.');
  }
}

// ✅ SECURE: Un socio logueado solo puede ver sus propias inscripciones.
export async function getSocioInscriptions() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error('Acceso denegado: Debes estar conectado para ver tus inscripciones.');
  }
  const userId = parseInt(session.user.id);

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
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error al obtener inscripciones del socio:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al obtener tus clases inscritas. Inténtalo de nuevo.');
  }
}

// 💡 PUBLIC: Un visitante no tiene sesión, esta acción debe ser pública.
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
    const transactionResult = await prisma.$transaction(async (tx) => {
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
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error al registrar inscripción de visitante:', error);
    throw new Error(isErrorWithMessage(error) ? error.message : 'Error al registrar la inscripción de visitante. Inténtalo de nuevo.');
  }
}

// ✅ SECURE: Solo admins o empleados pueden ver la lista de asistentes.
export async function getAttendeesByClass(classId: number) {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'empleado'].includes(session.user?.role ?? '')) {
    throw new Error('Acceso denegado: No tienes permiso para ver esta información.');
  }

  if (isNaN(classId)) {
    throw new Error("ID de clase inválido para obtener asistentes.");
  }

  try {
    const allAttendees: Array<{ type: string; id: number; name: string | null; email?: string | null; }> = [];

    const socioInscriptions = await prisma.inscripcion.findMany({
      where: { id_clase: classId },
      include: {
        usuario: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    socioInscriptions.forEach(inv => {
      if (inv.usuario) {
        allAttendees.push({
          type: 'socio',
          id: inv.usuario.id,
          name: inv.usuario.name,
          email: inv.usuario.email,
        });
      }
    });

    const visitanteInscriptions = await prisma.inscripcionVisitante.findMany({
        where: { id_clase: classId },
        select: { id_visitante: true, nombre: true, correo: true, metodo_pago: true },
    });

    visitanteInscriptions.forEach(inv => {
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
    if (isErrorWithRedirect(error)) {
      throw error;
    }
    console.error('Error al obtener asistentes por clase:', error);
    throw new Error((error as Error).message || 'Error al obtener el listado de asistentes.');
  }
}