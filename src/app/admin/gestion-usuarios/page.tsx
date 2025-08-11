"use client";

import { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Button, Tabs, Tab, Modal, Form } from 'react-bootstrap';
import { getUsersByRole, deleteUserByAdmin, getFullUserById, updateUser } from '@/app/actions';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'empleado' as 'empleado' | 'socio',
    clases_restantes: '0'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { empleados: fetchedEmpleados, socios: fetchedSocios } = await getUsersByRole();
      setEmpleados(fetchedEmpleados);
      setSocios(fetchedSocios);
    } catch (error: unknown) {
      console.error("Error al cargar usuarios:", error);
      setError((error as Error).message || "No se pudieron cargar los usuarios.");
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
    } catch (error: unknown) {
      console.error(`Error al eliminar ${roleToDelete}:`, error);
      setResponseMessage({ type: 'danger', message: (error as Error).message || `Error al eliminar ${roleToDelete}.` });
    }
  };

  const handleEditClick = async (userId: number) => {
    try {
      setLoading(true);
      const result = await getFullUserById(userId);
      
      if (result.success && result.user) {
        setCurrentUser({
          id: result.user.id,
          name: result.user.username,
          email: result.user.email,
          role: result.user.role,
          es_socio: result.user.es_socio,
          clases_restantes: result.user.clases_restantes
        });
        setEditForm({
          username: result.user.username || '',
          fullName: result.user.fullName || '',
          email: result.user.email || '',
          password: '',
          confirmPassword: '',
          role: result.user.role as 'empleado' | 'socio',
          clases_restantes: result.user.clases_restantes?.toString() || '0'
        });
        setShowEditModal(true);
      } else {
        setResponseMessage({
          type: 'danger',
          message: result.message || 'Error al cargar datos del usuario'
        });
      }
    } catch (error) {
      setResponseMessage({
        type: 'danger',
        message: (error as Error).message || 'Error al cargar datos del usuario'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('id', currentUser.id.toString());
      formData.append('username', editForm.username);
      formData.append('fullName', editForm.fullName);
      formData.append('email', editForm.email);
      formData.append('password', editForm.password);
      formData.append('confirmPassword', editForm.confirmPassword);
      formData.append('role', editForm.role);
      formData.append('clases_restantes', editForm.clases_restantes);

      const result = await updateUser(formData);
      
      if (result.success) {
        setResponseMessage({
          type: 'success',
          message: result.message || 'Usuario actualizado correctamente'
        });
        setShowEditModal(false);
        fetchUsers();
      } else {
        setResponseMessage({
          type: 'danger',
          message: result.message || 'Error al actualizar usuario'
        });
      }
    } catch (error) {
      setResponseMessage({
        type: 'danger',
        message: (error as Error).message || 'Error al actualizar usuario'
      });
    } finally {
      setLoading(false);
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
            <span className="visually-hidden">Cargando...</span>
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
                        <Button variant="primary" size="sm" onClick={() => handleEditClick(user.id)} className="me-2">
                          Editar
                        </Button>
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
                        <Button variant="primary" size="sm" onClick={() => handleEditClick(user.id)} className="me-2">
                          Editar
                        </Button>
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

      {/* Modal de Edición */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control 
                type="text" 
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control 
                type="text" 
                value={editForm.fullName}
                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control 
                type="email" 
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select 
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value as 'empleado' | 'socio'})}
                required
              >
                <option value="empleado">Empleado</option>
                <option value="socio">Socio</option>
              </Form.Select>
            </Form.Group>
            
            {editForm.role === 'socio' && (
              <Form.Group className="mb-3">
                <Form.Label>Clases restantes</Form.Label>
                <Form.Control 
                  type="number" 
                  min="0"
                  value={editForm.clases_restantes}
                  onChange={(e) => setEditForm({...editForm, clases_restantes: e.target.value})}
                />
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Nueva contraseña (dejar vacío para no cambiar)</Form.Label>
              <Form.Control 
                type="password" 
                value={editForm.password}
                onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                placeholder="Dejar vacío para mantener la contraseña actual"
              />
            </Form.Group>
            
            {editForm.password && (
              <Form.Group className="mb-3">
                <Form.Label>Confirmar nueva contraseña</Form.Label>
                <Form.Control 
                  type="password" 
                  value={editForm.confirmPassword}
                  onChange={(e) => setEditForm({...editForm, confirmPassword: e.target.value})}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}