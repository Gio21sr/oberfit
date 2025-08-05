// src/components/RegisterClassForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { Form, Button, Card as BsCard, Alert, Row, Col } from 'react-bootstrap';
import { registerClass } from '@/app/actions';

export default function RegisterClassForm() {
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  const [minDate, setMinDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [timeOptions, setTimeOptions] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    setMinDate(todayFormatted);
    setSelectedDate(todayFormatted);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fecha = new Date(selectedDate);
    const dayOfWeek = fecha.getDay(); // 0=Domingo, 1=Lunes, etc.

    const newTimeOptions = [];
    let startHour = 0;
    let endHour = 0;

    switch (dayOfWeek) {
      case 1:
      case 2:
      case 3:
      case 4: // Lunes a Jueves: 6:00 am a 10:00 pm
        startHour = 6;
        endHour = 22;
        break;
      case 5: // Viernes: 6:00 am a 9:00 pm
        startHour = 6;
        endHour = 21;
        break;
      case 6: // Sábado: 6:00 am a 2:00 pm
        startHour = 6;
        endHour = 14;
        break;
      case 0: // Domingo: 7:00 am a 2:00 pm
        startHour = 7;
        endHour = 14;
        break;
      default:
        break;
    }

    // Genera las horas en punto dentro del rango
    for (let hour = startHour; hour < endHour; hour++) {
      newTimeOptions.push(`${String(hour).padStart(2, '0')}:00`);
    }

    setTimeOptions(newTimeOptions);
  }, [selectedDate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseMessage(null);

    const formData = new FormData(event.target as HTMLFormElement);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;

    const dateTime = `${date}T${time}`;
    formData.set('dateTime', dateTime);

    try {
      await registerClass(formData);
      setResponseMessage({ type: 'success', message: 'Clase registrada con éxito.' });
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      setResponseMessage({ type: 'danger', message: error.message || 'Error al registrar la clase.' });
      console.error('Error al registrar clase desde el componente:', error);
    }
  };

  return (
    <BsCard className="p-4 shadow-sm text-center" style={{ maxWidth: '600px', margin: 'auto' }}>
      <BsCard.Title as="h2" className="mb-4 fs-3 fw-bold text-dark">Registrar Nueva Clase</BsCard.Title>
      {responseMessage && (
        <Alert variant={responseMessage.type} onClose={() => setResponseMessage(null)} dismissible>
          {responseMessage.message}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formClassName">
          <Form.Label className="d-block text-start fw-bold text-dark">Nombre de la Clase</Form.Label>
          <Form.Control type="text" name="name" placeholder="Ej: Yoga para Principiantes" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label className="d-block text-start fw-bold text-dark">Descripción</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" placeholder="Describe brevemente la clase..." required />
        </Form.Group>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formDate">
              <Form.Label className="d-block text-start fw-bold text-dark">Fecha</Form.Label>
              <Form.Control 
                type="date" 
                name="date" 
                required 
                min={minDate} 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formTime">
              <Form.Label className="d-block text-start fw-bold text-dark">Hora</Form.Label>
              <Form.Select name="time" required>
                <option value="">Selecciona la hora</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-4" controlId="formCapacity">
          <Form.Label className="d-block text-start fw-bold text-dark">Cupo</Form.Label>
          <Form.Control type="number" name="capacity" min="1" placeholder="Ej: 20" required />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
          Registrar Clase
        </Button>
      </Form>
    </BsCard>
  );
}