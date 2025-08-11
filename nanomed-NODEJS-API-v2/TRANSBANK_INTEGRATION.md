# Integración Completa de Transbank WebPay Plus para NANOMED

## 📋 Descripción General

Esta integración implementa un sistema completo de pagos para citas médicas utilizando **Transbank WebPay Plus**. El flujo permite a los pacientes pagar sus citas médicas de forma segura y automática, confirmando la cita únicamente cuando el pago es exitoso.

### Características Principales

- ✅ **Pago automático** al crear citas médicas
- ✅ **Confirmación automática** de citas tras pago exitoso
- ✅ **Manejo de errores** y reintentos de pago
- ✅ **Modo mock** para desarrollo y testing
- ✅ **Validaciones de seguridad** completas
- ✅ **Logging detallado** para debugging
- ✅ **Estados de transacción** rastreados en BD

## Arquitectura del Sistema

### Backend (Node.js + Express)

#### Archivos Principales:
```
api/src/
├── utils/
│   └── transbankService.js          # Servicio principal de Transbank
├── appointments/
│   ├── rutas-pago.js               # Endpoints de pagos
│   ├── rutas.js                    # Rutas principales (incluye pagos)
│   └── controlador.js              # Lógica de citas
└── db/
    └── sqlserver.js                # Conexión a base de datos
```

#### Base de Datos:
```
api/
├── transacciones_pago.sql          # Script de tabla de transacciones
└── EstucturaBDD.sql               # Estructura completa de BD
```

### Frontend (Next.js + TypeScript)

#### Archivos Principales:
```
website/
├── lib/api/services/
│   └── payment.service.ts          # Servicio de pagos del frontend
├── app/dashboard/citas/
│   ├── payment/confirm/
│   │   └── page.tsx               # Página de confirmación de pago
│   └── page.tsx                   # Página principal de citas
└── components/
    └── ui/                        # Componentes de UI
```

## ⚙️ Configuración del Sistema

### Variables de Entorno Requeridas

```bash
# ==========================================
# CONFIGURACIÓN DE TRANSBANK
# ==========================================

# Credenciales de Transbank
TBK_COMMERCE_CODE=597055555532                    # Código de comercio (pruebas)
TBK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C  # API Key (pruebas)

# Ambiente de Transbank
TBK_ENVIRONMENT=integration                       # 'integration' para pruebas, 'production' para producción

# URLs del sistema
CLIENT_URL=https://nanomed-frontend.vercel.app    # URL del frontend
FRONTEND_URL=http://localhost:3000                # URL local para desarrollo

# Modo de desarrollo (opcional)
USE_MOCK_TRANSBANK=false                          # 'true' para usar modo mock, 'false' para Transbank real
```

### Instalación de Dependencias

```bash
# Backend - Instalar SDK de Transbank
cd api
npm install transbank-sdk

# Frontend - Dependencias ya incluidas
cd website
npm install
```

## 🔧 Configuración del SDK de Transbank

### Configuración Corregida y Verificada

```javascript
// api/src/utils/transbankService.js

const { WebpayPlus } = require('transbank-sdk');

// Configuración según ambiente
if (TBK_ENVIRONMENT === 'integration') {
  // Ambiente de pruebas - usar buildForIntegration CON credenciales de prueba
  webpayPlus = WebpayPlus.Transaction.buildForIntegration(TBK_COMMERCE_CODE, TBK_API_KEY);
} else {
  // Ambiente de producción - usar buildForProduction con credenciales reales
  webpayPlus = WebpayPlus.Transaction.buildForProduction(TBK_COMMERCE_CODE, TBK_API_KEY);
}
```

### ⚠️ Correcciones Implementadas

1. **Configuración del SDK**: 
   - ❌ ANTES: `buildForIntegration()` sin parámetros
   - ✅ AHORA: `buildForIntegration(commerceCode, apiKey)` con credenciales de prueba
   - ✅ PRODUCCIÓN: `buildForProduction(commerceCode, apiKey)` con credenciales reales

