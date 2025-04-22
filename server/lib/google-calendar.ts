import axios from 'axios';
import { storage } from '../storage';
import { CalendarToken } from '@shared/schema';

// Constantes para la API de Google Calendar
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_API_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Cliente ID y secreto deben estar guardados como variables de entorno
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Determinar la URL de redireccionamiento basada en el entorno
// Usamos un método en lugar de una constante para poder actualizar dinámicamente la URL 
// según el entorno actual
function getRedirectUrl(req?: any, customUrl?: string): string {
  // Si se proporciona una URL personalizada, usarla con la prioridad más alta
  if (customUrl && customUrl.trim()) {
    console.log(`Usando URL personalizada: ${customUrl}`);
    return customUrl;
  }

  // Usamos el hostname de la solicitud actual si está disponible
  if (req && req.headers && req.headers.host) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    console.log(`Usando URL de redirección dinámica: ${protocol}://${req.headers.host}/api/auth/google-calendar/callback`);
    return `${protocol}://${req.headers.host}/api/auth/google-calendar/callback`;
  }
  
  // Si APP_URL está definido, usarlo (prioridad media)
  if (process.env.APP_URL) {
    console.log(`Usando APP_URL: ${process.env.APP_URL}/api/auth/google-calendar/callback`);
    return `${process.env.APP_URL}/api/auth/google-calendar/callback`;
  }
  
  // Construir URL basada en información de Replit (prioridad baja)
  const replitId = process.env.REPL_ID || '';
  if (replitId) {
    const url = `https://${replitId}-00.picard.replit.dev/api/auth/google-calendar/callback`;
    console.log(`Usando URL de Replit ID: ${url}`);
    return url;
  }
  
  // URL por defecto como último recurso
  console.log('Usando URL por defecto: https://localhost:5000/api/auth/google-calendar/callback');
  return 'https://localhost:5000/api/auth/google-calendar/callback';
}

// Variable para almacenar la URL actual (se actualizará en cada solicitud)
let REDIRECT_URL = getRedirectUrl();

/**
 * Genera la URL para autorización OAuth de Google
 */
export function getGoogleAuthUrl(userId: number, state?: string, req?: any, customUrl?: string): string {
  // Actualizar la URL de redirección con la solicitud actual o URL personalizada
  if (customUrl || req) {
    REDIRECT_URL = getRedirectUrl(req, customUrl);
    console.log("INFO REDIRECCIÓN GOOGLE CALENDAR:");
    console.log("URL de autorización:", REDIRECT_URL);
    console.log("REDIRECT_URL completa:", encodeURIComponent(REDIRECT_URL));
  }
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: REDIRECT_URL,
    response_type: 'code',
    scope: GOOGLE_API_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent', // Para asegurar que siempre obtenemos refresh token
    state: state || `user_id=${userId}`
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
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
    const response = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URL,
      grant_type: 'authorization_code'
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in
    };
  } catch (error) {
    console.error('Error intercambiando código por tokens:', error);
    throw new Error('No se pudo obtener los tokens de acceso');
  }
}

/**
 * Refresca el token de acceso usando el refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  try {
    const response = await axios.post(GOOGLE_TOKEN_URL, {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error refrescando token de acceso:', error);
    throw new Error('No se pudo refrescar el token de acceso');
  }
}

/**
 * Obtiene un token de acceso válido, refrescándolo si es necesario
 */
export async function getValidAccessToken(calendarToken: CalendarToken): Promise<string> {
  // Verificar si el token ha expirado
  const now = new Date();
  const tokenExpiry = new Date(calendarToken.expiresAt!);

  if (now >= tokenExpiry && calendarToken.refreshToken) {
    // El token ha expirado, refrescar usando refresh token
    const newAccessToken = await refreshAccessToken(calendarToken.refreshToken);
    
    // Actualizar el token en la base de datos
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 3600); // Típicamente 1 hora para Google
    
    await storage.updateCalendarToken(calendarToken.id, {
      accessToken: newAccessToken,
      expiresAt: expiresAt
    });
    
    return newAccessToken;
  }
  
  return calendarToken.accessToken!;
}

