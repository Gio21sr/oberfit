// src/app/admin/listado-asistentes/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Form, Button, Card, Table, Spinner, Alert } from 'react-bootstrap';
import { getClasses, getAttendeesByClass } from '@/app/actions';
import { formatDbDateTimeToLocal } from '@/utils/formatDate';
import { useSidebar } from '@/lib/SidebarContext';

interface ClaseSelect {
    id_clase: number;
    nombre_clase: string;
    fecha_hora: Date;
}

// ✅ Interfaz actualizada para mostrar los nuevos campos y eliminar el 'id'
interface Assistant {
    type: 'socio' | 'visitante';
    nombre_completo: string | null;
    nombre_usuario: string | null;
    email: string | null;
}

export default function AdminAttendancePage() {
    const [classes, setClasses] = useState<ClaseSelect[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [errorClasses, setErrorClasses] = useState<string | null>(null);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [assistants, setAssistants] = useState<Assistant[]>([]);
    const [loadingAssistants, setLoadingAssistants] = useState(false);
    const [errorAssistants, setErrorAssistants] = useState<string | null>(null);
    const [hasFetchedAssistants, setHasFetchedAssistants] = useState(false);
    const { setCurrentRoleMenu } = useSidebar();

    useEffect(() => {
        setCurrentRoleMenu('admin');
        const fetchClasses = async () => {
            setLoadingClasses(true);
            setErrorClasses(null);
            try {
                const result = await getClasses();
                if (result.success) {
                    const processedClasses = (result.classes ?? []).map((clase: any) => ({
                        id_clase: clase.id_clase,
                        nombre_clase: clase.nombre_clase,
                        fecha_hora: new Date(clase.fecha_hora),
                    }));
                    setClasses(processedClasses);
                } else {
                    setErrorClasses(result.message);
                }
            } catch (err: any) {
                console.error("Error al cargar clases:", err);
                setErrorClasses(err.message || "No se pudieron cargar las clases.");
            } finally {
                setLoadingClasses(false);
            }
        };
        fetchClasses();
    }, [setCurrentRoleMenu]);

    const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(event.target.value);
        setSelectedClassId(isNaN(id) ? null : id);
        setAssistants([]);
        setHasFetchedAssistants(false);
    };

    const fetchAssistants = async () => {
        if (!selectedClassId) {
            setErrorAssistants("Por favor, selecciona una clase.");
            return;
        }

        setLoadingAssistants(true);
        setErrorAssistants(null);
        try {
            const fetchedAttendees = await getAttendeesByClass(selectedClassId);
            setAssistants(
                fetchedAttendees.map((a: any) => {
                    const nombreCompleto = a.name || 'N/A';
                    const nombreUsuario = a.name?.split(' ')[0] || 'N/A';
                    return {
                        type: a.type as 'socio' | 'visitante',
                        nombre_completo: nombreCompleto,
                        nombre_usuario: nombreUsuario,
                        email: a.email || null,
                    };
                })
            );
            setHasFetchedAssistants(true);
        } catch (err: any) {
            console.error("Error al cargar asistentes:", err);
            setErrorAssistants(err.message || "No se pudieron cargar los asistentes.");
        } finally {
            setLoadingAssistants(false);
        }
    };

    return (
        <div className="role-page-content">
            <h1 className="main-title">Listado de Asistentes</h1>
            <p className="sub-title">Selecciona una clase para ver quién se inscribió.</p>

            <Card className="my-4 p-4 shadow-sm">
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Seleccionar Clase</Form.Label>
                        <Form.Select onChange={handleClassChange} value={selectedClassId || ''} disabled={loadingClasses}>
                            <option value="">{loadingClasses ? "Cargando..." : "Selecciona una clase"}</option>
                            {classes.map((clase) => (
                                <option key={clase.id_clase} value={clase.id_clase}>
                                    {`${clase.nombre_clase} - ${formatDbDateTimeToLocal(clase.fecha_hora)}`}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button onClick={fetchAssistants} disabled={!selectedClassId || loadingAssistants}>
                        {loadingAssistants ? 'Cargando...' : 'Ver Asistentes'}
                    </Button>
                </Form>
            </Card>

            {loadingAssistants && (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" />
                </div>
            )}

            {errorAssistants && (
                <Alert variant="danger" className="my-4">
                    {errorAssistants}
                </Alert>
            )}

            {hasFetchedAssistants && assistants.length === 0 && (
                <Alert variant="info" className="my-4">
                    No hay asistentes registrados para esta clase.
                </Alert>
            )}

            {!loadingAssistants && assistants.length > 0 && (
                <Card className="my-4 p-4 shadow-sm">
                    <h5 className="mb-3">Asistentes de la clase seleccionada</h5>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Nombre Completo</th>
                                <th>Nombre de Usuario</th>
                                <th>Correo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assistants.map((assistant, index) => (
                                <tr key={index}>
                                    <td>{assistant.type}</td>
                                    <td>{assistant.nombre_completo}</td>
                                    <td>{assistant.nombre_usuario}</td>
                                    <td>{assistant.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}

            {errorClasses && (
                <Alert variant="danger" className="my-4">
                    {errorClasses}
                </Alert>
            )}
        </div>
    );
}