2. **Tipos de datos**:
   - ❌ ANTES: `amount` como número
   - ✅ AHORA: `amount` como string (requerido por Transbank)

3. **Orden de parámetros**:
   - ✅ CONFIRMADO: `create(buyOrder, sessionId, amount, returnUrl)` es correcto

4. **URL de redirección**:
   - ❌ ANTES: Llegaba a `init_transaction.cgi`
   - ✅ AHORA: Llega correctamente a `initTransaction`

## 💰 Sistema de Precios por Especialidad

### Precios Configurados (CLP)

```javascript
const PRECIOS_ESPECIALIDADES = {
  "Medicina General": 30000,
  "Kinesiología": 30000,
  "Kinesiología de Piso Pélvico": 25000,
  "Fonoaudiología": 35000,
  "Nutrición": 35000,                    // Telemedicina: 35000, Presencial: 30000
  "Matrona": 30000,
  "Psicología Adulta": 40000,
  "Pediatría": 45000,
  "Psicología Infanto-Juvenil": 45000,
  "Medicina Interna": 45000,
  "Traumatología y Ortopedia": 45000,
  "Cardiología": 55000,
  "Dermatología": 55000,
  "Neurología": 55000,
  "Oftalmología": 55000,
  "Ginecología": 55000,                  // Telemedicina: 55000, Presencial: 45000
  "Psiquiatría Pediátrica y Adolescencia": 70000,
  "Psiquiatría Adulto": 80000,
  "Nutrición Deportiva": 40000,
  "Terapia del Sueño": 40000
};
```

## Flujo Completo de Pago

### 1. Creación de Cita con Pago Automático

```typescript
// Frontend: NuevaCitaDialog
const handleSubmit = async (e: React.FormEvent) => {
  try {
    // 1. Crear cita en estado 'programada'
    const citaResponse = await appointmentsService.createAppointment(datosCita)
    
    if (citaResponse.error) {
      throw new Error(citaResponse.message)
    }
    
    // 2. Procesar pago inmediatamente
    const paymentResponse = await paymentService.createPaymentTransaction(citaResponse.body.id)
    
    if (paymentResponse.error) {
      throw new Error(paymentResponse.message)
    }
    
    // 3. Redirigir a Transbank
    paymentService.redirectToPayment(paymentResponse.body.url_pago)
    
  } catch (error) {
    console.error('Error en flujo de pago:', error)
    // Manejar error y mostrar mensaje al usuario
  }
}
```

### 2. Procesamiento en Transbank

```javascript
// Backend: transbankService.js
async createTransaction(citaId, amount, sessionId, returnUrl) {
  try {
    // Generar buyOrder único
    const buyOrder = `O-${citaId}-${Date.now()}`;
    
    // CORRECCIÓN: Convertir amount a string (requerido por Transbank)
    const amountString = amount.toString();
    
    // Crear transacción en Transbank
    const transaction = await webpayPlus.create(
      buyOrder,        // Orden de compra única
      sessionId,       // ID de sesión del usuario
      amountString,    // Monto como string
      returnUrl        // URL de retorno
    );
    
    // Guardar transacción en BD
    await this.saveTransactionInfo(citaId, transaction, amountString);
    
    return {
      success: true,
      url: transaction.url,
      token: transaction.token
    };
  } catch (error) {
    console.error('Error al crear transacción:', error);
    throw error;
  }
}
```

### 3. Confirmación de Pago

