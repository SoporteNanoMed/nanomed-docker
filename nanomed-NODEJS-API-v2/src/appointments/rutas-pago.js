const express = require("express");
const router = express.Router();
const transbankService = require("../utils/transbankService");
const controlador = require("./controlador");
const respuesta = require("../red/respuestas");
const { verifyToken } = require("../auth/middlewares");
const db = require("../db/sqlserver");

// Ruta pública sin autenticación para debug
router.get("/payment/debug-public/:token", debugTokenPublic);

// Middleware de autenticación para todas las rutas protegidas
router.use(verifyToken);

// POST /api/appointments/:id/payment/create - Crear transacción de pago
async function crearTransaccionPago(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const userId = req.user.id;

    console.log(`Iniciando proceso de pago para cita ${citaId}, usuario ${userId}`);

    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }

    // Verificar que la cita existe y pertenece al usuario
    console.log(`Verificando existencia de cita ${citaId}...`);
    const cita = await controlador.obtenerCita(citaId, userId);
    if (!cita) {
      return respuesta.error(req, res, 'Cita no encontrada', 404);
    }
    console.log(`Cita encontrada: ID ${cita.id}, Estado: ${cita.estado}`);

    // Verificar que la cita esté en estado programada
    if (cita.estado !== 'programada') {
      return respuesta.error(req, res, 'Solo se puede pagar citas programadas', 400);
    }

    // Verificar si ya existe un pago aprobado para esta cita
    console.log(`Verificando pagos existentes para cita ${citaId}...`);
    const tienePagoAprobado = await transbankService.hasApprovedPayment(citaId);
    if (tienePagoAprobado) {
      return respuesta.error(req, res, 'Esta cita ya tiene un pago aprobado', 400);
    }
    console.log(`No hay pagos previos aprobados`);

    // Obtener monto de la cita según la especialidad
    console.log(`Obteniendo monto para cita ${citaId}...`);
    let amount;
    try {
      amount = await transbankService.getAppointmentAmount(citaId);
      console.log(`Monto obtenido: $${amount}`);
    } catch (amountError) {
      console.error(`Error al obtener monto:`, amountError);
      return respuesta.error(req, res, `Error al calcular el monto: ${amountError.message}`, 500);
    }
    
    // Generar session ID único
    console.log(`Generando session ID...`);
    const sessionId = transbankService.generateSessionId(userId, citaId);
    console.log(`Session ID: ${sessionId}`);
    
    // URL de retorno (ajustar según tu dominio)
    const baseUrl = process.env.CLIENT_URL || 'https://nanomed-frontend.vercel.app';
    const returnUrl = `${baseUrl}/dashboard/citas/payment/confirm`;
    
    console.log('Configuración de URL de retorno:', {
      CLIENT_URL: process.env.CLIENT_URL,
      baseUrl,
      returnUrl
    });

    // Crear transacción en Transbank
    console.log(`Creando transacción en Transbank...`);
    let transactionResult;
    try {
      transactionResult = await transbankService.createTransaction(
        citaId,
        amount,
        sessionId,
        returnUrl
      );
      console.log(`Transacción creada exitosamente:`, {
        token: transactionResult.token,
        url: transactionResult.url,
        monto: amount
      });
    } catch (transactionError) {
      console.error(`Error al crear transacción en Transbank:`, transactionError);
      return respuesta.error(req, res, `Error al crear transacción: ${transactionError.message}`, 500);
    }

    respuesta.success(req, res, {
      mensaje: 'Transacción creada exitosamente',
      url_pago: transactionResult.url,
      token: transactionResult.token,
      monto: amount
    }, 200);

  } catch (err) {
    console.error(`Error general en crearTransaccionPago:`, err);
    next(err);
  }
}

