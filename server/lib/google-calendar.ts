import axios from 'axios';
import { Appointment } from '@shared/schema';

interface GoogleCalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: {
    email: string;
    name?: string;
  }[];
  reminders: {
    useDefault: boolean;
    overrides?: {
      method: string;
      minutes: number;
    }[];
  };
}

/**
 * Crea un evento en Google Calendar 
 * 
 * @param appointment Datos de la cita
 * @param userEmail Email del propietario del calendario
 * @param accessToken Token de acceso de OAuth
 * @returns ID del evento creado
 */
export async function createGoogleCalendarEvent(
  appointment: Appointment,
  userEmail: string,
  accessToken: string
): Promise<string> {
  try {
    // Construir la fecha y hora de inicio
    const startDateTime = new Date(appointment.appointmentDate);
    const startTime = appointment.appointmentTime.split(':');
    startDateTime.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0, 0);
    
    // Construir la fecha y hora de fin (basado en la duración)
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + (appointment.duration || 30));
    
    // Crear el objeto de evento para Google Calendar
    const event: GoogleCalendarEvent = {
      summary: `Cita con ${appointment.visitorName}`,
      description: appointment.purpose + (appointment.notes ? `\n\nNotas: ${appointment.notes}` : ''),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Toronto'  // Ajustar según la zona horaria necesaria
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Toronto'  // Ajustar según la zona horaria necesaria
      },
      attendees: [
        { email: appointment.visitorEmail, name: appointment.visitorName },
        { email: userEmail }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },  // Recordatorio por email 24 horas antes
          { method: 'popup', minutes: 30 }  // Recordatorio emergente 30 minutos antes
        ]
      }
    };
    
    // Enviar solicitud a la API de Google Calendar
    const response = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      event,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.id;
  } catch (error) {
    console.error('Error al crear evento en Google Calendar:', error);
    throw new Error('No se pudo crear el evento en Google Calendar');
  }
}

/**
 * Actualiza un evento en Google Calendar
 * 
 * @param appointment Datos actualizados de la cita
 * @param eventId ID del evento en Google Calendar
 * @param accessToken Token de acceso OAuth
 */
export async function updateGoogleCalendarEvent(
  appointment: Appointment,
  eventId: string,
  accessToken: string
): Promise<void> {
  try {
    // Similar a createGoogleCalendarEvent, pero con una solicitud PATCH
    const startDateTime = new Date(appointment.appointmentDate);
    const startTime = appointment.appointmentTime.split(':');
    startDateTime.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + (appointment.duration || 30));
    
    // Datos actualizados para el evento
    const updatedEvent = {
      summary: `Cita con ${appointment.visitorName}`,
      description: appointment.purpose + (appointment.notes ? `\n\nNotas: ${appointment.notes}` : ''),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Toronto'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Toronto'
      }
    };
    
    // Enviar solicitud de actualización
    await axios.patch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      updatedEvent,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error al actualizar evento en Google Calendar:', error);
    throw new Error('No se pudo actualizar el evento en Google Calendar');
  }
}

/**
 * Cancela un evento en Google Calendar
 * 
 * @param eventId ID del evento en Google Calendar
 * @param accessToken Token de acceso OAuth
 */
export async function cancelGoogleCalendarEvent(
  eventId: string,
  accessToken: string
): Promise<void> {
  try {
    await axios.delete(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
  } catch (error) {
    console.error('Error al cancelar evento en Google Calendar:', error);
    throw new Error('No se pudo cancelar el evento en Google Calendar');
  }
}