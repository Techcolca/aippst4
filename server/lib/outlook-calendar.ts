/**
 * Módulo de integración con Outlook Calendar
 */
import axios from 'axios';
import { Appointment } from '@shared/schema';

interface OutlookCalendarEvent {
  subject: string;
  body: {
    contentType: string;
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: {
    emailAddress: {
      address: string;
      name?: string;
    };
    type: string;
  }[];
  isReminderOn: boolean;
  reminderMinutesBeforeStart: number;
}

/**
 * Crea un evento en Outlook Calendar 
 * 
 * @param appointment Datos de la cita
 * @param userEmail Email del propietario del calendario
 * @param accessToken Token de acceso de OAuth
 * @returns ID del evento creado
 */
export async function createOutlookCalendarEvent(
  appointment: Appointment, 
  userEmail: string, 
  accessToken: string
): Promise<string> {
  try {
    // Construir el objeto con los datos del evento
    const startDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (appointment.duration || 30) * 60000);
    
    const event: OutlookCalendarEvent = {
      subject: `Cita: ${appointment.purpose}`,
      body: {
        contentType: 'HTML',
        content: `<p>Cita con ${appointment.visitorName}.</p><p>${appointment.notes || ''}</p>`
      },
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC'
      },
      attendees: [
        {
          emailAddress: {
            address: appointment.visitorEmail,
            name: appointment.visitorName
          },
          type: 'required'
        },
        {
          emailAddress: {
            address: userEmail
          },
          type: 'required'
        }
      ],
      isReminderOn: true,
      reminderMinutesBeforeStart: 15
    };
    
    // Hacer la solicitud a la API de Microsoft Graph
    const response = await axios.post(
      'https://graph.microsoft.com/v1.0/me/events',
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
    console.error('Error creating Outlook Calendar event:', error);
    throw new Error('Failed to create Outlook Calendar event');
  }
}

/**
 * Actualiza un evento en Outlook Calendar
 * 
 * @param appointment Datos actualizados de la cita
 * @param eventId ID del evento en Outlook Calendar
 * @param accessToken Token de acceso OAuth
 */
export async function updateOutlookCalendarEvent(
  appointment: Appointment, 
  eventId: string, 
  accessToken: string
): Promise<void> {
  try {
    // Construir el objeto con los datos actualizados del evento
    const startDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (appointment.duration || 30) * 60000);
    
    const event = {
      subject: `Cita: ${appointment.purpose}`,
      body: {
        contentType: 'HTML',
        content: `<p>Cita con ${appointment.visitorName}.</p><p>${appointment.notes || ''}</p>`
      },
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC'
      }
    };
    
    // Hacer la solicitud a la API de Microsoft Graph
    await axios.patch(
      `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      event,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('Error updating Outlook Calendar event:', error);
    throw new Error('Failed to update Outlook Calendar event');
  }
}

/**
 * Cancela un evento en Outlook Calendar
 * 
 * @param eventId ID del evento en Outlook Calendar
 * @param accessToken Token de acceso OAuth
 */
export async function cancelOutlookCalendarEvent(
  eventId: string, 
  accessToken: string
): Promise<void> {
  try {
    // Hacer la solicitud a la API de Microsoft Graph
    await axios.delete(
      `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
  } catch (error) {
    console.error('Error canceling Outlook Calendar event:', error);
    throw new Error('Failed to cancel Outlook Calendar event');
  }
}