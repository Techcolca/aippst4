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
  location: {
    displayName: string;
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
 * @param accessToken Token de acceso de OAuth para Microsoft Graph
 * @returns ID del evento creado
 */
export async function createOutlookCalendarEvent(
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
    
    // Crear el objeto de evento para Outlook Calendar
    const event: OutlookCalendarEvent = {
      subject: `Cita con ${appointment.visitorName}`,
      body: {
        contentType: 'HTML',
        content: `<p>${appointment.purpose}</p>${appointment.notes ? `<p>Notas: ${appointment.notes}</p>` : ''}`
      },
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Toronto'  // Ajustar según la zona horaria necesaria
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Toronto'  // Ajustar según la zona horaria necesaria
      },
      location: {
        displayName: 'Virtual'
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
    
    // Enviar solicitud a Microsoft Graph API
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
    
    return response.data.id;
  } catch (error) {
    console.error('Error al crear evento en Outlook Calendar:', error);
    throw new Error('No se pudo crear el evento en Outlook Calendar');
  }
}

/**
 * Actualiza un evento en Outlook Calendar
 * 
 * @param appointment Datos actualizados de la cita
 * @param eventId ID del evento en Outlook Calendar
 * @param accessToken Token de acceso OAuth para Microsoft Graph
 */
export async function updateOutlookCalendarEvent(
  appointment: Appointment,
  eventId: string,
  accessToken: string
): Promise<void> {
  try {
    // Similar a createOutlookCalendarEvent, pero con una solicitud PATCH
    const startDateTime = new Date(appointment.appointmentDate);
    const startTime = appointment.appointmentTime.split(':');
    startDateTime.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + (appointment.duration || 30));
    
    // Datos actualizados para el evento
    const updatedEvent = {
      subject: `Cita con ${appointment.visitorName}`,
      body: {
        contentType: 'HTML',
        content: `<p>${appointment.purpose}</p>${appointment.notes ? `<p>Notas: ${appointment.notes}</p>` : ''}`
      },
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
      `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      updatedEvent,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error al actualizar evento en Outlook Calendar:', error);
    throw new Error('No se pudo actualizar el evento en Outlook Calendar');
  }
}

/**
 * Cancela un evento en Outlook Calendar
 * 
 * @param eventId ID del evento en Outlook Calendar
 * @param accessToken Token de acceso OAuth para Microsoft Graph
 */
export async function cancelOutlookCalendarEvent(
  eventId: string,
  accessToken: string
): Promise<void> {
  try {
    await axios.delete(
      `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
  } catch (error) {
    console.error('Error al cancelar evento en Outlook Calendar:', error);
    throw new Error('No se pudo cancelar el evento en Outlook Calendar');
  }
}