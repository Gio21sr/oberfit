// src/app/admin/gestion-usuarios/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Button, Tabs, Tab } from 'react-bootstrap';
import { getUsersByRole, deleteUserByAdmin } from '@/app/actions'; // Server Actions

// Define la interfaz para los usuarios tal como vienen del modelo User (tabla usuarios)
interface User {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
  es_socio?: boolean | null;
  clases_restantes?: number | null;
}

export default function AdminUserManagementPage() {
  const [empleados, setEmpleados] = useState<User[]>([]);
  const [socios, setSocios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('empleados');
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'danger', message: string } | null>(null);


  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { empleados: fetchedEmpleados, socios: fetchedSocios } = await getUsersByRole();
      setEmpleados(fetchedEmpleados);
      setSocios(fetchedSocios);
    } catch (error: unknown) { // <-- CAMBIO: 'any' a 'unknown'
      console.error("Error al cargar usuarios:", error);
      setError((error as Error).message || "No se pudieron cargar los usuarios."); // <-- CAMBIO
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number, roleToDelete: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a este ${roleToDelete}? Esta acción es irreversible.`)) {
      return;
    }
    setResponseMessage(null);
    try {
      const formData = new FormData();
      formData.append('userId', userId.toString());
      formData.append('roleToDelete', roleToDelete);

      await deleteUserByAdmin(formData);
      setResponseMessage({ type: 'success', message: `${roleToDelete === 'empleado' ? 'Empleado' : 'Socio'} eliminado con éxito.` });
      fetchUsers();
    } catch (error: unknown) { // <-- CAMBIO: 'any' a 'unknown'
      console.error(`Error al eliminar ${roleToDelete}:`, error);
      setResponseMessage({ type: 'danger', message: (error as Error).message || `Error al eliminar ${roleToDelete}.` }); // <-- CAMBIO
    }
  };

  return (
    <div className="role-page-content">
      <h1 className="main-title">Gestión de Usuarios</h1>
      <p className="sub-title">Administra las cuentas de empleados y socios.</p>

      {responseMessage && (
        <Alert variant={responseMessage.type} onClose={() => setResponseMessage(null)} dismissible className="my-3">
          {responseMessage.message}
        </Alert>
      )}

      {loading && (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando usuarios...</span>
          </Spinner>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-4">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Tabs
          id="user-management-tabs"
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="empleados" title="Empleados">
            {empleados.length === 0 ? (
              <Alert variant="info" className="my-4">
                No hay empleados registrados.
              </Alert>
            ) : (
              <Table striped bordered hover responsive className="my-4">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id, 'empleado')}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))} 
                </tbody>
              </Table>
            )}
          </Tab>
          <Tab eventKey="socios" title="Socios">
            {socios.length === 0 ? (
              <Alert variant="info" className="my-4">
                No hay socios registrados.
              </Alert>
            ) : (
              <Table striped bordered hover responsive className="my-4">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre Socio</th>
                    <th>Correo</th>
                    <th>Clases Restantes</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {socios.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.clases_restantes !== null ? user.clases_restantes : 'N/A'}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id, 'socio')}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>
        </Tabs>
      )}
    </div>
  );
}