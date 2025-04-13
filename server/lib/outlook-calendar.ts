import axios from 'axios';
import { storage } from '../storage';
import { CalendarToken } from '@shared/schema';

// Constantes para la API de Microsoft Graph (Outlook)
const MS_OAUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MS_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MS_GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';
const MS_API_SCOPES = [
  'Calendars.ReadWrite',
  'offline_access'
];

// Cliente ID y secreto deben estar guardados como variables de entorno
const MS_CLIENT_ID = process.env.MS_CLIENT_ID;
const MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET;
const REDIRECT_URL = process.env.APP_URL ? `${process.env.APP_URL}/api/auth/outlook-calendar/callback` : 'https://localhost:5000/api/auth/outlook-calendar/callback';

/**
 * Genera la URL para autorización OAuth de Microsoft
 */
export function getOutlookAuthUrl(userId: number, state?: string): string {
  const params = new URLSearchParams({
    client_id: MS_CLIENT_ID!,
    redirect_uri: REDIRECT_URL,
    response_type: 'code',
    scope: MS_API_SCOPES.join(' '),
    response_mode: 'query',
    state: state || `user_id=${userId}`
  });

  return `${MS_OAUTH_URL}?${params.toString()}`;
}

/**
 * Intercambia el código de autorización por tokens de acceso y refresco
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  try {
    const formData = new URLSearchParams();
    formData.append('code', code);
    formData.append('client_id', MS_CLIENT_ID!);
    formData.append('client_secret', MS_CLIENT_SECRET!);
    formData.append('redirect_uri', REDIRECT_URL);
    formData.append('grant_type', 'authorization_code');

    const response = await axios.post(MS_TOKEN_URL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in
    };
  } catch (error) {
    console.error('Error intercambiando código por tokens de Outlook:', error);
    throw new Error('No se pudo obtener los tokens de acceso de Outlook');
  }
}

/**
 * Refresca el token de acceso usando el refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  try {
    const formData = new URLSearchParams();
    formData.append('client_id', MS_CLIENT_ID!);
    formData.append('client_secret', MS_CLIENT_SECRET!);
    formData.append('refresh_token', refreshToken);
    formData.append('grant_type', 'refresh_token');

    const response = await axios.post(MS_TOKEN_URL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error refrescando token de acceso de Outlook:', error);
    throw new Error('No se pudo refrescar el token de acceso de Outlook');
  }
}

/**
 * Obtiene un token de acceso válido, refrescándolo si es necesario
 */
export async function getValidAccessToken(calendarToken: CalendarToken): Promise<string> {
  // Verificar si el token ha expirado
  const now = new Date();
  const tokenExpiry = new Date(calendarToken.tokenExpiry!);

  if (now >= tokenExpiry && calendarToken.refreshToken) {
    // El token ha expirado, refrescar usando refresh token
    const newAccessToken = await refreshAccessToken(calendarToken.refreshToken);
    
    // Actualizar el token en la base de datos
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + 3600); // Típicamente 1 hora para Microsoft
    
    await storage.updateCalendarToken(calendarToken.id, {
      accessToken: newAccessToken,
      tokenExpiry: expiryTime
    });
    
    return newAccessToken;
  }
  
  return calendarToken.accessToken!;
}

/**
 * Crea un evento en Outlook Calendar (a través de Microsoft Graph API)
 */
