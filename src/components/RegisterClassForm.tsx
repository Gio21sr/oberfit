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

  // Configura la fecha mínima (hoy) en la zona horaria de México
  useEffect(() => {
    const today = new Date();
    // Ajusta a la zona horaria de México
    const offset = -6 * 60 * 60 * 1000; // UTC-6 para CDMX
    const todayMexico = new Date(today.getTime() + offset);
    
    const year = todayMexico.getFullYear();
    const month = String(todayMexico.getMonth() + 1).padStart(2, '0');
    const day = String(todayMexico.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    
    setMinDate(todayFormatted);
    setSelectedDate(todayFormatted);
  }, []);

  // Genera opciones de horario según el día seleccionado (horario CDMX)
  useEffect(() => {
    if (!selectedDate) return;

    const [year, month, day] = selectedDate.split('-').map(Number);
    // Crea la fecha en zona horaria de México
    const fecha = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());

    const dayOfWeek = fecha.getDay(); // 0=Domingo, 1=Lunes, etc.
    const newTimeOptions = [];
    let startHour = 0;
    let endHour = 0;

    // Horario del gimnasio (CDMX)
    switch (dayOfWeek) {
      case 1: case 2: case 3: case 4: // Lunes a Jueves
        startHour = 6;
        endHour = 22;
        break;
      case 5: // Viernes
        startHour = 6;
        endHour = 21;
        break;
      case 6: // Sábado
        startHour = 6;
        endHour = 14;
        break;
      case 0: // Domingo
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
    
    // 1. Crea la fecha en zona horaria local (CDMX)
    const localDate = new Date(`${date}T${time}:00`);
    
    // 2. Convierte a UTC para el backend
    const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
    
    // 3. Guarda en formato ISO sin modificar (UTC)
    formData.append('dateTime', utcDate.toISOString());

    try {
      await registerClass(formData);
      setResponseMessage({ 
        type: 'success', 
        message: 'Clase registrada con éxito.' 
      });
    } catch (err: any) {
      setResponseMessage({ 
        type: 'danger', 
        message: err.message || 'Error al registrar la clase.' 
      });
    }
  };

  return (
    <BsCard className="p-4 shadow-sm">
      <h3 className="text-center mb-4">Registrar Nueva Clase</h3>
      <Form onSubmit={handleFormSubmit}>
        <Form.Group className="mb-3" controlId="formClassName">
          <Form.Label className="d-block text-start fw-bold text-dark">
            Nombre de la Clase
          </Form.Label>
          <Form.Control 
            type="text" 
            name="className" 
            placeholder="Ej: Yoga Matutino" 
            required 
          />
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label className="d-block text-start fw-bold text-dark">
            Descripción
          </Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            name="description" 
            placeholder="Breve descripción de la clase" 
            required 
          />
        </Form.Group>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formDate">
              <Form.Label className="d-block text-start fw-bold text-dark">
                Fecha
              </Form.Label>
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
              <Form.Label className="d-block text-start fw-bold text-dark">
                Hora
              </Form.Label>
              <Form.Select 
                name="time" 
                required 
                value={selectedTime} 
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="">Selecciona la hora</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-4" controlId="formCapacity">
          <Form.Label className="d-block text-start fw-bold text-dark">
            Cupo
          </Form.Label>
          <Form.Control 
            type="number" 
            name="capacity" 
            min="1" 
            placeholder="Ej: 20" 
            required 
          />
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