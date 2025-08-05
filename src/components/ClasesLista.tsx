// src/components/ClasesLista.tsx
"use client";

import { ListGroup, Button } from 'react-bootstrap';
import Link from 'next/link';
import { formatDbDateTimeToLocal } from '@/utils/formatDate';

// Definimos la interfaz para las props que recibirá
interface Inscripcion {
    id_inscripcion: number;
    clase: {
        nombre_clase: string;
        fecha_hora: Date;
    };
    fecha_registro: Date;
}

interface ClasesListaProps {
    inscripciones: Inscripcion[];
}

export default function ClasesLista({ inscripciones }: ClasesListaProps) {
    return (
        <>
            {inscripciones.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    <h4 className="alert-heading">No tienes clases inscritas.</h4>
                    <p>Puedes ir a la sección de clases para inscribirte en alguna.</p>
                    <hr />
                    <Link href="/socio/clases">
                        <Button variant="primary">Ver Clases Disponibles</Button>
                    </Link>
                </div>
            ) : (
                <ListGroup>
                    {inscripciones.map((inscripcion) => (
                        <ListGroup.Item key={inscripcion.id_inscripcion} className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-1">{inscripcion.clase.nombre_clase}</h5>
                                <small className="text-muted">Inscrito el: {new Date(inscripcion.fecha_registro).toLocaleDateString()}</small>
                            </div>
                            <div>
                                <p className="mb-0"><strong>Fecha y Hora:</strong> {formatDbDateTimeToLocal(inscripcion.clase.fecha_hora)}</p>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </>
    );
}