```javascript
// Backend: rutas-pago.js
async confirmarTransaccionPago(req, res, next) {
  try {
    const { token_ws } = req.body;
    
    // Confirmar transacción con Transbank
    const result = await transbankService.commitTransaction(token_ws);
    
    // Obtener información de la transacción
    const transactionInfo = await transbankService.getTransactionInfo(token_ws);
    
    // Si el pago fue exitoso, confirmar la cita automáticamente
    if (result.status === 'AUTHORIZED') {
      await controlador.actualizarCita(
        transactionInfo.cita_id, 
        transactionInfo.usuario_id, 
        { estado: 'confirmada' }
      );
      
      console.log(`Cita ${transactionInfo.cita_id} confirmada después del pago exitoso`);
    }
    
    // Responder con resultado
    respuesta.success(req, res, {
      status: result.status,
      amount: result.amount,
      orderId: result.orderId,
      cita_id: transactionInfo.cita_id
    });
    
  } catch (error) {
    next(error);
  }
}
```

## Endpoints de la API

### 1. Crear Transacción de Pago
```http
POST /api/appointments/:id/payment/create
Authorization: Bearer <token>

Response:
{
  "success": true,
  "body": {
    "url_pago": "https://webpay3gint.transbank.cl/webpayserver/initTransaction",
    "token": "01abf71db551b4c4f7a4278ef9a4175936e3b361da9650af94f5e01a6f2cc24b",
    "monto": 30000
  }
}
```

### 2. Confirmar Transacción
```http
POST /api/appointments/payment/confirm
Content-Type: application/json

Body:
{
  "token_ws": "01abf71db551b4c4f7a4278ef9a4175936e3b361da9650af94f5e01a6f2cc24b"
}

Response:
{
  "success": true,
  "body": {
    "status": "AUTHORIZED",
    "amount": 30000,
    "orderId": "O-123-1703123456789",
    "cita_id": 123
  }
}
```

### 3. Verificar Estado de Pago
```http
GET /api/appointments/:id/payment/status
Authorization: Bearer <token>

Response:
{
  "success": true,
  "body": {
    "cita_id": 123,
    "tiene_pago_aprobado": true,
    "estado_cita": "confirmada",
    "monto_cita": 30000
  }
}
```

### 4. Reintentar Pago
```http
POST /api/appointments/payment/retry
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "cita_id": 123
}

Response:
{
  "success": true,
  "body": {
    "url_pago": "https://webpay3gint.transbank.cl/webpayserver/initTransaction",
    "token": "02cdf82ec662c5d5f8b5389fg0b5287047f4c472eb0761bf05f2b7g3cc35d",
    "monto": 30000
  }
}
```

## Estructura de Base de Datos

### Tabla: TransaccionesPago

```sql
CREATE TABLE TransaccionesPago (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cita_id INT NOT NULL,
    token_transbank VARCHAR(255) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    url_pago VARCHAR(500),
    respuesta_transbank TEXT,                    -- JSON con respuesta completa de Transbank
    creado_en DATETIME DEFAULT GETDATE(),
    actualizado_en DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (cita_id) REFERENCES CitasMedicas(id) ON DELETE CASCADE,
    
    -- Índices para optimización
    INDEX idx_cita_id (cita_id),
    INDEX idx_token_transbank (token_transbank),
    INDEX idx_estado (estado),
    INDEX idx_creado_en (creado_en)
);
```

### Estados de Transacción:
- `pendiente` - Transacción creada, esperando pago
- `aprobada` - Pago exitoso, cita confirmada
- `rechazada` - Pago fallido
- `cancelada` - Transacción cancelada por el usuario

### Vistas y Procedimientos Almacenados:

```sql
-- Vista para información completa de transacciones
CREATE VIEW vw_TransaccionesPagoCompletas AS
SELECT 
    tp.*,
    c.fecha_hora,
    c.estado as estado_cita,
    u.nombre + ' ' + u.apellido as nombre_paciente,
    um.nombre + ' ' + um.apellido as nombre_medico,
    um.especialidad
FROM TransaccionesPago tp
INNER JOIN CitasMedicas c ON tp.cita_id = c.id
INNER JOIN Usuarios u ON c.usuario_id = u.id
LEFT JOIN Usuarios um ON c.medico_id = um.id;

-- Procedimiento para estadísticas de pagos
EXEC sp_ObtenerEstadisticasPagos @fecha_desde, @fecha_hasta

-- Procedimiento para limpiar transacciones antiguas
EXEC sp_LimpiarTransaccionesPendientes @dias_antiguedad = 7
```

