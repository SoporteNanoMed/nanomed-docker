-- ==========================================
-- Tabla: TransaccionesPago
-- ==========================================
-- Esta tabla almacena la información de las transacciones de pago con Transbank

CREATE TABLE TransaccionesPago (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cita_id INT NOT NULL,
    token_transbank VARCHAR(255) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'aprobada', 'rechazada', 'cancelada'
    url_pago VARCHAR(500),
    respuesta_transbank TEXT, -- JSON con la respuesta completa de Transbank
    creado_en DATETIME DEFAULT GETDATE(),
    actualizado_en DATETIME DEFAULT GETDATE(),
    
    -- Claves foráneas
    FOREIGN KEY (cita_id) REFERENCES CitasMedicas(id) ON DELETE CASCADE,
    
    -- Índices para mejorar rendimiento
    INDEX idx_cita_id (cita_id),
    INDEX idx_token_transbank (token_transbank),
    INDEX idx_estado (estado),
    INDEX idx_creado_en (creado_en)
);

-- Comentarios sobre la tabla
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Tabla para almacenar transacciones de pago con Transbank', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago';

-- Comentarios sobre las columnas
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'ID único de la transacción', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago', 
    @level2type = N'COLUMN', @level2name = N'id';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'ID de la cita médica asociada', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago', 
    @level2type = N'COLUMN', @level2name = N'cita_id';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Token único de Transbank para la transacción', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago', 
    @level2type = N'COLUMN', @level2name = N'token_transbank';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Monto de la transacción en pesos chilenos', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago', 
    @level2type = N'COLUMN', @level2name = N'monto';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Estado de la transacción: pendiente, aprobada, rechazada, cancelada', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago', 
    @level2type = N'COLUMN', @level2name = N'estado';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'URL de pago generada por Transbank', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago', 
    @level2type = N'COLUMN', @level2name = N'url_pago';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Respuesta completa de Transbank en formato JSON', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago', 
    @level2type = N'COLUMN', @level2name = N'respuesta_transbank';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Fecha y hora de creación de la transacción', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago', 
    @level2type = N'COLUMN', @level2name = N'creado_en';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Fecha y hora de última actualización de la transacción', 
    @level0type = N'SCHEMA', @level0name = N'dbo', 
    @level1type = N'TABLE', @level1name = N'TransaccionesPago', 
    @level2type = N'COLUMN', @level2name = N'actualizado_en';

-- Trigger para actualizar la fecha de actualización automáticamente
CREATE TRIGGER TR_TransaccionesPago_UpdateTimestamp
ON TransaccionesPago
AFTER UPDATE
AS
BEGIN
    UPDATE TransaccionesPago
    SET actualizado_en = GETDATE()
    FROM TransaccionesPago t
    INNER JOIN inserted i ON t.id = i.id;
END;

-- Vista para obtener información completa de transacciones con datos de cita
CREATE VIEW vw_TransaccionesPagoCompletas AS
SELECT 
    tp.id,
    tp.cita_id,
    tp.token_transbank,
    tp.monto,
    tp.estado as estado_transaccion,
    tp.url_pago,
    tp.respuesta_transbank,
    tp.creado_en,
    tp.actualizado_en,
    c.fecha_hora,
    c.estado as estado_cita,
    c.lugar,
    c.direccion,
    c.notas,
    u.nombre + ' ' + u.apellido as nombre_paciente,
    u.email as email_paciente,
    um.nombre + ' ' + um.apellido as nombre_medico,
    um.especialidad
FROM TransaccionesPago tp
INNER JOIN CitasMedicas c ON tp.cita_id = c.id
INNER JOIN Usuarios u ON c.usuario_id = u.id
LEFT JOIN Usuarios um ON c.medico_id = um.id;

-- Procedimiento almacenado para obtener estadísticas de pagos
CREATE PROCEDURE sp_ObtenerEstadisticasPagos
    @fecha_desde DATETIME = NULL,
    @fecha_hasta DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @fecha_desde IS NULL
        SET @fecha_desde = DATEADD(day, -30, GETDATE());
    
    IF @fecha_hasta IS NULL
        SET @fecha_hasta = GETDATE();
    
    SELECT 
        COUNT(*) as total_transacciones,
        SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as transacciones_aprobadas,
        SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as transacciones_rechazadas,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as transacciones_pendientes,
        SUM(CASE WHEN estado = 'aprobada' THEN monto ELSE 0 END) as monto_total_aprobado,
        AVG(CASE WHEN estado = 'aprobada' THEN monto ELSE NULL END) as monto_promedio_aprobado
    FROM TransaccionesPago
    WHERE creado_en BETWEEN @fecha_desde AND @fecha_hasta;
END;

-- Procedimiento almacenado para limpiar transacciones antiguas pendientes
CREATE PROCEDURE sp_LimpiarTransaccionesPendientes
    @dias_antiguedad INT = 7
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM TransaccionesPago
    WHERE estado = 'pendiente' 
    AND creado_en < DATEADD(day, -@dias_antiguedad, GETDATE());
    
    SELECT @@ROWCOUNT as transacciones_eliminadas;
END; 