// POST /api/appointments/payment/confirm - Confirmar transacción de pago
// SIGUIENDO EXACTAMENTE LA DOCUMENTACIÓN DE TRANSBANK
async function confirmarTransaccionPago(req, res, next) {
  try {
    // Paso 1: Datos recibidos - obtener token_ws del request
    const token = req.body.token_ws;
    
    console.log(`[TRANSBANK] Paso 1 - Token recibido: ${token}`);
    
    if (!token) {
      return respuesta.error(req, res, 'Token de transacción requerido', 400);
    }

    // Paso 2: Petición - confirmar transacción mediante el SDK
    console.log(`[TRANSBANK] Paso 2 - Confirmando con SDK...`);
    
    const commitResponse = await transbankService.commitTransactionSimple(token);
    
    console.log(`[TRANSBANK] Respuesta de commit:`, commitResponse);

    // Paso 3: Respuesta - verificar response_code = 0 y status = "AUTHORIZED"
    console.log(`[TRANSBANK] Paso 3 - Verificando respuesta...`);
    
    if (commitResponse.response_code !== 0) {
      console.log(`[TRANSBANK] ERROR: response_code = ${commitResponse.response_code}`);
      return respuesta.error(req, res, 'Pago rechazado por Transbank', 400);
    }

    if (commitResponse.status !== 'AUTHORIZED') {
      console.log(`[TRANSBANK] ERROR: status = ${commitResponse.status}`);
      return respuesta.error(req, res, 'Pago no autorizado', 400);
    }

    // ¡Listo! - obtener datos básicos de la transacción para confirmar cita
    console.log(`[TRANSBANK] ¡ÉXITO! Buscando datos de la cita...`);
    
    const [transactionData] = await db.query(`
      SELECT cita_id FROM TransaccionesPago WHERE token_transbank = @token
    `, { token });
    
    if (transactionData) {
      const [citaData] = await db.query(`
        SELECT usuario_id FROM CitasMedicas WHERE id = @cita_id
      `, { cita_id: transactionData.cita_id });
      
      if (citaData) {
        // Confirmar la cita
        try {
          await controlador.actualizarCita(
            transactionData.cita_id,
            citaData.usuario_id,
            { estado: 'confirmada' }
          );
          console.log(`[TRANSBANK] Cita ${transactionData.cita_id} confirmada`);
        } catch (error) {
          console.error(`[TRANSBANK] Error confirmando cita:`, error);
        }
      }
    }

    // Respuesta de éxito según documentación
    respuesta.success(req, res, {
      mensaje: 'Transacción procesada exitosamente',
      vci: commitResponse.vci,
      amount: commitResponse.amount,
      status: commitResponse.status,
      buy_order: commitResponse.buy_order,
      session_id: commitResponse.session_id,
      card_detail: commitResponse.card_detail,
      accounting_date: commitResponse.accounting_date,
      transaction_date: commitResponse.transaction_date,
      authorization_code: commitResponse.authorization_code,
      payment_type_code: commitResponse.payment_type_code,
      response_code: commitResponse.response_code
    }, 200);

  } catch (err) {
    console.error('[TRANSBANK] Error general:', err);
    respuesta.error(req, res, 'Error al procesar el pago', 500);
  }
}

// GET /api/appointments/:id/payment/status - Verificar estado del pago
async function verificarEstadoPago(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }

    // Verificar que la cita existe y pertenece al usuario
    const cita = await controlador.obtenerCita(citaId, userId);
    if (!cita) {
      return respuesta.error(req, res, 'Cita no encontrada', 404);
    }

    // Verificar si existe un pago aprobado
    const tienePagoAprobado = await transbankService.hasApprovedPayment(citaId);

    // Obtener monto según la especialidad
    const montoCita = await transbankService.getAppointmentAmount(citaId);

    respuesta.success(req, res, {
      cita_id: citaId,
      tiene_pago_aprobado: tienePagoAprobado,
      estado_cita: cita.estado,
      monto_cita: montoCita
    }, 200);

  } catch (err) {
    next(err);
  }
}

// POST /api/appointments/payment/retry - Reintentar pago de una cita
async function reintentarPago(req, res, next) {
  try {
    const { cita_id } = req.body;
    const userId = req.user.id;

    if (!cita_id) {
      return respuesta.error(req, res, 'ID de cita requerido', 400);
    }

    // Verificar que la cita existe y pertenece al usuario
    const cita = await controlador.obtenerCita(cita_id, userId);
    if (!cita) {
      return respuesta.error(req, res, 'Cita no encontrada', 404);
    }

    // Verificar si ya existe un pago aprobado para esta cita
    const tienePagoAprobado = await transbankService.hasApprovedPayment(cita_id);
    if (tienePagoAprobado) {
      return respuesta.error(req, res, 'Esta cita ya tiene un pago aprobado', 400);
    }

    // Obtener monto de la cita según la especialidad
    const amount = await transbankService.getAppointmentAmount(cita_id);
    
    // Generar nuevo session ID
    const sessionId = transbankService.generateSessionId(userId, cita_id);
    
    // URL de retorno
    const baseUrl = process.env.CLIENT_URL || 'https://nanomed-frontend.vercel.app';
    const returnUrl = `${baseUrl}/dashboard/citas/payment/confirm`;

    console.log('Reintentando pago para cita:', {
      cita_id,
      amount,
      sessionId,
      returnUrl
    });

    // Crear nueva transacción en Transbank
    const transactionResult = await transbankService.createTransaction(
      cita_id,
      amount,
      sessionId,
      returnUrl
    );

    respuesta.success(req, res, {
      mensaje: 'Nueva transacción creada exitosamente',
      url_pago: transactionResult.url,
      token: transactionResult.token,
      monto: amount
    }, 200);

  } catch (err) {
    next(err);
  }
}

