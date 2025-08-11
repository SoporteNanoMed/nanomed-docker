const db = require("../db/sqlserver");

// Configuración de Transbank (usar credenciales de prueba por defecto)
//const TBK_COMMERCE_CODE = process.env.TBK_COMMERCE_CODE || '597055555532';
//const TBK_API_KEY = process.env.TBK_API_KEY || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
//const TBK_ENVIRONMENT = process.env.TBK_ENVIRONMENT || 'integration'; // 'integration' para pruebas, 'production' para producción
const TBK_COMMERCE_CODE = process.env.TBK_COMMERCE_CODE;
const TBK_API_KEY = process.env.TBK_API_KEY;
const TBK_ENVIRONMENT = process.env.TBK_ENVIRONMENT;

// Variable para controlar si usar Transbank real o mock
const USE_MOCK_TRANSBANK = process.env.USE_MOCK_TRANSBANK === 'true' || false;

// Precios de especialidades médicas (en pesos chilenos)
const PRECIOS_ESPECIALIDADES = {
  "Medicina General / Médico Cirujano": 30000,
  "Kinesiología": 30000,
  "Kinesiología de Piso Pélvico": 25000,
  "Fonoaudiología": 35000,
  "Nutrición y Dietética": 35000, // Telemedicina: 35000, Presencial: 30000
  "Matrona": 30000,
  "Psicología Adulta": 40000,
  "Pediatría / Médico Cirujano": 45000,
  "Psicología Infanto-Juvenil": 45000,
  "Medicina Interna": 45000,
  "Traumatología y Ortopedia": 45000,
  "Cardiología / Médico Cirujano": 55000,
  "Dermatología / Médico Cirujano": 55000,
  "Neurología": 55000,
  "Oftalmología": 55000,
  "Ginecología / Médico Cirujano": 55000, // Telemedicina: 55000, Presencial: 45000
  "Psiquiatría Pediátrica y Adolescencia": 70000,
  "Psiquiatría Adulto": 80000,
  "Nutrición Deportiva": 40000,
  "Terapia del Sueño": 40000,
  "Tecnólogo Médico": 30000,
  "TENS": 25000,
  "Enfermería": 25000
};

let webpayPlus = null;

// Solo cargar el SDK de Transbank si no estamos en modo mock
if (!USE_MOCK_TRANSBANK) {
  try {
    const { WebpayPlus } = require('transbank-sdk');
    
    // CORRECCIÓN IMPORTANTE: Según las pruebas realizadas con SDK v6.1.0
    // Para ambiente de integración, usar buildForIntegration CON credenciales
    // Para ambiente de producción, usar buildForProduction con credenciales
    if (TBK_ENVIRONMENT === 'integration') {
      // En modo integración, usar buildForIntegration CON credenciales de prueba
      webpayPlus = WebpayPlus.Transaction.buildForIntegration(TBK_COMMERCE_CODE, TBK_API_KEY);
    } else {
      // En modo producción, usar buildForProduction con credenciales reales
      webpayPlus = WebpayPlus.Transaction.buildForProduction(TBK_COMMERCE_CODE, TBK_API_KEY);
    }
  } catch (error) {
    console.error('Error al cargar SDK de Transbank:', error.message);
    console.error('Stack trace:', error.stack);
    console.log('Fallback: Se usará modo mock para esta sesión');
  }
} else {
  console.log('Usando modo mock para Transbank (configurado por variable de entorno)');
}

class TransbankService {
  constructor() {
    this.commerceCode = TBK_COMMERCE_CODE;
    this.apiKey = TBK_API_KEY;
    this.environment = TBK_ENVIRONMENT;
    this.useMock = USE_MOCK_TRANSBANK;
  }