## Componentes del Frontend

### PaymentService (TypeScript)

```typescript
export class PaymentService {
  // Crear transacción de pago
  async createPaymentTransaction(citaId: number): Promise<ApiResponse<PaymentTransaction>>
  
  // Confirmar transacción de pago
  async confirmPayment(token: string): Promise<ApiResponse<PaymentConfirmation>>
  
  // Verificar estado del pago
  async getPaymentStatus(citaId: number): Promise<ApiResponse<PaymentStatus>>
  
  // Reintentar pago
  async retryPayment(citaId: number): Promise<ApiResponse<PaymentTransaction>>
  
  // Redirigir a Transbank
  redirectToPayment(url: string): void
  
  // Formatear monto para mostrar
  formatAmount(amount: number): string
  
  // Verificar si el pago fue exitoso
  isPaymentSuccessful(status: string): boolean
  
  // Obtener mensaje de estado
  getPaymentStatusMessage(status: string): string
}
```

### Página de Confirmación de Pago

```typescript
// app/dashboard/citas/payment/confirm/page.tsx
export default function PaymentConfirmationPage() {
  // Maneja la respuesta de Transbank
  // Muestra resultado del pago (éxito/fallo)
  // Permite reintentar si falla
  // Redirige a citas si es exitoso
}
```

## Integración en CitaCard

### Estados de Pago y UI:

1. **Sin pago** → Botón "💳 Pagar cita"
2. **Pago pendiente** → Información de monto y estado
3. **Pago aprobado** → Botón "✅ Confirmar cita" (si no está confirmada)

### Flujo de Verificación:

```typescript
// Verificar estado del pago al cargar la cita
const verificarEstadoPago = async () => {
  try {
    const response = await paymentService.getPaymentStatus(citaId)
    if (!response.error) {
      setPaymentStatus(response.body)
    }
  } catch (error) {
    console.error('Error al verificar estado de pago:', error)
  }
}

// Procesar pago cuando el usuario hace clic
const procesarPago = async () => {
  try {
    setLoading(true)
    const response = await paymentService.createPaymentTransaction(citaId)
    
    if (!response.error) {
      paymentService.redirectToPayment(response.body.url_pago)
    } else {
      setError(response.message)
    }
  } catch (error) {
    setError('Error al procesar el pago')
  } finally {
    setLoading(false)
  }
}
```

## Seguridad y Validaciones

### Validaciones del Backend:

```javascript
// Verificación de propiedad de cita
const cita = await controlador.obtenerCita(citaId, userId);
if (!cita) {
  return respuesta.error(req, res, 'Cita no encontrada', 404);
}

// Verificación de estado de cita
if (cita.estado !== 'programada') {
  return respuesta.error(req, res, 'Solo se puede pagar citas programadas', 400);
}

// Prevención de pagos duplicados
const tienePagoAprobado = await transbankService.hasApprovedPayment(citaId);
if (tienePagoAprobado) {
  return respuesta.error(req, res, 'Esta cita ya tiene un pago aprobado', 400);
}
```

### Middleware de Autenticación:

```javascript
// Todas las rutas de pago requieren autenticación
router.use(verifyToken);
```

### Sanitización de Datos:

```javascript
// Validación de tipos de datos
const citaId = parseInt(req.params.id);
if (!citaId || isNaN(citaId)) {
  return respuesta.error(req, res, 'ID de cita inválido', 400);
}

// Validación de token de Transbank
if (!token_ws) {
  return respuesta.error(req, res, 'Token de transacción requerido', 400);
}
```

## Testing y Desarrollo

### Credenciales de Prueba:

```bash
# Credenciales de integración (pruebas)
TBK_COMMERCE_CODE=597055555532
TBK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C

# Tarjetas de prueba disponibles:
# - VISA: 4051885600446623
# - MASTERCARD: 5186059559590568
# - AMEX: 371449635398431
```

