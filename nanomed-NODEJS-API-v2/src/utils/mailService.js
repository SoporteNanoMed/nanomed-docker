const FormData = require("form-data");
const Mailgun = require("mailgun.js");
const config = require("../../config");

class MailService {
  constructor() {
    this.mailgun = null;
    this.mg = null;
    this.isConfigured = false;
    this.initializeMailgun();
  }

  // Método para obtener el HTML del mapa de ubicación
  getMapHTML() {
    return `
      <div style="text-align: center; margin: 20px 0;">
        <h4 style="color: #111726; margin-bottom: 15px;">🗺️ Nuestra Ubicación</h4>
        <div style="border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 0 auto; max-width: 400px;">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3435.659898985756!2d-70.96386472432742!3d-31.78412747409431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9688cf9b7c674421%3A0xbee589d5fd78183b!2sJos%C3%A9%20Joaqu%C3%ADn%20P%C3%A9rez%20240%2C%20Salamanca%2C%20Coquimbo!5e1!3m2!1ses-419!2scl!4v1751591193133!5m2!1ses-419!2scl" width="400" height="300" style="border:0; width: 100%; max-width: 400px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    `;
  }

  initializeMailgun() {
    try {
      if (!config.mailgun.apiKey || !config.mailgun.domain) {
        console.warn("Mailgun no está configurado. Usando modo de desarrollo con logs.");
        this.isConfigured = false;
        return;
      }

      this.mailgun = new Mailgun(FormData);
      this.mg = this.mailgun.client({
        username: "api",
        key: config.mailgun.apiKey,
        // Para dominios de EU descomenta la siguiente línea:
        // url: "https://api.eu.mailgun.net"
      });

      this.isConfigured = true;
      console.log("Mailgun configurado correctamente");
    } catch (error) {
      console.error("Error al configurar Mailgun:", error);
      this.isConfigured = false;
    }
  }

  async sendMail(options) {
    try {
      if (!this.isConfigured) {
        // Modo de desarrollo - solo registrar en consola
        console.log("=== EMAIL QUE SE ENVIARÍA (NO CONFIGURADO) ===");
        console.log("De:", options.from || config.mailgun.from);
        console.log("Para:", options.to);
        console.log("Asunto:", options.subject);
        console.log("Contenido HTML:", options.html || "No especificado");
        console.log("Contenido Texto:", options.text || "No especificado");
        console.log("=============================================");
        
        return { 
          messageId: "dev_" + Date.now(),
          status: "development_mode"
        };
      }

      const mailData = {
        from: options.from || config.mailgun.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        text: options.text,
      };

      // Agregar HTML si está presente
      if (options.html) {
        mailData.html = options.html;
      }

      const response = await this.mg.messages.create(config.mailgun.domain, mailData);
      
      console.log("Email enviado exitosamente:", response.id);
      return {
        messageId: response.id,
        status: "sent"
      };

    } catch (error) {
      // Detectar errores de cuenta gratuita de Mailgun y pasar a modo de desarrollo
      if (error.status === 403 && error.details && error.details.includes('Free accounts are for test purposes only')) {
        console.warn("⚠️ Cuenta Mailgun gratuita detectada - cambiando a modo de desarrollo");
        console.log("=== EMAIL QUE SE ENVIARÍA (MODO FALLBACK) ===");
        console.log("De:", options.from || config.mailgun.from);
        console.log("Para:", options.to);
        console.log("Asunto:", options.subject);
        console.log("Motivo del fallback:", error.details);
        console.log("============================================");
        
        return { 
          messageId: "fallback_" + Date.now(),
          status: "development_fallback",
          originalError: error.details
        };
      }
      
      console.error("Error al enviar email con Mailgun:", error);
      throw error;
    }
  }