/**
 * Crea un evento en Google Calendar
 */
export async function createGoogleCalendarEvent(
  calendarToken: CalendarToken,
  event: {
    summary: string; // Título del evento
    description: string;
    start: {
      dateTime: string; // ISO 8601 format
      timeZone: string;
    };
    end: {
      dateTime: string; // ISO 8601 format
      timeZone: string;
    };
    attendees?: Array<{ email: string }>;
    reminders?: {
      useDefault: boolean;
      overrides?: Array<{ method: string; minutes: number }>
    };
  }
): Promise<{
  id: string;
  htmlLink: string; // URL al evento
}> {
  try {
    // Obtener un token de acceso válido
    const accessToken = await getValidAccessToken(calendarToken);
    
    // Crear el evento en Google Calendar
    const response = await axios.post(
      `${GOOGLE_CALENDAR_API_URL}/calendars/primary/events`,
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
      htmlLink: response.data.htmlLink
    };
  } catch (error) {
    console.error('Error creando evento en Google Calendar:', error);
    throw new Error('No se pudo crear el evento en Google Calendar');
  }
}

/**
 * Formatea un evento para Google Calendar basado en los datos de la cita
 */
export function formatGoogleCalendarEvent(
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
  attendees: Array<{ email: string }>;
  reminders: {
    useDefault: boolean;
    overrides: Array<{ method: string; minutes: number }>
  };
} {
  // Calcular la fecha y hora de inicio
  const [hours, minutes] = appointmentData.appointmentTime.split(':').map(Number);
  const startDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
  
  // Calcular la fecha y hora de fin (duración en minutos)
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + (appointmentData.duration || 30));
  
  // Crear el objeto evento para Google Calendar
  return {
    summary: `Cita con ${appointmentData.visitorName}`,
    description: `
Propósito: ${appointmentData.purpose}
${appointmentData.notes ? 'Notas: ' + appointmentData.notes : ''}

Este evento fue creado automáticamente por AIPI.
    `.trim(),
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'America/Chicago' // Usar la zona horaria configurada o una predeterminada
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'America/Chicago'
    },
    attendees: [
      { email: appointmentData.visitorEmail }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 }
      ]
    }
  };
}

/**
 * Actualiza un evento existente en Google Calendar
 */
export async function updateGoogleCalendarEvent(
  calendarToken: CalendarToken,
  eventId: string,
  event: {
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
    attendees?: Array<{ email: string }>;
    reminders?: {
      useDefault: boolean;
      overrides?: Array<{ method: string; minutes: number }>
    };
  }
): Promise<{
  id: string;
  htmlLink: string;
}> {
  try {
    // Obtener un token de acceso válido
    const accessToken = await getValidAccessToken(calendarToken);
    
    // Actualizar el evento en Google Calendar
    const response = await axios.patch(
      `${GOOGLE_CALENDAR_API_URL}/calendars/primary/events/${eventId}`,
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
      htmlLink: response.data.htmlLink
    };
  } catch (error) {
    console.error('Error actualizando evento en Google Calendar:', error);
    throw new Error('No se pudo actualizar el evento en Google Calendar');
  }
}

/**
 * Elimina un evento de Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  calendarToken: CalendarToken,
  eventId: string
): Promise<void> {
  try {
    // Obtener un token de acceso válido
    const accessToken = await getValidAccessToken(calendarToken);
    
    // Eliminar el evento de Google Calendar
    await axios.delete(
      `${GOOGLE_CALENDAR_API_URL}/calendars/primary/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error eliminando evento de Google Calendar:', error);
    throw new Error('No se pudo eliminar el evento de Google Calendar');
  }
}