### Modo Mock para Desarrollo:

```bash
# Activar modo mock (no requiere conexión a Transbank)
USE_MOCK_TRANSBANK=true
```

### Scripts de Testing:

```bash
# Ejecutar prueba completa de flujo
node test-transbank-complete-flow.js

# Ejecutar prueba corregida
node test-transbank-corrected.js

# Ejecutar prueba simple
node test-transbank-simple.js
```

### Flujo de Testing:

1. **Crear cita** → Debe redirigir a Transbank
2. **Completar pago** → Debe confirmar cita automáticamente
3. **Verificar en BD** → Transacción debe estar como "aprobada"
4. **Verificar cita** → Estado debe ser "confirmada"

## Monitoreo y Logging

### Logs Importantes:

```javascript
// Logs de creación de transacción
console.log(`Iniciando proceso de pago para cita ${citaId}, usuario ${userId}`);
console.log(`Obteniendo monto para cita ${citaId}...`);
console.log(`Creando transacción en Transbank...`);
console.log(`Transacción creada exitosamente:`, { token, url, monto });

// Logs de confirmación
console.log(`Cita ${citaId} confirmada después del pago exitoso`);
console.log(`Transacción confirmada exitosamente:`, { token, status, amount });
```

### Métricas a Monitorear:

- **Tasa de éxito de pagos** (aprobados vs rechazados)
- **Tiempo de respuesta de Transbank**
- **Errores de confirmación**
- **Transacciones pendientes**
- **Monto promedio por especialidad**

### Dashboard de Monitoreo:

```sql
-- Consulta para dashboard de pagos
SELECT 
    COUNT(*) as total_transacciones,
    SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
    SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas,
    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
    SUM(CASE WHEN estado = 'aprobada' THEN monto ELSE 0 END) as monto_total
FROM TransaccionesPago
WHERE creado_en >= DATEADD(day, -30, GETDATE());
```

## 🔧 Mantenimiento

### Limpieza Automática:

```sql
-- Eliminar transacciones pendientes antiguas (más de 7 días)
EXEC sp_LimpiarTransaccionesPendientes @dias_antiguedad = 7
```

### Backup de Transacciones:

```sql
-- Crear backup mensual de transacciones
BACKUP TABLE TransaccionesPago TO 'backup_transacciones_YYYYMM.bak'
```

### Optimización de Rendimiento:

```sql
-- Índices recomendados
CREATE INDEX idx_transacciones_fecha ON TransaccionesPago(creado_en);
CREATE INDEX idx_transacciones_estado_fecha ON TransaccionesPago(estado, creado_en);
```

## Troubleshooting

### Problemas Comunes y Soluciones:

#### 1. Error de Configuración de Transbank
```bash
# VERIFICADO: Usar buildForIntegration con credenciales
webpayPlus = WebpayPlus.Transaction.buildForIntegration(TBK_COMMERCE_CODE, TBK_API_KEY);

# Verificar variables de entorno
echo $TBK_COMMERCE_CODE
echo $TBK_API_KEY
echo $TBK_ENVIRONMENT
```

#### 2. Problema de URL incorrecta (init_transaction.cgi)
**Síntoma**: Llegas a `https://webpay3gint.transbank.cl/webpayserver/init_transaction.cgi` en lugar de `initTransaction`

**Causa**: Configuración incorrecta del SDK de Transbank

**Solución**:
```javascript
// INCORRECTO (causa el problema)
webpayPlus = WebpayPlus.Transaction.buildForIntegration();

// CORRECTO (resuelve el problema)
webpayPlus = WebpayPlus.Transaction.buildForIntegration(TBK_COMMERCE_CODE, TBK_API_KEY);
```

**Verificación**:
```bash
# Ejecutar script de prueba
node test-transbank-final.js

# Debería mostrar: "URL CORRECTA: https://webpay3gint.transbank.cl/webpayserver/initTransaction"
```