export async function createOutlookCalendarEvent(
  calendarToken: CalendarToken,
  event: {
    subject: string; // Título del evento
    body: {
      contentType: string, // 'HTML' o 'Text'
      content: string
    };
    start: {
      dateTime: string, // ISO 8601 format
      timeZone: string
    };
    end: {
      dateTime: string, // ISO 8601 format
      timeZone: string
    };
    attendees?: Array<{
      emailAddress: {
        address: string;
        name?: string;
      };
      type: 'required' | 'optional' | 'resource';
    }>;
    isReminderOn?: boolean;
    reminderMinutesBeforeStart?: number;
  }
): Promise<{
  id: string;
  webLink: string; // URL al evento
}> {
  try {
    // Obtener un token de acceso válido
    const accessToken = await getValidAccessToken(calendarToken);
    
    // Crear el evento en Outlook Calendar
    const response = await axios.post(
      `${MS_GRAPH_API_URL}/me/events`,
      event,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      id: response.data.id,
      webLink: response.data.webLink
    };
  } catch (error) {
    console.error('Error creando evento en Outlook Calendar:', error);
    throw new Error('No se pudo crear el evento en Outlook Calendar');
  }
}

/**
 * Formatea un evento para Outlook Calendar basado en los datos de la cita
 */
export function formatOutlookCalendarEvent(
  appointmentData: {
    visitorName: string;
    visitorEmail: string;
    purpose: string;
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    notes?: string;
  }
): {
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
  attendees: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type: 'required' | 'optional' | 'resource';
  }>;
  isReminderOn: boolean;
  reminderMinutesBeforeStart: number;
} {
  // Calcular la fecha y hora de inicio
  const startDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
  
  // Calcular la fecha y hora de fin (duración en minutos)
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + (appointmentData.duration || 30));
  
  // Crear el objeto evento para Outlook Calendar
  return {
    subject: `Cita con ${appointmentData.visitorName}`,
    body: {
      contentType: 'HTML',
      content: `
        <p><strong>Propósito:</strong> ${appointmentData.purpose}</p>
        ${appointmentData.notes ? `<p><strong>Notas:</strong> ${appointmentData.notes}</p>` : ''}
        <p><em>Este evento fue creado automáticamente por AIPI.</em></p>
      `
    },
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'America/Chicago' // Usar la zona horaria configurada o una predeterminada
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'America/Chicago'
    },
    attendees: [
      {
        emailAddress: {
          address: appointmentData.visitorEmail,
          name: appointmentData.visitorName
        },
        type: 'required'
      }
    ],
    isReminderOn: true,
    reminderMinutesBeforeStart: 15
  };
}

/**
 * Actualiza un evento existente en Outlook Calendar
 */
export async function updateOutlookCalendarEvent(
  calendarToken: CalendarToken,
  eventId: string,
  event: {
    subject: string;
    body: {
      contentType: string,
      content: string
    };
    start: {
      dateTime: string,
      timeZone: string
    };
    end: {
      dateTime: string,
      timeZone: string
    };
    attendees?: Array<{
      emailAddress: {
        address: string;
        name?: string;
      };
      type: 'required' | 'optional' | 'resource';
    }>;
    isReminderOn?: boolean;
    reminderMinutesBeforeStart?: number;
  }
): Promise<{
  id: string;
  webLink: string;
}> {
  try {
    // Obtener un token de acceso válido
    const accessToken = await getValidAccessToken(calendarToken);
    
    // Actualizar el evento en Outlook Calendar
    const response = await axios.patch(
      `${MS_GRAPH_API_URL}/me/events/${eventId}`,
      event,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      id: response.data.id,
      webLink: response.data.webLink
    };
  } catch (error) {
    console.error('Error actualizando evento en Outlook Calendar:', error);
    throw new Error('No se pudo actualizar el evento en Outlook Calendar');
  }
}

/**
 * Elimina un evento de Outlook Calendar
 */
export async function deleteOutlookCalendarEvent(
  calendarToken: CalendarToken,
  eventId: string
): Promise<void> {
  try {
    // Obtener un token de acceso válido
    const accessToken = await getValidAccessToken(calendarToken);
    
    // Eliminar el evento de Outlook Calendar
    await axios.delete(
      `${MS_GRAPH_API_URL}/me/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error eliminando evento de Outlook Calendar:', error);
    throw new Error('No se pudo eliminar el evento de Outlook Calendar');
  }
}