  // Método para enviar email de verificación
  async sendVerificationEmail(email, token, name) {
    const verificationLink = `${config.app.clientUrl}/verify-email/${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verificación de Email - nanoMED</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #111726; 
            margin: 0; 
            padding: 0; 
            background-color: #f0f6f7;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 10px; 
            box-shadow: 0 4px 10px rgba(17, 23, 38, 0.1); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #59c3ed 0%, #479cd0 100%); 
            color: #ffffff; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600; 
          }
          .content { 
            padding: 30px; 
            background-color: #ffffff; 
          }
          .content h2 { 
            color: #111726; 
            font-size: 24px; 
            margin-bottom: 20px; 
          }
          .content p { 
            color: #7b7b7b; 
            margin-bottom: 15px; 
            font-size: 16px; 
          }
          .button { 
            display: inline-block; 
            padding: 15px 30px; 
            background: linear-gradient(135deg, #59c3ed 0%, #0797b3 100%); 
            color: #ffffff; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 25px 0; 
            font-weight: 600; 
            font-size: 16px; 
            transition: all 0.3s ease; 
          }
          .button:hover { 
            background: linear-gradient(135deg, #479cd0 0%, #0797b3 100%); 
          }
          .link-text { 
            color: #0797b3; 
            word-break: break-all; 
            font-size: 14px; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background-color: #f0f6f7; 
            border-top: 1px solid #aef4ff; 
            font-size: 14px; 
            color: #7b7b7b; 
          }
          .highlight-box { 
            background-color: #aef4ff; 
            border-left: 4px solid #59c3ed; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 0 5px 5px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a nanoMED!</h1>
          </div>
          <div style="text-align: center; margin-bottom: 20px; padding-top: 30px;">
            <img src="https://publicblobnanomed.blob.core.windows.net/general/logo.png" alt="nanoMED Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
          </div>
          <div class="content">
            <h2>Hola ${name || 'Usuario'},</h2>
            <p>Te damos la bienvenida a <strong>nanoMED</strong>, tu plataforma de salud ocupacional de confianza.</p>
            <p>Para completar tu registro y acceder a todos nuestros servicios médicos, necesitas verificar tu dirección de correo electrónico.</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verificar mi cuenta</a>
            </div>
            
            <div class="highlight-box">
              <p style="margin: 0; color: #111726;"><strong>Importante:</strong> Este enlace expirará en 24 horas por motivos de seguridad.</p>
            </div>
            
            <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
            <p class="link-text">${verificationLink}</p>
            
            <p style="margin-top: 30px; font-size: 14px;">Si no creaste una cuenta en nanoMED, puedes ignorar este correo electrónico de forma segura.</p>
          </div>
          <div class="footer">
            <p><strong>nanoMED</strong> - Medicina Ocupacional</p>
            <p>© 2025 nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendMail({
      to: email,
      subject: "¡Bienvenido a nanoMED! - Verifica tu cuenta",
      html: htmlContent,
      text: `¡Bienvenido a nanoMED, ${name || 'Usuario'}!\n\nTe damos la bienvenida a tu plataforma de salud ocupacional de confianza.\n\nPara completar tu registro, visita: ${verificationLink}\n\nEste enlace expirará en 24 horas por motivos de seguridad.\n\nSi no creaste una cuenta, puedes ignorar este correo.\n\nnanoMED - Medicina Ocupacional\n© 2025 nanoMED. Todos los derechos reservados.`
    });
  }

  // Método para enviar email de recuperación de contraseña
  async sendPasswordResetEmail(email, token, name) {
    const resetLink = `${config.app.clientUrl}/reset-password/${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recuperación de Contraseña - nanoMED</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #111726; 
            margin: 0; 
            padding: 0; 
            background-color: #f0f6f7; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 10px; 
            box-shadow: 0 4px 10px rgba(17, 23, 38, 0.1); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #0797b3 0%, #479cd0 100%); 
            color: #ffffff; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600; 
          }
          .content { 
            padding: 30px; 
            background-color: #ffffff; 
          }
          .content h2 { 
            color: #111726; 
            font-size: 24px; 
            margin-bottom: 20px; 
          }
          .content p { 
            color: #7b7b7b; 
            margin-bottom: 15px; 
            font-size: 16px; 
          }
          .button { 
            display: inline-block; 
            padding: 15px 30px; 
            background: linear-gradient(135deg, #0797b3 0%, #479cd0 100%); 
            color: #ffffff; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 25px 0; 
            font-weight: 600; 
            font-size: 16px; 
            transition: all 0.3s ease; 
          }
          .button:hover { 
            background: linear-gradient(135deg, #479cd0 0%, #59c3ed 100%); 
          }
          .link-text { 
            color: #0797b3; 
            word-break: break-all; 
            font-size: 14px; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background-color: #f0f6f7; 
            border-top: 1px solid #aef4ff; 
            font-size: 14px; 
            color: #7b7b7b; 
          }
          .warning-box { 
            background-color: #aef4ff; 
            border-left: 4px solid #0797b3; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 0 5px 5px 0; 
          }
          .security-note { 
            background-color: #f0f6f7; 
            padding: 20px; 
            border-radius: 5px; 
            margin: 25px 0; 
            border: 1px solid #aef4ff; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperación de Contraseña</h1>
          </div>
          <div style="text-align: center; margin-bottom: 20px; padding-top: 30px;">
            <img src="https://publicblobnanomed.blob.core.windows.net/general/logo.png" alt="nanoMED Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
          </div>
          <div class="content">
            <h2>Hola ${name || 'Usuario'},</h2>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de <strong>nanoMED</strong>.</p>
            <p>Si fuiste tú quien solicitó este cambio, haz clic en el siguiente botón para crear una nueva contraseña segura:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Restablecer Contraseña</a>
            </div>
            
            <div class="warning-box">
              <p style="margin: 0; color: #111726;"><strong>⏰ Tiempo límite:</strong> Este enlace expirará en 1 hora por motivos de seguridad.</p>
            </div>
            
            <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
            <p class="link-text">${resetLink}</p>
            
            <div class="security-note">
              <p style="margin: 0; color: #111726; font-size: 14px;"><strong>🔒 Nota de Seguridad:</strong> Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual permanecerá sin cambios y tu cuenta estará protegida.</p>
            </div>
          </div>
          <div class="footer">
            <p><strong>nanoMED</strong> - Medicina Ocupacional</p>
            <p>© 2025 nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendMail({
      to: email,
      subject: "nanoMED - Solicitud de recuperación de contraseña",
      html: htmlContent,
      text: `Hola ${name || 'Usuario'},\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta de nanoMED.\n\nPara crear una nueva contraseña, visita: ${resetLink}\n\n⏰ Este enlace expirará en 1 hora por motivos de seguridad.\n\n🔒 Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual permanecerá sin cambios.\n\nnanoMED - Medicina Ocupacional\n© 2025 nanoMED. Todos los derechos reservados.`
    });
  }

  // Método para enviar código MFA
  async sendMFACode(email, code, name) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Código de Verificación - nanoMED</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #111726; 
            margin: 0; 
            padding: 0; 
            background-color: #f0f6f7; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 10px; 
            box-shadow: 0 4px 10px rgba(17, 23, 38, 0.1); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #59c3ed 0%, #aef4ff 100%); 
            color: #111726; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600; 
          }
          .content { 
            padding: 30px; 
            background-color: #ffffff; 
          }
          .content h2 { 
            color: #111726; 
            font-size: 24px; 
            margin-bottom: 20px; 
          }
          .content p { 
            color: #7b7b7b; 
            margin-bottom: 15px; 
            font-size: 16px; 
          }
          .code-container { 
            text-align: center; 
            margin: 30px 0; 
          }
          .code { 
            display: inline-block; 
            font-size: 32px; 
            font-weight: bold; 
            background: linear-gradient(135deg, #59c3ed 0%, #0797b3 100%); 
            color: #ffffff; 
            padding: 20px 30px; 
            border-radius: 10px; 
            letter-spacing: 8px; 
            font-family: 'Courier New', monospace; 
            box-shadow: 0 4px 15px rgba(89, 195, 237, 0.3); 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background-color: #f0f6f7; 
            border-top: 1px solid #aef4ff; 
            font-size: 14px; 
            color: #7b7b7b; 
          }
          .warning-box { 
            background-color: #aef4ff; 
            border-left: 4px solid #59c3ed; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 0 5px 5px 0; 
          }
          .security-alert { 
            background-color: #f0f6f7; 
            padding: 20px; 
            border-radius: 5px; 
            margin: 25px 0; 
            border: 1px solid #0797b3; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Código de Verificación</h1>
          </div>
          <div style="text-align: center; margin-bottom: 20px; padding-top: 30px;">
            <img src="https://publicblobnanomed.blob.core.windows.net/general/logo.png" alt="nanoMED Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
          </div>
          <div class="content">
            <h2>Hola ${name || 'Usuario'},</h2>
            <p>Para garantizar la seguridad de tu cuenta de <strong>nanoMED</strong>, aquí tienes tu código de verificación:</p>
            
            <div class="code-container">
              <div class="code">${code}</div>
            </div>
            
            <div class="warning-box">
              <p style="margin: 0; color: #111726;"><strong>⏰ Importante:</strong> Este código expirará en 10 minutos por motivos de seguridad.</p>
            </div>
            
            <p>Ingresa este código en la pantalla de verificación para continuar con el acceso a tu cuenta.</p>
            
            <div class="security-alert">
              <p style="margin: 0; color: #111726; font-size: 14px;"><strong>🛡️ Alerta de Seguridad:</strong> Si no solicitaste este código de verificación, es posible que alguien esté intentando acceder a tu cuenta. Te recomendamos cambiar tu contraseña inmediatamente y revisar la actividad de tu cuenta.</p>
            </div>
          </div>
          <div class="footer">
            <p><strong>nanoMED</strong> - Medicina Ocupacional</p>
            <p>© 2025 nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendMail({
      to: email,
      subject: "nanoMED - Código de verificación de seguridad",
      html: htmlContent,
      text: `Hola ${name || 'Usuario'},\n\nPara garantizar la seguridad de tu cuenta de nanoMED, aquí tienes tu código de verificación:\n\n🔐 CÓDIGO: ${code}\n\n⏰ Este código expirará en 10 minutos por motivos de seguridad.\n\n🛡️ Si no solicitaste este código, cambia tu contraseña inmediatamente.\n\nnanoMED - Medicina Ocupacional\n© 2025 nanoMED. Todos los derechos reservados.`
    });
  }

  // Método para enviar email de agendamiento de cita médica (cuando se crea la cita)
  async sendAppointmentSchedulingEmail(email, appointmentData, userName) {
    const { 
      fecha_hora, 
      medico_nombre, 
      especialidad, 
      lugar, 
      direccion, 
      duracion, 
      notas 
    } = appointmentData;
    
    // Formatear fecha y hora
    const fechaCita = new Date(fecha_hora);
    const fechaFormateada = fechaCita.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horaFormateada = fechaCita.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cita Médica Agendada - Nanomed</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #111726; 
            margin: 0; 
            padding: 0; 
            background-color: #f0f6f7; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 10px; 
            box-shadow: 0 4px 10px rgba(17, 23, 38, 0.1); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #59c3ed 0%, #479cd0 100%); 
            color: #ffffff; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600; 
          }
          .content { 
            padding: 30px; 
            background-color: #ffffff; 
          }
          .content h2 { 
            color: #111726; 
            font-size: 24px; 
            margin-bottom: 20px; 
          }
          .content p { 
            color: #7b7b7b; 
            margin-bottom: 15px; 
            font-size: 16px; 
          }
          .appointment-card {
            background: linear-gradient(135deg, #aef4ff 0%, #f0f6f7 100%);
            border-left: 4px solid #59c3ed;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          .appointment-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .appointment-detail:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #111726;
            flex: 1;
          }
          .detail-value {
            color: #0797b3;
            font-weight: 500;
            flex: 2;
            text-align: right;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background-color: #f0f6f7; 
            border-top: 1px solid #aef4ff; 
            font-size: 14px; 
            color: #7b7b7b; 
          }
          .important-note { 
            background-color: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 0 5px 5px 0; 
          }
          .contact-info {
            background-color: #f0f6f7;
            padding: 20px;
            border-radius: 5px;
            margin: 25px 0;
            border: 1px solid #aef4ff;
          }
          .status-badge {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cita Agendada</h1>
          </div>
          <div style="text-align: center; margin-bottom: 20px; padding-top: 30px;">
            <img src="https://publicblobnanomed.blob.core.windows.net/general/logo.png" alt="nanoMED Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
          </div>
          <div class="content">
            <h2>¡Hola ${userName || 'Paciente'}!</h2>
            <p>Tu cita médica ha sido <strong>agendada exitosamente</strong> en <strong>nanoMED</strong>. A continuación, encontrarás todos los detalles de tu próxima consulta:</p>
            
            <div class="appointment-card">
              <h3 style="margin-top: 0; color: #111726;">
                📋 Detalles de tu Cita
                <span class="status-badge">PROGRAMADA</span>
              </h3>
              
              <div class="appointment-detail">
                <span class="detail-label">👨‍⚕️ Médico:</span>
                <span class="detail-value">${medico_nombre || 'Por asignar'}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">🏥 Especialidad:</span>
                <span class="detail-value">${especialidad || 'Medicina General'}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">${fechaFormateada}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">${horaFormateada}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">⏱️ Duración:</span>
                <span class="detail-value">${duracion || 30} minutos</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">📍 Lugar:</span>
                <span class="detail-value">${lugar || 'Centro Médico nanoMED'}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">🗺️ Dirección:</span>
                <span class="detail-value">${direccion || 'José Joaquín Pérez 240, Salamanca'}</span>
              </div>
              
              ${notas ? `
              <div class="appointment-detail">
                <span class="detail-label">📝 Motivo:</span>
                <span class="detail-value">${notas}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="important-note">
              <p style="margin: 0; color: #856404;"><strong>📌 ¿Qué sigue ahora?</strong></p>
              <p style="margin: 8px 0 0 0; color: #856404; font-size: 14px;">Tu cita está programada pero aún no confirmada. Puedes confirmar tu asistencia accediendo a tu cuenta en la plataforma nanoMED o contactándonos directamente.</p>
            </div>
            
            <div class="contact-info">
              <h4 style="margin-top: 0; color: #111726;">📞 Información de Contacto</h4>
              <p style="margin-bottom: 8px; font-size: 14px;">Si necesitas reprogramar, cancelar o confirmar tu cita, puedes:</p>
              <ul style="margin: 8px 0; font-size: 14px; color: #7b7b7b;">
                <li>Acceder a tu cuenta en la plataforma nanoMED</li>
                <li>Llamarnos al teléfono de nuestro centro médico</li>
                <li>Contactarnos por WhatsApp</li>
              </ul>
              <p style="margin: 8px 0 0; font-size: 12px; color: #0797b3;"><strong>Importante:</strong> Por favor, llega 15 minutos antes de tu cita para completar los trámites de ingreso. Recuerda traer tu documento de identidad.</p>
            </div>
            
            ${this.getMapHTML()}
            
            <p style="margin-top: 30px; font-size: 14px;">¡Esperamos verte pronto en Nanomed! Estamos comprometidos con brindarte la mejor atención médica ocupacional.</p>
          </div>
          <div class="footer">
            <p><strong>nanoMED</strong> - Medicina Ocupacional</p>
            <p>© 2025 nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
¡Hola ${userName || 'Paciente'}!

Tu cita médica ha sido AGENDADA exitosamente en Nanomed.

DETALLES DE TU CITA:
Estado: PROGRAMADA
👨‍⚕️ Médico: ${medico_nombre || 'Por asignar'}
🏥 Especialidad: ${especialidad || 'Medicina General'}
📅 Fecha: ${fechaFormateada}
🕐 Hora: ${horaFormateada}
⏱️ Duración: ${duracion || 30} minutos
📍 Lugar: ${lugar || 'Centro Médico nanoMED'}
🗺️ Dirección: ${direccion || 'José Joaquín Pérez 240, Salamanca'}
${notas ? `📝 Motivo: ${notas}` : ''}

📌 ¿QUÉ SIGUE AHORA?
Tu cita está programada pero aún no confirmada. Puedes confirmar tu asistencia accediendo a tu cuenta en la plataforma Nanomed o contactándonos directamente.

📞 INFORMACIÓN DE CONTACTO:
Si necesitas reprogramar, cancelar o confirmar tu cita, puedes:
- Acceder a tu cuenta en la plataforma Nanomed
- Llamarnos al teléfono de nuestro centro médico
- Contactarnos por WhatsApp

IMPORTANTE: Por favor, llega 15 minutos antes de tu cita para completar los trámites de ingreso. Recuerda traer tu documento de identidad.

¡Esperamos verte pronto en Nanomed! Estamos comprometidos con brindarte la mejor atención médica ocupacional.

nanoMED - Medicina Ocupacional
© 2025 nanoMED. Todos los derechos reservados.
    `;

    return await this.sendMail({
      to: email,
      subject: "Cita Médica Agendada - nanoMED",
      html: htmlContent,
      text: textContent
    });
  }

  // Método para enviar email de cancelación de cita médica
  async sendAppointmentCancellationEmail(email, appointmentData, userName) {
    const { 
      fecha_hora, 
      medico_nombre, 
      especialidad, 
      lugar, 
      direccion, 
      duracion, 
      notas 
    } = appointmentData;
    
    // Formatear fecha y hora
    const fechaCita = new Date(fecha_hora);
    const fechaFormateada = fechaCita.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horaFormateada = fechaCita.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cita Médica Cancelada - nanoMED</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #111726; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 10px; 
            box-shadow: 0 4px 10px rgba(17, 23, 38, 0.1); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
            color: #ffffff; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600; 
          }
          .content { 
            padding: 30px; 
            background-color: #ffffff; 
          }
          .content h2 { 
            color: #111726; 
            font-size: 24px; 
            margin-bottom: 20px; 
          }
          .content p { 
            color: #7b7b7b; 
            margin-bottom: 15px; 
            font-size: 16px; 
          }
          .appointment-card {
            background: linear-gradient(135deg, #f8d7da 0%, #f5f5f5 100%);
            border-left: 4px solid #dc3545;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          .appointment-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .appointment-detail:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #111726;
            flex: 1;
          }
          .detail-value {
            color: #dc3545;
            font-weight: 500;
            flex: 2;
            text-align: right;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background-color: #f0f6f7; 
            border-top: 1px solid #e0e0e0; 
            font-size: 14px; 
            color: #7b7b7b; 
          }
          .cancellation-note { 
            background-color: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 0 5px 5px 0; 
          }
          .contact-info {
            background-color: #f0f6f7;
            padding: 20px;
            border-radius: 5px;
            margin: 25px 0;
            border: 1px solid #e0e0e0;
          }
          .status-badge {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cita Cancelada</h1>
          </div>
          <div style="text-align: center; margin-bottom: 20px; padding-top: 30px;">
            <img src="https://publicblobnanomed.blob.core.windows.net/general/logo.png" alt="nanoMED Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
          </div>
          <div class="content">
            <h2>Hola ${userName || 'Paciente'},</h2>
            <p>Tu cita médica ha sido <strong>cancelada</strong>. A continuación encontrarás el resumen de la cita que fue cancelada:</p>
            
            <div class="appointment-card">
              <h3 style="margin-top: 0; color: #111726;">
                📋 Resumen de la Cita Cancelada
                <span class="status-badge">CANCELADA</span>
              </h3>
              
              <div class="appointment-detail">
                <span class="detail-label">👨‍⚕️ Médico:</span>
                <span class="detail-value">${medico_nombre || 'Sin asignar'}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">🏥 Especialidad:</span>
                <span class="detail-value">${especialidad || 'Medicina General'}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">${fechaFormateada}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">${horaFormateada}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">⏱️ Duración:</span>
                <span class="detail-value">${duracion || 30} minutos</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">📍 Lugar:</span>
                <span class="detail-value">${lugar || 'Centro Médico nanoMED'}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">🗺️ Dirección:</span>
                <span class="detail-value">${direccion || 'José Joaquín Pérez 240, Salamanca'}</span>
              </div>
              
              ${notas ? `
              <div class="appointment-detail">
                <span class="detail-label">📝 Motivo:</span>
                <span class="detail-value">${notas}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="cancellation-note">
              <p style="margin: 0; color: #856404;"><strong>ℹ️ Información importante</strong></p>
              <p style="margin: 8px 0 0 0; color: #856404; font-size: 14px;">
                • El horario de tu cita cancelada ahora está disponible para otros pacientes.<br>
                • Si necesitas reagendar, puedes solicitar una nueva cita a través de nuestro sistema.<br>
                • Si tienes alguna duda sobre la cancelación, no dudes en contactarnos.
              </p>
            </div>
            
            <div class="contact-info">
              <h4 style="margin-top: 0; color: #111726;">📞 ¿Necesitas ayuda?</h4>
              <p style="margin-bottom: 8px; font-size: 14px;">Si necesitas reagendar o tienes alguna consulta:</p>
              <ul style="margin: 8px 0; font-size: 14px; color: #7b7b7b;">
                <li>Acceder a tu cuenta en la plataforma nanoMED</li>
                <li>Llamarnos al teléfono de nuestro centro médico</li>
                <li>Contactarnos por WhatsApp</li>
              </ul>
              <p style="margin: 8px 0 0; font-size: 12px; color: #0797b3;"><strong>Horario de atención:</strong> Lunes a Viernes, 8:00 - 18:00</p>
            </div>
            
            ${this.getMapHTML()}
            
            <p style="margin-top: 30px; font-size: 14px;">Gracias por confiar en nanoMED. Esperamos poder atenderte en una próxima oportunidad.</p>
          </div>
          <div class="footer">
            <p><strong>nanoMED</strong> - Medicina Ocupacional</p>
            <p>© 2025 nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Hola ${userName || 'Paciente'},

Tu cita médica ha sido CANCELADA exitosamente según tu solicitud.

RESUMEN DE LA CITA CANCELADA:
Estado: CANCELADA ❌
👨‍⚕️ Médico: ${medico_nombre || 'Sin asignar'}
🏥 Especialidad: ${especialidad || 'Medicina General'}
📅 Fecha: ${fechaFormateada}
🕐 Hora: ${horaFormateada}
⏱️ Duración: ${duracion || 30} minutos
📍 Lugar: ${lugar || 'Centro Médico nanoMED'}
🗺️ Dirección: ${direccion || 'José Joaquín Pérez 240, Salamanca'}
${notas ? `📝 Motivo: ${notas}` : ''}

ℹ️ INFORMACIÓN IMPORTANTE:
• El horario de tu cita cancelada ahora está disponible para otros pacientes.
• Si necesitas reagendar, puedes solicitar una nueva cita a través de nuestro sistema.
• Si tienes alguna duda sobre la cancelación, no dudes en contactarnos.

📞 ¿NECESITAS AYUDA?
Si necesitas reagendar o tienes alguna consulta:
- Acceder a tu cuenta en la plataforma nanoMED
- Llamarnos al teléfono de nuestro centro médico
- Contactarnos por WhatsApp

Horario de atención: Lunes a Viernes, 8:00 - 18:00

Gracias por confiar en nanoMED. Esperamos poder atenderte en una próxima oportunidad.

nanoMED - Medicina Ocupacional
© 2025 nanoMED. Todos los derechos reservados.
    `;

    return await this.sendMail({
      to: email,
      subject: "Cita Médica Cancelada - nanoMED",
      html: htmlContent,
      text: textContent
    });
  }

  // Método para enviar email de mensaje de contacto
  async sendContactMessage(contactData) {
    const { nombreApellido, empresa, servicio, telefono, email, mensaje } = contactData;
    
    const asunto = `Nuevo mensaje de contacto - ${servicio}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo Mensaje de Contacto - nanoMED</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #111726; 
            margin: 0; 
            padding: 0; 
            background-color: #f0f6f7; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 10px; 
            box-shadow: 0 4px 10px rgba(17, 23, 38, 0.1); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #59c3ed 0%, #479cd0 100%); 
            color: #ffffff; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600; 
          }
          .content { 
            padding: 30px; 
            background-color: #ffffff; 
          }
          .info-card {
            background: linear-gradient(135deg, #aef4ff 0%, #f0f6f7 100%);
            border-left: 4px solid #59c3ed;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          .info-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .info-detail:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #111726;
            flex: 1;
          }
          .detail-value {
            color: #0797b3;
            font-weight: 500;
            flex: 2;
            text-align: right;
          }
          .message-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            font-style: italic;
            color: #495057;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background-color: #f0f6f7; 
            border-top: 1px solid #aef4ff; 
            font-size: 14px; 
            color: #7b7b7b; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuevo Mensaje de Contacto</h1>
          </div>
          <div style="text-align: center; margin-bottom: 20px; padding-top: 30px;">
            <img src="https://publicblobnanomed.blob.core.windows.net/general/logo.png" alt="nanoMED Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
          </div>
          <div class="content">
            <h2>Se ha recibido un nuevo mensaje a través del formulario de contacto</h2>
            
            <div class="info-card">
              <h3 style="margin-top: 0; color: #111726;">📋 Información del Contacto</h3>
              
              <div class="info-detail">
                <span class="detail-label">👤 Nombre completo:</span>
                <span class="detail-value">${nombreApellido}</span>
              </div>
              
              <div class="info-detail">
                <span class="detail-label">🏢 Empresa:</span>
                <span class="detail-value">${empresa || 'No especificada'}</span>
              </div>
              
              <div class="info-detail">
                <span class="detail-label">🩺 Servicio de interés:</span>
                <span class="detail-value">${servicio}</span>
              </div>
              
              <div class="info-detail">
                <span class="detail-label">📞 Teléfono:</span>
                <span class="detail-value">${telefono}</span>
              </div>
              
              <div class="info-detail">
                <span class="detail-label">📧 Email:</span>
                <span class="detail-value">${email}</span>
              </div>
            </div>
            
            <div class="message-box">
              <h4 style="margin-top: 0; color: #111726;">💬 Mensaje:</h4>
              <p style="margin: 0; white-space: pre-wrap;">${mensaje}</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #7b7b7b;">
              <strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-CL', { 
                timeZone: 'America/Santiago',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div class="footer">
            <p><strong>nanoMED</strong> - Sistema de Contacto</p>
            <p>© 2025 nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
NUEVO MENSAJE DE CONTACTO - nanoMED

Se ha recibido un nuevo mensaje a través del formulario de contacto del sitio web.

INFORMACIÓN DEL CONTACTO:
👤 Nombre completo: ${nombreApellido}
🏢 Empresa: ${empresa || 'No especificada'}
🩺 Servicio de interés: ${servicio}
📞 Teléfono: ${telefono}
📧 Email: ${email}

💬 MENSAJE:
${mensaje}

Fecha y hora: ${new Date().toLocaleString('es-CL', { 
  timeZone: 'America/Santiago',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

nanoMED - Sistema de Contacto
© 2025 nanoMED. Todos los derechos reservados.
    `;

    return await this.sendMail({
      to: "soporte@nanomed.cl",
      subject: asunto,
      html: htmlContent,
      text: textContent
    });
  }

  // Método para enviar email de confirmación de asistencia a cita médica
  async sendAppointmentConfirmationEmail(email, appointmentData, userName) {
    const { 
      fecha_hora, 
      medico_nombre, 
      especialidad, 
      lugar, 
      direccion, 
      duracion, 
      notas 
    } = appointmentData;
    
    // Formatear fecha y hora
    const fechaCita = new Date(fecha_hora);
    const fechaFormateada = fechaCita.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horaFormateada = fechaCita.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Asistencia - nanoMED</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #111726; 
            margin: 0; 
            padding: 0; 
            background-color: #f0f6f7; 
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 10px; 
            box-shadow: 0 4px 10px rgba(17, 23, 38, 0.1); 
            overflow: hidden; 
          }
          .header { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            color: #ffffff; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600; 
          }
          .content { 
            padding: 30px; 
            background-color: #ffffff; 
          }
          .content h2 { 
            color: #111726; 
            font-size: 24px; 
            margin-bottom: 20px; 
          }
          .content p { 
            color: #7b7b7b; 
            margin-bottom: 15px; 
            font-size: 16px; 
          }
          .appointment-card {
            background: linear-gradient(135deg, #d4edda 0%, #f8f9fa 100%);
            border-left: 4px solid #28a745;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          .appointment-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .appointment-detail:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #111726;
            flex: 1;
          }
          .detail-value {
            color: #28a745;
            font-weight: 500;
            flex: 2;
            text-align: right;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background-color: #f0f6f7; 
            border-top: 1px solid #aef4ff; 
            font-size: 14px; 
            color: #7b7b7b; 
          }
          .confirmation-note { 
            background-color: #d4edda; 
            border-left: 4px solid #28a745; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 0 5px 5px 0; 
          }
          .contact-info {
            background-color: #f0f6f7;
            padding: 20px;
            border-radius: 5px;
            margin: 25px 0;
            border: 1px solid #aef4ff;
          }
          .status-badge {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Asistencia Confirmada</h1>
          </div>
          <div style="text-align: center; margin-bottom: 20px; padding-top: 30px;">
            <img src="https://publicblobnanomed.blob.core.windows.net/general/logo.png" alt="nanoMED Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
          </div>
          <div class="content">
            <h2>¡Hola ${userName || 'Paciente'}!</h2>
            <p>Hemos recibido la <strong>confirmación de tu asistencia</strong> a tu cita médica en <strong>nanoMED</strong>. ¡Gracias por confirmar! A continuación encontrarás el resumen de tu cita:</p>
            
            <div class="appointment-card">
              <h3 style="margin-top: 0; color: #111726;">
                📋 Resumen de tu Cita
                <span class="status-badge">CONFIRMADA</span>
              </h3>
              
              <div class="appointment-detail">
                <span class="detail-label">👨‍⚕️ Médico:</span>
                <span class="detail-value">${medico_nombre || 'Por asignar'}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">🏥 Especialidad:</span>
                <span class="detail-value">${especialidad || 'Medicina General'}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">${fechaFormateada}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">${horaFormateada}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">⏱️ Duración:</span>
                <span class="detail-value">${duracion || 30} minutos</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">📍 Lugar:</span>
                <span class="detail-value">${lugar || 'Centro Médico nanoMED'}</span>
              </div>
              
              <div class="appointment-detail">
                <span class="detail-label">🗺️ Dirección:</span>
                <span class="detail-value">${direccion || 'José Joaquín Pérez 240, Salamanca'}</span>
              </div>
              
              ${notas ? `
              <div class="appointment-detail">
                <span class="detail-label">📝 Motivo:</span>
                <span class="detail-value">${notas}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="confirmation-note">
              <p style="margin: 0; color: #155724;"><strong>✅ ¡Perfecto!</strong></p>
              <p style="margin: 8px 0 0 0; color: #155724; font-size: 14px;">Tu asistencia ha sido confirmada. Nos vemos el ${fechaFormateada} a las ${horaFormateada}. Por favor, llega 15 minutos antes de tu cita para completar los trámites de ingreso.</p>
            </div>
            
            <div class="contact-info">
              <h4 style="margin-top: 0; color: #111726;">📞 Información de Contacto</h4>
              <p style="margin-bottom: 8px; font-size: 14px;">Si necesitas reprogramar o cancelar tu cita, puedes:</p>
              <ul style="margin: 8px 0; font-size: 14px; color: #7b7b7b;">
                <li>Llamarnos al teléfono de nuestro centro médico</li>
                <li>Acceder a tu cuenta en la plataforma nanoMED</li>
                <li>Contactarnos por WhatsApp</li>
              </ul>
              <p style="margin: 8px 0 0; font-size: 12px; color: #0797b3;"><strong>Recordatorio:</strong> Trae tu documento de identidad y cualquier examen médico previo que pueda ser relevante para tu consulta.</p>
            </div>
            
            ${this.getMapHTML()}
            
            <p style="margin-top: 30px; font-size: 14px;">¡Esperamos verte pronto en nanoMED! Estamos comprometidos con brindarte la mejor atención médica ocupacional.</p>
          </div>
          <div class="footer">
            <p><strong>nanoMED</strong> - Medicina Ocupacional</p>
            <p>© 2025 nanoMED. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
¡Hola ${userName || 'Paciente'}!

Hemos recibido la CONFIRMACIÓN de tu ASISTENCIA a tu cita médica en nanoMED. ¡Gracias por confirmar!

RESUMEN DE TU CITA:
Estado: CONFIRMADA ✅
👨‍⚕️ Médico: ${medico_nombre || 'Por asignar'}
🏥 Especialidad: ${especialidad || 'Medicina General'}
📅 Fecha: ${fechaFormateada}
🕐 Hora: ${horaFormateada}
⏱️ Duración: ${duracion || 30} minutos
📍 Lugar: ${lugar || 'Centro Médico nanoMED'}
🗺️ Dirección: ${direccion || 'José Joaquín Pérez 240, Salamanca'}
${notas ? `📝 Motivo: ${notas}` : ''}

✅ ¡PERFECTO!
Tu asistencia ha sido confirmada. Nos vemos el ${fechaFormateada} a las ${horaFormateada}. Por favor, llega 15 minutos antes de tu cita para completar los trámites de ingreso.

📞 INFORMACIÓN DE CONTACTO:
Si necesitas reprogramar o cancelar tu cita, puedes:
- Llamarnos al teléfono de nuestro centro médico
- Acceder a tu cuenta en la plataforma nanoMED
- Contactarnos por WhatsApp

RECORDATORIO: Trae tu documento de identidad y cualquier examen médico previo que pueda ser relevante para tu consulta.

¡Esperamos verte pronto en nanoMED! Estamos comprometidos con brindarte la mejor atención médica ocupacional.

nanoMED - Medicina Ocupacional
© 2025 nanoMED. Todos los derechos reservados.
    `;

    return await this.sendMail({
      to: email,
      subject: "Confirmación de Asistencia - nanoMED",
      html: htmlContent,
      text: textContent
    });
  }
}

// Exportar una instancia singleton
module.exports = new MailService(); 