#### 2. Error de Tipo de Datos
```javascript
// CORREGIDO: amount debe ser string, no número
const amountString = amount.toString();
const transaction = await webpayPlus.create(buyOrder, sessionId, amountString, returnUrl);
```

#### 3. Pago Exitoso pero Cita No Confirmada
```bash
# Verificar logs de confirmación
tail -f logs/app.log | grep "confirmada"

# Verificar permisos de usuario
SELECT * FROM Usuarios WHERE id = <user_id>;
```

#### 4. Error de Redirección
```bash
# Verificar configuración de URLs
echo $CLIENT_URL
echo $FRONTEND_URL

# Verificar configuración de CORS en el backend
```

### Debugging Avanzado:

```bash
# Verificar instalación del SDK
npm list transbank-sdk

# Ejecutar prueba de conectividad
node test-transbank-connectivity.js

# Verificar logs del servidor
tail -f logs/app.log | grep -i transbank

# Verificar estado de la base de datos
SELECT COUNT(*) as transacciones_pendientes FROM TransaccionesPago WHERE estado = 'pendiente';
```

## 📚 Referencias y Documentación

### Enlaces Oficiales:
- [Documentación Oficial Transbank](https://www.transbankdevelopers.cl/documentacion/webpay-plus)
- [SDK JavaScript](https://www.npmjs.com/package/transbank-sdk)
- [Credenciales de Prueba](https://www.transbankdevelopers.cl/documentacion/como_empezar#ambiente-de-integracion)
- [Guía de Integración](https://www.transbankdevelopers.cl/documentacion/webpay-plus#crear-una-transaccion)

### Archivos de Configuración:
- `api/src/utils/transbankService.js` - Servicio principal
- `api/src/appointments/rutas-pago.js` - Endpoints de pago
- `website/lib/api/services/payment.service.ts` - Servicio frontend
- `api/transacciones_pago.sql` - Estructura de BD

### Scripts de Testing:
- `api/test-transbank-complete-flow.js` - Flujo completo
- `api/test-transbank-corrected.js` - Prueba corregida
- `api/test-transbank-simple.js` - Prueba simple

## 🎯 Próximas Mejoras

### Funcionalidades Planificadas:

1. **Webhooks de Transbank** - Confirmación automática sin redirección
2. **Múltiples métodos de pago** - Integración con otros proveedores
3. **Facturación automática** - Generación de boletas/facturas
4. **Reembolsos** - Proceso de devoluciones
5. **Reportes avanzados** - Dashboard de analytics de pagos
6. **Notificaciones** - SMS/Email de confirmación de pago

### Optimizaciones Técnicas:

1. **Cache de precios** - Evitar consultas repetidas a BD
2. **Transacciones en lote** - Múltiples pagos simultáneos
3. **Retry automático** - Reintentos inteligentes en fallos
4. **Monitoreo en tiempo real** - Alertas automáticas
5. **Backup automático** - Respaldo de transacciones críticas

---

## 📞 Soporte

Para soporte técnico o consultas sobre la integración:

1. **Revisar logs** del servidor para errores específicos
2. **Verificar configuración** de variables de entorno
3. **Ejecutar scripts de testing** para validar conectividad
4. **Consultar documentación oficial** de Transbank
5. **Contactar al equipo de desarrollo** con logs y contexto completo

**Última actualización**: Julio 2025
**Versión de integración**: 2.0.0
**Estado**: Producción 

---

# 📄 Documentación Oficial Transbank (actualización 21-07-2025)

## Sitio oficial
https://transbankdevelopers.cl/documentacion/como_empezar#b-usando-un-sdk

## Proceso de integración

En NodeJS puedes instalar el SDK desde NPM:

```bash
npm install transbank-sdk
```

### Webpay Plus - Creación de transacción

En esta etapa, se procederá a la creación de una transacción con el fin de obtener un identificador único. Esto nos permitirá redirigir al Tarjetahabiente hacia el formulario de pago de Transbank en el siguiente paso.
Todas las transacciones en este proyecto de ejemplo son realizadas en ambiente de integración.

#### Paso 1: Petición
1. Comienza por importar la librería WebpayPlus en tu proyecto.
2. Luego, crea una transacción utilizando las funciones proporcionadas mediante el SDK.

```js
const WebpayPlus = require('transbank-sdk').WebpayPlus; // ES5
import { WebpayPlus } from 'transbank-sdk'; // ES6

// Es necesario ejecutar dentro de una función async para utilizar await
const createResponse = await (new WebpayPlus.Transaction()).create(
  buyOrder, 
  sessionId, 
  amount, 
  returnUrl
);
```

#### Paso 2: Respuesta
Una vez que hayas creado la transacción, aquí encontrarás los datos de respuesta generados por el proceso.

```json
{
  "token": "01ab58632e2dc8facb917aff786c5a8deaf8213583c9af5147786cfaa2c07e49",
  "url": "https://webpay3gint.transbank.cl/webpayserver/initTransaction"
}
```

#### Paso 3: Creación del formulario
Utiliza estos datos de respuesta para redireccionar al usuario al formulario de pago al Tarjetahabiente. Este formulario será la interfaz a través de la cual el usuario realizará su transacción.

```html
<form action="https://webpay3gint.transbank.cl/webpayserver/initTransaction" method="POST">
  <input type="hidden" name="token_ws" value="01ab58632e2dc8facb917aff786c5a8deaf8213583c9af5147786cfaa2c07e49"/>
  <input type="submit" value="Pagar"/>
</form>
```

#### Ejemplo
Para llevar a cabo una transacción de compra en nuestro sistema, primero debemos crear la transacción. Utilizaremos los siguientes datos para configurar la transacción:

| Campo                | Valor                                                        |
|----------------------|--------------------------------------------------------------|
| Orden de compra      | O-82901                                                      |
| ID de sesión         | S-96231                                                      |
| Monto                | 1261                                                         |
| URL de retorno       | http://proyecto-ejemplo-node.transbankdevelopers.cl/webpay-plus/commit |

Por último, con la respuesta del servicio que confirma la creación de la transacción, procedemos a crear el formulario de pago. Para fines de este ejemplo, haremos visible el campo "token_ws", el cual es esencial para completar el proceso de pago de manera exitosa.

---

## Tarjetas de Prueba
Para las transacciones Webpay en el ambiente de integración se deben usar estas tarjetas de prueba:

| Tipo de tarjeta   | Número                        | CVV   | Expiración           | Resultado                  |
|-------------------|-------------------------------|-------|----------------------|----------------------------|
| VISA              | 4051 8856 0044 6623           | 123   | Cualquier fecha      | Transacción aprobada       |
| AMEX              | 3700 0000 0002 032            | 1234  | Cualquier fecha      | Transacción aprobada       |
| MASTERCARD        | 5186 0595 5959 0568           | 123   | Cualquier fecha      | Transacción rechazada      |
| Redcompra         | 4051 8842 3993 7763           |       |                      | Aprobada (débito)          |
| Redcompra         | 4511 3466 6003 7060           |       |                      | Aprobada (débito)          |
| Redcompra         | 5186 0085 4123 3829           |       |                      | Rechazada (débito)         |
| Prepago VISA      | 4051 8860 0005 6590           | 123   | Cualquier fecha      | Transacción aprobada       |
| Prepago MASTERCARD| 5186 1741 1062 9480           | 123   | Cualquier fecha      | Transacción rechazada      |

Cuando aparece un formulario de autenticación con RUT y clave, se debe usar el RUT 11.111.111-1 y la clave 123.

---

## Webpay Plus - Confirmar transacción

En este paso es importante confirmar la transacción para notificar a Transbank que hemos recibido exitosamente los detalles de la transacción. Es importante destacar que si la confirmación no se realiza, la transacción será caducada.

### Paso 1: Datos recibidos
Después de completar el flujo en el formulario de pago, recibirás un GET con la siguiente información:

```json
{
  "token_ws": "01ab58632e2dc8facb917aff786c5a8deaf8213583c9af5147786cfaa2c07e49"
}
```

### Paso 2: Petición
Utilizarás el token recibido para confirmar la transacción mediante el SDK.

```js
const token = request.body.token_ws;
const commitResponse = await (new WebpayPlus.Transaction()).commit(token);
```

### Paso 3: Respuesta
Una vez que la transacción ha sido confirmada Transbank proporcionará la siguiente información. Es fundamental conservar esta respuesta y verificar que el campo "response_code" tenga un valor de cero y que el campo "status" sea "AUTHORIZED".

```json
{
  "vci": "TSY",
  "amount": 1261,
  "status": "AUTHORIZED",
  "buy_order": "O-82901",
  "session_id": "S-96231",
  "card_detail": {
    "card_number": "6623"
  },
  "accounting_date": "0721",
  "transaction_date": "2025-07-21T19:51:14.075Z",
  "authorization_code": "1213",
  "payment_type_code": "VN",
  "response_code": 0,
  "installments_amount": null,
  "installments_number": 0,
  "balance": null
}
```

¡Listo!
Con la confirmación exitosa, ya puedes mostrar al usuario una página de éxito de la transacción, proporcionándole la tranquilidad de que el proceso ha sido completado con éxito.

De lo contrario, si se ha producido un error:

Cuando se procesaba la operación, la API encontró un problema y devolvió un error.

```
AxiosError: Request failed with status code 500
Unexpected error
```

---

# Proceso de producción

Si ya tienes tu código de comercio de producción y llave secreta, ahora solo debes configurar tu proyecto para que use el ambiente de producción, proporcionándole tus credenciales. Te explicamos como hacerlo en los diferentes SDK realizando los siguientes pasos:

Definir que se usará el ambiente de producción y pasar el Api Key (Código de comercio) y el Api Key Secret (Llave secreta)

```js
/**
* Todos los productos se pueden configurar de 2 formas:
* 1.- Pasando un objeto Options en su constructor.
* 2.- Utilizando los nuevos métodos de configuración
*/

//Uso del objeto Options (aplicable a todos los productos)
import { Environment, Options, WebpayPlus } from "transbank-sdk";

const options = new Options("commerceCode", "APIKey", Environment.Production);
const transaction = new WebpayPlus.Transaction(options);

//Uso de los métodos de configuración

//Webpay Plus
import { WebpayPlus } from "transbank-sdk";

const transaction = WebpayPlus.Transaction.buildForProduction(
  "commerceCode",
  "APIKey"
);
const mallTransaction = WebpayPlus.MallTransaction.buildForProduction(
  "commerceCode",
  "APIKey"
);

//Oneclick
import { Oneclick } from "transbank-sdk";

const inscription = Oneclick.MallInscription.buildForProduction(
  "commerceCode",
  "APIKey"
);
const transaction = Oneclick.MallTransaction.buildForProduction(
  "commerceCode",
  "APIKey"
);

// Transacción Completa
import { TransaccionCompleta } from "transbank-sdk";

const transaction = TransaccionCompleta.Transaction.buildForProduction(
  "commerceCode",
  "APIKey"
);
const mallTransaction = TransaccionCompleta.MallTransaction.buildForProduction(
  "commerceCode",
  "APIKey"
);

// PatPass Comercio
// Es importante destacar que la clase Options para PatPass se importa desde una ruta distinta que en el resto de productos.
import { PatpassComercio, PatpassEnvironment, Options } from "transbank-sdk";
//Uso del objeto Options
const options = new Options(
  "commerceCode",
  "APIKey",
  PatpassEnvironment.Production
);
const inscription = new PatpassComercio.Inscription(options);
// Uso del método de configuración
const inscription = PatpassComercio.Inscription.buildForProduction(
  "commerceCode",
  "APIKey"
);
```

--- 