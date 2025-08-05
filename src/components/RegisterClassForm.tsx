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
  const [selectedTime, setSelectedTime] = useState('');

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
      case 4:
        startHour = 6;
        endHour = 22;
        break;
      case 5:
        startHour = 6;
        endHour = 21;
        break;
      case 6:
        startHour = 6;
        endHour = 14;
        break;
      case 0:
        startHour = 7;
        endHour = 14;
        break;
      default:
        break;
    }
    for (let hour = startHour; hour < endHour; hour++) {
      newTimeOptions.push(`${String(hour).padStart(2, '0')}:00`);
    }
    setTimeOptions(newTimeOptions);
    setSelectedTime(newTimeOptions[0] || '');
  }, [selectedDate]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseMessage(null);

    const formData = new FormData(event.currentTarget);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    
    // 🚨 Corrección: Construye un string con el formato ISO 8601 que incluye el desfase de la zona horaria
    const mexicoCityOffset = -6; // CDMX es UTC-6
    const isoDateTimeString = `${date}T${time}:00.000${mexicoCityOffset >= 0 ? '+' : '-'}${String(Math.abs(mexicoCityOffset)).padStart(2, '0')}:00`;
    
    formData.append('dateTime', isoDateTimeString);

    try {
      await registerClass(formData);
      setResponseMessage({ type: 'success', message: 'Clase registrada con éxito.' });
      // Limpiar formulario si es necesario
    } catch (err: any) {
      setResponseMessage({ type: 'danger', message: err.message || 'Error al registrar la clase.' });
    }
  };

  return (
    <BsCard className="p-4 shadow-sm">
      <h3 className="text-center mb-4">Registrar Nueva Clase</h3>
      <Form onSubmit={handleFormSubmit}>
        <Form.Group className="mb-3" controlId="formClassName">
          <Form.Label className="d-block text-start fw-bold text-dark">Nombre de la Clase</Form.Label>
          <Form.Control type="text" name="className" placeholder="Ej: Yoga Matutino" required />
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label className="d-block text-start fw-bold text-dark">Descripción</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" placeholder="Breve descripción de la clase" required />
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
              <Form.Select name="time" required value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
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

        <Button type="submit" variant="primary" className="w-100">
          Registrar Clase
        </Button>
      </Form>
      {responseMessage && (
        <Alert variant={responseMessage.type} className="mt-3">
          {responseMessage.message}
        </Alert>
      )}
    </BsCard>
  );
}