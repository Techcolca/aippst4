/**
 * Módulo para envío de notificaciones por email usando AWS SES
 */
import { Appointment, Settings } from '@shared/schema';
import { storage } from '../storage';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Configuración de AWS SES
function configureSES() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('AWS credentials not configured. Cannot send email notifications.');
    return null;
  }

  return new SESClient({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION || 'us-east-1'
  });
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
  const ses = configureSES();
  if (!ses) return;
  
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
    
    // HTML para el email
    const htmlBody = `
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
        <p>Si necesitas hacer cambios, por favor contáctanos respondiendo a este email.</p>
        <p>¡Gracias!</p>
      </div>
    `;
    
    // Texto plano como alternativa
    const textBody = `
      Confirmación de Cita

      Hola ${appointment.visitorName},
      
      Tu cita ha sido confirmada con los siguientes detalles:
      
      Asunto: ${appointment.purpose}
      Fecha y hora: ${formattedDate}
      Duración: ${appointment.duration || 30} minutos
      ${appointment.notes ? `Notas: ${appointment.notes}` : ''}
      
      Si necesitas hacer cambios, por favor contáctanos respondiendo a este email.
      
      ¡Gracias!
    `;
    
    // Parámetros para enviar email al visitante
    const visitorEmailParams = {
      Source: userEmail,
      Destination: {
        ToAddresses: [appointment.visitorEmail]
      },
      Message: {
        Subject: {
          Data: `Confirmación de cita: ${appointment.purpose}`,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: textBody,
            Charset: 'UTF-8'
          },
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    // Enviar email al visitante
    const visitorCommand = new SendEmailCommand(visitorEmailParams);
    await ses.send(visitorCommand);
    
    // Email al propietario/organizador si está configurado
    if (settings.emailNotificationAddress) {
      const ownerHtmlBody = `
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
      `;
      
      const ownerTextBody = `
        Nueva Cita Programada
        
        Se ha programado una nueva cita a través del asistente ${assistantName}:
        
        Visitante: ${appointment.visitorName} (${appointment.visitorEmail})
        Asunto: ${appointment.purpose}
        Fecha y hora: ${formattedDate}
        Duración: ${appointment.duration || 30} minutos
        ${appointment.notes ? `Notas: ${appointment.notes}` : ''}
        
        Esta cita ha sido añadida a tu calendario.
      `;
      
      const ownerEmailParams = {
        Source: userEmail,
        Destination: {
          ToAddresses: [settings.emailNotificationAddress]
        },
        Message: {
          Subject: {
            Data: `Nueva cita programada: ${appointment.purpose}`,
            Charset: 'UTF-8'
          },
          Body: {
            Text: {
              Data: ownerTextBody,
              Charset: 'UTF-8'
            },
            Html: {
              Data: ownerHtmlBody,
              Charset: 'UTF-8'
            }
          }
        }
      };
      
      const ownerCommand = new SendEmailCommand(ownerEmailParams);
      await ses.send(ownerCommand);
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
  const ses = configureSES();
  if (!ses) return;
  
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
    
    // HTML para el email
    const htmlBody = `
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
    `;
    
    // Texto plano como alternativa
    const textBody = `
      Recordatorio de Cita
      
      Hola ${appointment.visitorName},
      
      Te recordamos que tienes una cita programada para mañana:
      
      Asunto: ${appointment.purpose}
      Fecha y hora: ${formattedDate}
      Duración: ${appointment.duration || 30} minutos
      ${appointment.notes ? `Notas: ${appointment.notes}` : ''}
      
      Si necesitas reprogramar o cancelar, por favor contáctanos lo antes posible.
      
      ¡Gracias!
    `;
    
    // Parámetros para enviar email
    const params = {
      Source: userEmail,
      Destination: {
        ToAddresses: [appointment.visitorEmail]
      },
      Message: {
        Subject: {
          Data: `Recordatorio de cita: ${appointment.purpose}`,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: textBody,
            Charset: 'UTF-8'
          },
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    const command = new SendEmailCommand(params);
    await ses.send(command);
    
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
  const ses = configureSES();
  if (!ses) return;
  
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
    
    // HTML para el email
    const htmlBody = `
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
    `;
    
    // Texto plano como alternativa
    const textBody = `
      Actualización de Cita
      
      Hola ${appointment.visitorName},
      
      Ha habido cambios en tu cita:
      
      ${changes}
      
      Los detalles actualizados son:
      
      Asunto: ${appointment.purpose}
      Fecha y hora: ${formattedDate}
      Duración: ${appointment.duration || 30} minutos
      ${appointment.notes ? `Notas: ${appointment.notes}` : ''}
      
      Hemos actualizado la invitación del calendario.
      
      Si tienes alguna pregunta, por favor contáctanos respondiendo a este email.
      
      ¡Gracias!
    `;
    
    // Parámetros para enviar email
    const params = {
      Source: userEmail,
      Destination: {
        ToAddresses: [appointment.visitorEmail]
      },
      Message: {
        Subject: {
          Data: `Actualización de cita: ${appointment.purpose}`,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: textBody,
            Charset: 'UTF-8'
          },
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    const command = new SendEmailCommand(params);
    await ses.send(command);
    
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
  const ses = configureSES();
  if (!ses) return;
  
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
    
    // HTML para el email
    const htmlBody = `
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
    `;
    
    // Texto plano como alternativa
    const textBody = `
      Cancelación de Cita
      
      Hola ${appointment.visitorName},
      
      Lamentamos informarte que la siguiente cita ha sido cancelada:
      
      Asunto: ${appointment.purpose}
      Fecha y hora: ${formattedDate}
      
      ${reason ? `Motivo de la cancelación: ${reason}` : ''}
      
      Para reprogramar, por favor contáctanos o programa una nueva cita a través de nuestro asistente.
      
      Disculpamos cualquier inconveniente que esto pueda causarte.
      
      ¡Gracias por tu comprensión!
    `;
    
    // Parámetros para enviar email
    const params = {
      Source: userEmail,
      Destination: {
        ToAddresses: [appointment.visitorEmail]
      },
      Message: {
        Subject: {
          Data: `Cancelación de cita: ${appointment.purpose}`,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: textBody,
            Charset: 'UTF-8'
          },
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    const command = new SendEmailCommand(params);
    await ses.send(command);
    
  } catch (error) {
    console.error('Error sending appointment cancellation notification:', error);
    throw new Error('Failed to send appointment cancellation notification');
  }
}