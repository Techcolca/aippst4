/**
 * Módulo para envío de notificaciones por email
 */
import { Appointment, Settings } from '@shared/schema';
import { storage } from '../storage';
import sgMail from '@sendgrid/mail';

// Configurar SendGrid API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Envía un email de confirmación de cita al visitante y al propietario
 * 
 * @param appointment Datos de la cita
 * @param userEmail Email del propietario/organizador
 * @param settings Configuración del usuario
 */
export async function sendAppointmentConfirmation(
  appointment: Appointment,
  userEmail: string,
  settings: Settings
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Cannot send email notifications.');
    return;
  }
  
  try {
    const assistantName = settings?.assistantName || 'AIPI Assistant';
    const date = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const formattedDate = date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Email al visitante
    await sgMail.send({
      to: appointment.visitorEmail,
      from: userEmail,
      subject: `Confirmación de cita: ${appointment.purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Confirmación de Cita</h2>
          <p>Hola ${appointment.visitorName},</p>
          <p>Tu cita ha sido confirmada con los siguientes detalles:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Asunto:</strong> ${appointment.purpose}</p>
            <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
            <p><strong>Duración:</strong> ${appointment.duration || 30} minutos</p>
            ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
          </div>
          <p>Puedes agregar esta cita a tu calendario utilizando el archivo adjunto.</p>
          <p>Si necesitas hacer cambios, por favor contáctanos respondiendo a este email.</p>
          <p>¡Gracias!</p>
        </div>
      `
    });
    
    // Email al propietario/organizador
    if (settings.emailNotificationAddress) {
      await sgMail.send({
        to: settings.emailNotificationAddress,
        from: userEmail,
        subject: `Nueva cita programada: ${appointment.purpose}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Nueva Cita Programada</h2>
            <p>Se ha programado una nueva cita a través del asistente ${assistantName}:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Visitante:</strong> ${appointment.visitorName} (${appointment.visitorEmail})</p>
              <p><strong>Asunto:</strong> ${appointment.purpose}</p>
              <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
              <p><strong>Duración:</strong> ${appointment.duration || 30} minutos</p>
              ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
            </div>
            <p>Esta cita ha sido añadida a tu calendario.</p>
          </div>
        `
      });
    }
    
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw new Error('Failed to send appointment confirmation email');
  }
}

/**
 * Envía un recordatorio de cita al visitante
 * 
 * @param appointment Datos de la cita
 * @param userEmail Email del propietario/organizador
 */
export async function sendAppointmentReminder(
  appointment: Appointment,
  userEmail: string
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Cannot send email notifications.');
    return;
  }
  
  try {
    const date = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const formattedDate = date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Email de recordatorio al visitante
    await sgMail.send({
      to: appointment.visitorEmail,
      from: userEmail,
      subject: `Recordatorio de cita: ${appointment.purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Recordatorio de Cita</h2>
          <p>Hola ${appointment.visitorName},</p>
          <p>Te recordamos que tienes una cita programada para mañana:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Asunto:</strong> ${appointment.purpose}</p>
            <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
            <p><strong>Duración:</strong> ${appointment.duration || 30} minutos</p>
            ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
          </div>
          <p>Si necesitas reprogramar o cancelar, por favor contáctanos lo antes posible.</p>
          <p>¡Gracias!</p>
        </div>
      `
    });
    
  } catch (error) {
    console.error('Error sending appointment reminder email:', error);
    throw new Error('Failed to send appointment reminder email');
  }
}

/**
 * Envía una notificación de actualización de cita
 * 
 * @param appointment Datos actualizados de la cita
 * @param userEmail Email del propietario/organizador
 * @param changes Descripción de los cambios realizados
 */
export async function sendAppointmentUpdateNotification(
  appointment: Appointment,
  userEmail: string,
  changes: string
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Cannot send email notifications.');
    return;
  }
  
  try {
    const date = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const formattedDate = date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Email de notificación de actualización
    await sgMail.send({
      to: appointment.visitorEmail,
      from: userEmail,
      subject: `Actualización de cita: ${appointment.purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Actualización de Cita</h2>
          <p>Hola ${appointment.visitorName},</p>
          <p>Ha habido cambios en tu cita:</p>
          <p style="background-color: #fff3cd; padding: 10px; border-radius: 5px;">${changes}</p>
          <p>Los detalles actualizados son:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Asunto:</strong> ${appointment.purpose}</p>
            <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
            <p><strong>Duración:</strong> ${appointment.duration || 30} minutos</p>
            ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ''}
          </div>
          <p>Hemos actualizado la invitación del calendario.</p>
          <p>Si tienes alguna pregunta, por favor contáctanos respondiendo a este email.</p>
          <p>¡Gracias!</p>
        </div>
      `
    });
    
  } catch (error) {
    console.error('Error sending appointment update notification:', error);
    throw new Error('Failed to send appointment update notification');
  }
}

/**
 * Envía una notificación de cancelación de cita
 * 
 * @param appointment Datos de la cita cancelada
 * @param userEmail Email del propietario/organizador
 * @param reason Motivo de la cancelación
 */
export async function sendAppointmentCancellationNotification(
  appointment: Appointment,
  userEmail: string,
  reason?: string
): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Cannot send email notifications.');
    return;
  }
  
  try {
    const date = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const formattedDate = date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Email de notificación de cancelación
    await sgMail.send({
      to: appointment.visitorEmail,
      from: userEmail,
      subject: `Cancelación de cita: ${appointment.purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Cancelación de Cita</h2>
          <p>Hola ${appointment.visitorName},</p>
          <p>Lamentamos informarte que la siguiente cita ha sido cancelada:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Asunto:</strong> ${appointment.purpose}</p>
            <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
          </div>
          ${reason ? `<p><strong>Motivo de la cancelación:</strong> ${reason}</p>` : ''}
          <p>Para reprogramar, por favor contáctanos o programa una nueva cita a través de nuestro asistente.</p>
          <p>Disculpamos cualquier inconveniente que esto pueda causarte.</p>
          <p>¡Gracias por tu comprensión!</p>
        </div>
      `
    });
    
  } catch (error) {
    console.error('Error sending appointment cancellation notification:', error);
    throw new Error('Failed to send appointment cancellation notification');
  }
}