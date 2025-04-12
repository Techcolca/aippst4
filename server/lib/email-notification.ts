import { Appointment } from '@shared/schema';
import * as sendgrid from '@sendgrid/mail';

// Configurar SendGrid API Key
if (process.env.SENDGRID_API_KEY) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Envía una notificación por correo electrónico usando SendGrid
 * @param options Opciones del correo electrónico
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API Key no está configurada. No se enviará el correo.');
      return false;
    }
    
    await sendgrid.send(options);
    return true;
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    return false;
  }
}

/**
 * Envía una confirmación de cita al visitante
 * @param appointment Datos de la cita
 * @param fromEmail Dirección de correo del remitente
 * @param companyName Nombre de la empresa
 */
export async function sendAppointmentConfirmation(
  appointment: Appointment,
  fromEmail: string,
  companyName: string
): Promise<boolean> {
  // Formatear la fecha y hora para mostrar
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('es-ES', dateOptions);
  
  // Construir el cuerpo del correo electrónico
  const emailOptions: EmailOptions = {
    from: fromEmail,
    to: appointment.visitorEmail,
    subject: `Confirmación de cita con ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Su cita ha sido confirmada</h2>
        <p>Hola ${appointment.visitorName},</p>
        <p>Le confirmamos que su cita ha sido programada exitosamente:</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${appointment.appointmentTime}</p>
          <p><strong>Duración:</strong> ${appointment.duration || 30} minutos</p>
          <p><strong>Propósito:</strong> ${appointment.purpose}</p>
          ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
        </div>
        
        <p>Si necesita modificar o cancelar su cita, por favor contáctenos respondiendo a este correo electrónico.</p>
        
        <p>Saludos cordiales,<br>${companyName}</p>
      </div>
    `
  };
  
  return await sendEmail(emailOptions);
}

/**
 * Envía un recordatorio de cita
 * @param appointment Datos de la cita
 * @param fromEmail Dirección de correo del remitente
 * @param companyName Nombre de la empresa
 */
export async function sendAppointmentReminder(
  appointment: Appointment,
  fromEmail: string,
  companyName: string
): Promise<boolean> {
  // Formatear la fecha y hora para mostrar
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('es-ES', dateOptions);
  
  // Construir el cuerpo del correo electrónico
  const emailOptions: EmailOptions = {
    from: fromEmail,
    to: appointment.visitorEmail,
    subject: `Recordatorio: Su cita con ${companyName} es mañana`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recordatorio de cita</h2>
        <p>Hola ${appointment.visitorName},</p>
        <p>Le recordamos que tiene una cita programada para mañana:</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${appointment.appointmentTime}</p>
          <p><strong>Duración:</strong> ${appointment.duration || 30} minutos</p>
          <p><strong>Propósito:</strong> ${appointment.purpose}</p>
          ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
        </div>
        
        <p>Si necesita modificar o cancelar su cita, por favor contáctenos lo antes posible.</p>
        
        <p>Saludos cordiales,<br>${companyName}</p>
      </div>
    `
  };
  
  return await sendEmail(emailOptions);
}