  // Crear una transacción de pago
  async createTransaction(citaId, amount, sessionId, returnUrl) {
    try {
      // Generar buyOrder único siguiendo el ejemplo
      const buyOrder = `O-${citaId}-${Date.now()}`;
      
      // CORRECCIÓN: Convertir amount a string según la documentación
      const amountString = amount.toString();
      
      if (this.useMock || !webpayPlus) {
        // Modo mock - simular transacción exitosa
        const mockToken = `01abf71db551b4c4f7a4278ef9a4175936e3b361da9650af94f5e01a6f2cc24b${citaId}`;
        const mockUrl = 'https://webpay3gint.transbank.cl/webpayserver/initTransaction';
        
        // Guardar información de la transacción en la base de datos
        await this.saveTransactionInfo(citaId, {
          token: mockToken,
          amount: amountString,
          url: mockUrl
        }, amountString);

        return {
          success: true,
          transaction: {
            token: mockToken,
            url: mockUrl,
            amount: amountString
          },
          url: mockUrl,
          token: mockToken
        };
      } else {
        // Modo real - usar SDK de Transbank siguiendo la documentación oficial
        
        // CORRECCIÓN: Orden correcto de parámetros según documentación: buyOrder, sessionId, amount, returnUrl
        const transaction = await webpayPlus.create(
          buyOrder,
          sessionId,
          amountString,
          returnUrl
        );

        // Guardar información de la transacción en la base de datos
        await this.saveTransactionInfo(citaId, transaction, amountString);

        return {
          success: true,
          transaction: transaction,
          url: transaction.url,
          token: transaction.token
        };
      }
    } catch (error) {
      console.error('Error al crear transacción de Transbank:', error);
      console.error('Detalles del error:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode
      });
      throw new Error(`Error al procesar el pago: ${error.message}`);
    }
  }

  // Guardar información de la transacción en la base de datos
  async saveTransactionInfo(citaId, transaction, originalAmount = null) {
    try {
      // CORRECCIÓN: Usar el monto original si transaction.amount es null
      let monto = transaction.amount;
      if (!monto && originalAmount) {
        monto = originalAmount;
      }
      
      // Validar que tenemos un monto válido
      if (!monto || monto === null || monto === undefined) {
        throw new Error('No se pudo determinar el monto de la transacción');
      }

      await db.query(`
        INSERT INTO TransaccionesPago (
          cita_id,
          token_transbank,
          monto,
          estado,
          url_pago,
          creado_en
        ) VALUES (
          @cita_id,
          @token_transbank,
          @monto,
          'pendiente',
          @url_pago,
          GETDATE()
        )
      `, {
        cita_id: citaId,
        token_transbank: transaction.token,
        monto: monto,
        url_pago: transaction.url
      });

    } catch (error) {
      console.error('Error al guardar transacción en BD:', error);
      throw error;
    }
  }

  // Confirmar una transacción - EXACTAMENTE según documentación Transbank
  async commitTransactionSimple(token) {
    try {
      
      let result;
      
      if (this.useMock || !webpayPlus) {
        
        // Obtener monto de la BD para el mock
        const [transactionData] = await db.query(`
          SELECT monto, cita_id FROM TransaccionesPago WHERE token_transbank = @token
        `, { token });
        
        const amount = transactionData ? transactionData.monto : 30000;
        const citaId = transactionData ? transactionData.cita_id : 1;
        
        // Respuesta mock exacta según documentación
        result = {
          "vci": "TSY",
          "amount": amount,
          "status": "AUTHORIZED",
          "buy_order": `O-${citaId}`,
          "session_id": `S-${citaId}`,
          "card_detail": {
            "card_number": "6590"
          },
          "accounting_date": "0716",
          "transaction_date": new Date().toISOString(),
          "authorization_code": "1213",
          "payment_type_code": "VP",
          "response_code": 0,
          "installments_amount": null,
          "installments_number": 0,
          "balance": null
        };
      } else {
        
        try {
          // Paso 2 de la documentación: const commitResponse = await (new WebpayPlus.Transaction()).commit(token);
          result = await webpayPlus.commit(token);
        } catch (transbankError) {
          console.error(`[SDK] ERROR: Transbank real falló - NO se usará fallback por seguridad comercial`);
          console.error(`[SDK] Error de Transbank:`, transbankError.message);
          
          // FALLBACK DESACTIVADO POR SEGURIDAD COMERCIAL
          // ⚠️ PELIGRO: No activar en producción - podría aprobar pagos sin cobrar
          /*
          // FALLBACK: Si Transbank real falla, usar mock
          const [transactionData] = await db.query(`
            SELECT monto, cita_id FROM TransaccionesPago WHERE token_transbank = @token
          `, { token });
          
          const amount = transactionData ? transactionData.monto : 30000;
          const citaId = transactionData ? transactionData.cita_id : 1;
          
          // Respuesta mock como fallback
          result = {
            "vci": "TSY",
            "amount": amount,
            "status": "AUTHORIZED",
            "buy_order": `O-${citaId}`,
            "session_id": `S-${citaId}`,
            "card_detail": {
              "card_number": "6590"
            },
            "accounting_date": "0716",
            "transaction_date": new Date().toISOString(),
            "authorization_code": "1213",
            "payment_type_code": "VP",
            "response_code": 0,
            "installments_amount": null,
            "installments_number": 0,
            "balance": null
          };
          
          console.log(`[SDK] FALLBACK activado - simulando pago exitoso`);
          */
          
          // Propagar el error original en lugar de usar fallback
          throw new Error(`Error de Transbank: ${transbankError.message}`);
        }
      }
      
      // Actualizar estado en BD
      const status = result.status === 'AUTHORIZED' ? 'aprobada' : 'rechazada';
      await db.query(`
        UPDATE TransaccionesPago
        SET 
          estado = @estado,
          respuesta_transbank = @respuesta,
          actualizado_en = GETDATE()
        WHERE token_transbank = @token
      `, {
        estado: status,
        respuesta: JSON.stringify(result),
        token: token
      });
      
      return result; // Devolver directamente el resultado, no un wrapper
      
    } catch (error) {
      console.error('[SDK] Error al confirmar transacción:', error);
      throw error; // Propagar el error original
    }
  }

  // Método original (mantener por compatibilidad)
  async commitTransaction(token) {
    const result = await this.commitTransactionSimple(token);
    return {
      success: true,
      result: result
    };
  }

  // Actualizar estado de la transacción en la base de datos
  async updateTransactionStatus(token, result) {
    try {
      const status = result.status === 'AUTHORIZED' ? 'aprobada' : 'rechazada';
      
      await db.query(`
        UPDATE TransaccionesPago
        SET 
          estado = @estado,
          respuesta_transbank = @respuesta,
          actualizado_en = GETDATE()
        WHERE token_transbank = @token
      `, {
        estado: status,
        respuesta: JSON.stringify(result),
        token: token
      });

    } catch (error) {
      console.error('Error al actualizar estado de transacción:', error);
      throw error;
    }
  }

  // Obtener información de una transacción
  async getTransactionInfo(token) {
    try {
      
      // Primero verificar si existe el token en la tabla
      const tokenCheck = await db.query(`
        SELECT token_transbank, cita_id FROM TransaccionesPago 
        WHERE token_transbank = @token
      `, { token });
      
      if (tokenCheck.length === 0) {
        
        // Buscar tokens similares para debug
        const similarTokens = await db.query(`
          SELECT TOP 5 token_transbank, cita_id, creado_en 
          FROM TransaccionesPago 
          ORDER BY creado_en DESC
        `);
        
        return null;
      }

      // Verificar paso a paso los JOINs
      
      const citaCheck = await db.query(`
        SELECT id, usuario_id, estado, fecha_hora 
        FROM CitasMedicas 
        WHERE id = @cita_id
      `, { cita_id: tokenCheck[0].cita_id });
      
      
      if (citaCheck.length === 0) {
        console.log(`ERROR: No existe cita con ID ${tokenCheck[0].cita_id}`);
        return null;
      }
      
      
      const usuarioCheck = await db.query(`
        SELECT id, nombre, apellido 
        FROM Usuarios 
        WHERE id = @usuario_id
      `, { usuario_id: citaCheck[0].usuario_id });
      
      
      if (usuarioCheck.length === 0) {
        console.log(`ERROR: No existe usuario con ID ${citaCheck[0].usuario_id}`);
        return null;
      }

      // Ahora hacer la consulta completa
      const [transaction] = await db.query(`
        SELECT 
          tp.*,
          c.usuario_id,
          c.fecha_hora,
          c.estado as estado_cita,
          u.nombre + ' ' + u.apellido as nombre_paciente
        FROM TransaccionesPago tp
        INNER JOIN CitasMedicas c ON tp.cita_id = c.id
        INNER JOIN Usuarios u ON c.usuario_id = u.id
        WHERE tp.token_transbank = @token
      `, { token });

      return transaction;
    } catch (error) {
      console.error('[getTransactionInfo] Error al obtener información de transacción:', error);
      throw error;
    }
  }

  // Verificar si una cita ya tiene un pago aprobado
  async hasApprovedPayment(citaId) {
    try {
      const [transaction] = await db.query(`
        SELECT id, estado
        FROM TransaccionesPago
        WHERE cita_id = @cita_id AND estado = 'aprobada'
      `, { cita_id: citaId });

      return !!transaction;
    } catch (error) {
      console.error('Error al verificar pago aprobado:', error);
      return false;
    }
  }

  // Obtener monto de la cita según la especialidad del médico
  async getAppointmentAmount(citaId) {
    try {
      
      // Obtener información de la cita y la especialidad del médico
      const [cita] = await db.query(`
        SELECT 
          c.id,
          c.medico_id,
          m.especialidad
        FROM CitasMedicas c
        LEFT JOIN Usuarios m ON c.medico_id = m.id AND m.role = 'medico'
        WHERE c.id = @citaId
      `, { citaId });

      if (!cita) {
        console.log(`Cita ${citaId} no encontrada, usando precio por defecto`);
        return PRECIOS_ESPECIALIDADES["Medicina General"];
      }

      const especialidad = cita.especialidad;
      
      if (!especialidad) {
        console.log(`Especialidad no encontrada para cita ${citaId}, usando Medicina General`);
        return PRECIOS_ESPECIALIDADES["Medicina General"];
      }

      const precio = PRECIOS_ESPECIALIDADES[especialidad];
      
      if (!precio) {
        console.log(`Precio no encontrado para especialidad "${especialidad}", usando Medicina General`);
        console.log(`Especialidades disponibles:`, Object.keys(PRECIOS_ESPECIALIDADES));
        return PRECIOS_ESPECIALIDADES["Medicina General"];
      }

      return precio;

    } catch (error) {
      console.error(`Error al obtener monto de la cita ${citaId}:`, error);
      console.error('Stack trace:', error.stack);
      // Retornar precio por defecto en caso de error
      console.log(`Usando precio por defecto: $${PRECIOS_ESPECIALIDADES["Medicina General"]}`);
      return PRECIOS_ESPECIALIDADES["Medicina General"];
    }
  }

  // Generar session ID único siguiendo el patrón del ejemplo
  generateSessionId(userId, citaId) {
    return `S-${userId}-${citaId}-${Date.now()}`;
  }

  // Obtener lista de precios de especialidades
  getEspecialidadesPrices() {
    return PRECIOS_ESPECIALIDADES;
  }

  // Obtener estado de la configuración
  getConfigurationStatus() {
    return {
      commerceCode: this.commerceCode,
      environment: this.environment,
      useMock: this.useMock,
      webpayPlusLoaded: !!webpayPlus,
      sdkVersion: webpayPlus ? 'SDK cargado' : 'SDK no cargado'
    };
  }

  // Verificar si Transbank está disponible
  isTransbankAvailable() {
    return !this.useMock && !!webpayPlus;
  }

  // Validar respuesta de Transbank
  validateTransactionResponse(result) {
    if (!result) {
      throw new Error('Respuesta de Transbank inválida');
    }

    if (result.status !== 'AUTHORIZED') {
      throw new Error(`Transacción rechazada: ${result.status}`);
    }

    return true;
  }
}

module.exports = new TransbankService(); 