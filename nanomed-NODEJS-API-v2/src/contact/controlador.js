const respuesta = require("../red/respuestas");
const mailService = require("../utils/mailService");

// Enviar mensaje de contacto
async function enviarMensajeContacto(req, res, next) {
  try {
    const { nombreApellido, empresa, servicio, telefono, email, mensaje } = req.body;
    
    // Validar campos requeridos
    if (!nombreApellido || !telefono || !email || !servicio || !mensaje) {
      return respuesta.error(req, res, "Todos los campos obligatorios deben ser completados", 400);
    }

    // Enviar correo usando el servicio de mail con logo
    const emailResult = await mailService.sendContactMessage({
      nombreApellido,
      empresa,
      servicio,
      telefono,
      email,
      mensaje
    });

    // Verificar si el correo se envió correctamente
    if (emailResult && (emailResult.status === "sent" || emailResult.status === "development_mode" || emailResult.status === "development_fallback")) {
      console.log(` Mensaje de contacto enviado exitosamente:`, {
        from: email,
        nombre: nombreApellido,
        empresa: empresa || 'No especificada',
        servicio: servicio,
        telefono: telefono,
        messageId: emailResult.messageId,
        status: emailResult.status
      });

      respuesta.success(req, res, {
        message: "Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.",
        emailStatus: emailResult.status
      }, 200);
    } else {
      console.error(`❌ Error al enviar mensaje de contacto:`, emailResult);
      return respuesta.error(req, res, "Error al enviar el mensaje. Por favor intenta nuevamente.", 500);
    }

  } catch (error) {
    console.error("Error en enviarMensajeContacto:", error);
    next(error);
  }
}

module.exports = {
  enviarMensajeContacto
}; 