// GET /api/appointments/payment/debug/:token - Endpoint para debuggear tokens específicos
async function debugToken(req, res, next) {
  try {
    const { token } = req.params;
    
    console.log(`[DEBUG] Iniciando debug para token: ${token}`);
    
    // Buscar transacciones en la BD
    const allTransactions = await db.query(`
      SELECT TOP 10 
        tp.token_transbank, 
        tp.cita_id, 
        tp.estado, 
        tp.monto,
        tp.creado_en,
        c.usuario_id
      FROM TransaccionesPago tp
      LEFT JOIN CitasMedicas c ON tp.cita_id = c.id
      ORDER BY tp.creado_en DESC
    `);
    
    const specificTransaction = await db.query(`
      SELECT * FROM TransaccionesPago WHERE token_transbank = @token
    `, { token });
    
    const transactionCount = await db.query(`
      SELECT COUNT(*) as total FROM TransaccionesPago
    `);
    
    respuesta.success(req, res, {
      mensaje: 'Debug de token',
      token_buscado: token,
      transaccion_encontrada: specificTransaction.length > 0 ? specificTransaction[0] : null,
      ultimas_transacciones: allTransactions,
      total_transacciones: transactionCount[0]?.total || 0,
      configuracion_transbank: {
        USE_MOCK_TRANSBANK: process.env.USE_MOCK_TRANSBANK,
        TBK_ENVIRONMENT: process.env.TBK_ENVIRONMENT,
        modo_mock: transbankService.useMock
      },
      timestamp: new Date().toISOString()
    }, 200);

  } catch (err) {
    console.error('Error en debug de token:', err);
    next(err);
  }
}

// GET /api/appointments/payment/debug-public/:token - Debug sin autenticación  
async function debugTokenPublic(req, res, next) {
  try {
    const { token } = req.params;
    
    console.log(`[DEBUG-PUBLIC] Token: ${token}`);
    
    const specificTransaction = await db.query(`
      SELECT * FROM TransaccionesPago WHERE token_transbank = @token
    `, { token });
    
    if (specificTransaction.length > 0) {
      const citaData = await db.query(`
        SELECT usuario_id, estado FROM CitasMedicas WHERE id = @cita_id
      `, { cita_id: specificTransaction[0].cita_id });
      
      res.json({
        encontrado: true,
        token: token,
        transaccion: specificTransaction[0],
        cita: citaData[0] || null,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        encontrado: false,
        token: token,
        timestamp: new Date().toISOString()
      });
    }

  } catch (err) {
    console.error('Error en debug público:', err);
    res.status(500).json({ error: 'Error interno', timestamp: new Date().toISOString() });
  }
}

// GET /api/appointments/payment/test - Endpoint de test para verificar configuración
async function testTransbankConfig(req, res, next) {
  try {
    console.log('Probando configuración de Transbank...');
    
    // Verificar configuración básica
    const config = {
      ...transbankService.getConfigurationStatus(),
      precios: transbankService.getEspecialidadesPrices(),
      variables_entorno: {
        TBK_ENVIRONMENT: process.env.TBK_ENVIRONMENT,
        USE_MOCK_TRANSBANK: process.env.USE_MOCK_TRANSBANK,
        CLIENT_URL: process.env.CLIENT_URL
      }
    };
    
    console.log('Configuración actual:', config);
    
    respuesta.success(req, res, {
      mensaje: 'Test de configuración de Transbank',
      configuracion: config,
      timestamp: new Date().toISOString()
    }, 200);

  } catch (err) {
    console.error('Error en test de Transbank:', err);
    next(err);
  }
}

// Rutas
router.post("/:id/payment/create", crearTransaccionPago);
router.post("/payment/confirm", confirmarTransaccionPago);
router.get("/:id/payment/status", verificarEstadoPago);
router.post("/payment/retry", reintentarPago);
router.get("/payment/test", testTransbankConfig); // Endpoint de test
router.get("/payment/debug/:token", debugToken); // Endpoint de debug para tokens

module.exports = router; 