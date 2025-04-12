/**
 * Módulo de integración con Google Calendar
 */
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
    // Construir el objeto con los datos del evento
    const startDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (appointment.duration || 30) * 60000);
    
    const event: GoogleCalendarEvent = {
      summary: `Cita: ${appointment.purpose}`,
      description: `Cita con ${appointment.visitorName}.\n${appointment.notes || ''}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC'
      },
      attendees: [
        { email: appointment.visitorEmail, name: appointment.visitorName },
        { email: userEmail }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // Recordatorio por email 24 horas antes
          { method: 'popup', minutes: 30 } // Recordatorio popup 30 minutos antes
        ]
      }
    };
    
    // Hacer la solicitud a la API de Google Calendar
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
    
    // Devolver el ID del evento creado
    return response.data.id;
    
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw new Error('Failed to create Google Calendar event');
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
    // Construir el objeto con los datos actualizados del evento
    const startDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (appointment.duration || 30) * 60000);
    
    const event = {
      summary: `Cita: ${appointment.purpose}`,
      description: `Cita con ${appointment.visitorName}.\n${appointment.notes || ''}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC'
      }
    };
    
    // Hacer la solicitud a la API de Google Calendar
    await axios.patch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      event,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw new Error('Failed to update Google Calendar event');
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
    // Hacer la solicitud a la API de Google Calendar
    await axios.delete(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
  } catch (error) {
    console.error('Error canceling Google Calendar event:', error);
    throw new Error('Failed to cancel Google Calendar event');
  }
}