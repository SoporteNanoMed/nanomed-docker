-- ==========================================
-- SCRIPT PARA ELIMINACIÓN COMPLETA DE TODAS LAS CITAS
-- ==========================================
-- Descripción: Elimina TODAS las citas médicas del sistema y datos relacionados
-- ADVERTENCIA: Esta operación es IRREVERSIBLE
-- Autor: Sistema de Administración
-- Fecha: Generated $(date)

-- ==========================================
-- PASO 1: INFORMACIÓN Y VERIFICACIONES PREVIAS
-- ==========================================

PRINT '=================================================================';
PRINT '⚠️  SCRIPT DE ELIMINACIÓN COMPLETA DE TODAS LAS CITAS';
PRINT '⚠️  ESTA OPERACIÓN ES IRREVERSIBLE';
PRINT '=================================================================';

-- Mostrar estadísticas actuales del sistema
PRINT '=== ESTADÍSTICAS ACTUALES DEL SISTEMA ===';

SELECT 
    'Total de citas en el sistema' as descripcion,
    COUNT(*) as cantidad
FROM CitasMedicas
UNION ALL
SELECT 
    'Citas por estado' as descripcion,
    COUNT(*) as cantidad
FROM CitasMedicas
GROUP BY estado
UNION ALL
SELECT 
    'Total de usuarios en el sistema' as descripcion,
    COUNT(*) as cantidad
FROM Usuarios
UNION ALL
SELECT 
    'Total de médicos activos' as descripcion,
    COUNT(*) as cantidad
FROM Usuarios 
WHERE role IN ('doctor', 'medico')
UNION ALL
SELECT 
    'Total de bloques de disponibilidad' as descripcion,
    COUNT(*) as cantidad
FROM BloquesDisponibilidad
UNION ALL
SELECT 
    'Bloques vinculados a citas' as descripcion,
    COUNT(*) as cantidad
FROM BloquesDisponibilidad 
WHERE cita_id IS NOT NULL
UNION ALL
SELECT 
    'Total de notificaciones de citas' as descripcion,
    COUNT(*) as cantidad
FROM Notificaciones 
WHERE referencia_tipo = 'cita'
UNION ALL
SELECT 
    'Total de exámenes médicos' as descripcion,
    COUNT(*) as cantidad
FROM ExamenesMedicos;

-- Mostrar distribución de citas por estado
PRINT '=== DISTRIBUCIÓN DE CITAS POR ESTADO ===';
SELECT 
    ISNULL(estado, 'NULL') as estado,
    COUNT(*) as cantidad,
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM CitasMedicas) AS DECIMAL(5,2)) as porcentaje
FROM CitasMedicas
GROUP BY estado
ORDER BY cantidad DESC;

-- Mostrar citas más recientes
PRINT '=== ÚLTIMAS 10 CITAS CREADAS ===';
SELECT TOP 10
    id,
    usuario_id,
    medico_id,
    fecha_hora,
    estado,
    lugar,
    creado_en
FROM CitasMedicas
ORDER BY creado_en DESC;

-- ==========================================
-- PASO 2: CREAR RESPALDO DE SEGURIDAD (OPCIONAL)
-- ==========================================

PRINT '=== CREANDO RESPALDO DE SEGURIDAD ===';

-- Crear tabla temporal con respaldo de citas
IF OBJECT_ID('tempdb..#RespaldoCitas') IS NOT NULL
    DROP TABLE #RespaldoCitas;

SELECT * 
INTO #RespaldoCitas
FROM CitasMedicas;

DECLARE @totalRespaldadas INT = (SELECT COUNT(*) FROM #RespaldoCitas);
PRINT 'Citas respaldadas en tabla temporal: ' + CAST(@totalRespaldadas AS VARCHAR(10));

-- ==========================================
-- PASO 3: ELIMINACIÓN COMPLETA
-- ==========================================

PRINT '=== INICIANDO ELIMINACIÓN COMPLETA ===';

-- Iniciar transacción para operación atómica
BEGIN TRANSACTION LimpiezaCompleta;

BEGIN TRY
    
    -- 3.1 Eliminar notificaciones relacionadas con citas
    PRINT '--- Eliminando notificaciones relacionadas con citas ---';
    DELETE FROM Notificaciones
    WHERE referencia_tipo = 'cita';
    
    DECLARE @notificacionesEliminadas INT = @@ROWCOUNT;
    PRINT 'Notificaciones eliminadas: ' + CAST(@notificacionesEliminadas AS VARCHAR(10));

    -- 3.2 Desvincular y limpiar bloques de disponibilidad
    PRINT '--- Desvinculando bloques de disponibilidad ---';
    UPDATE BloquesDisponibilidad
    SET 
        cita_id = NULL,
        disponible = 1
    WHERE cita_id IS NOT NULL;
    
    DECLARE @bloquesDesvinculados INT = @@ROWCOUNT;
    PRINT 'Bloques desvinculados: ' + CAST(@bloquesDesvinculados AS VARCHAR(10));

    -- Opción: Eliminar TODOS los bloques de disponibilidad (descomenta si quieres reset completo)
    -- DELETE FROM BloquesDisponibilidad;
    -- PRINT 'Todos los bloques de disponibilidad eliminados';

    -- 3.3 Limpiar exámenes médicos que podrían estar vinculados a citas específicas
    -- (Opcional: solo si quieres eliminar TODOS los exámenes)
    -- DELETE FROM ExamenesMedicos;
    -- PRINT 'Todos los exámenes médicos eliminados';

    -- 3.4 Eliminar TODAS las citas médicas
    PRINT '--- Eliminando TODAS las citas médicas ---';
    DELETE FROM CitasMedicas;
    
    DECLARE @citasEliminadas INT = @@ROWCOUNT;
    PRINT 'Citas eliminadas: ' + CAST(@citasEliminadas AS VARCHAR(10));

    -- 3.5 Reiniciar contador de identidad (opcional)
    PRINT '--- Reiniciando contador de identidad ---';
    DBCC CHECKIDENT ('CitasMedicas', RESEED, 0);
    PRINT 'Contador de identidad de CitasMedicas reiniciado';

    -- Confirmar transacción
    COMMIT TRANSACTION LimpiezaCompleta;
    
    PRINT '✅ ELIMINACIÓN COMPLETADA EXITOSAMENTE';

END TRY
BEGIN CATCH
    -- En caso de error, revertir cambios
    ROLLBACK TRANSACTION LimpiezaCompleta;
    
    PRINT '❌ ERROR DURANTE LA ELIMINACIÓN:';
    PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR(10));
    PRINT 'Error Message: ' + ERROR_MESSAGE();
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));
    PRINT '🔄 Todos los cambios han sido revertidos';
    
    -- Relanzar el error
    THROW;
END CATCH;

-- ==========================================
-- PASO 4: VERIFICACIÓN POST-ELIMINACIÓN
-- ==========================================

PRINT '=== VERIFICACIÓN POST-ELIMINACIÓN ===';

-- Verificar que no quedan citas
DECLARE @citasRestantes INT = (SELECT COUNT(*) FROM CitasMedicas);
PRINT 'Citas restantes en el sistema: ' + CAST(@citasRestantes AS VARCHAR(10));

-- Verificar bloques desvinculados
DECLARE @bloquesVinculados INT = (SELECT COUNT(*) FROM BloquesDisponibilidad WHERE cita_id IS NOT NULL);
PRINT 'Bloques aún vinculados a citas: ' + CAST(@bloquesVinculados AS VARCHAR(10));

-- Verificar notificaciones
DECLARE @notificacionesCita INT = (SELECT COUNT(*) FROM Notificaciones WHERE referencia_tipo = 'cita');
PRINT 'Notificaciones de citas restantes: ' + CAST(@notificacionesCita AS VARCHAR(10));

-- Estadísticas finales
PRINT '=== ESTADÍSTICAS FINALES ===';
SELECT 
    'Citas restantes' as descripcion,
    COUNT(*) as cantidad
FROM CitasMedicas
UNION ALL
SELECT 
    'Bloques de disponibilidad totales' as descripcion,
    COUNT(*) as cantidad
FROM BloquesDisponibilidad
UNION ALL
SELECT 
    'Bloques disponibles (sin cita)' as descripcion,
    COUNT(*) as cantidad
FROM BloquesDisponibilidad 
WHERE cita_id IS NULL
UNION ALL
SELECT 
    'Usuarios activos' as descripcion,
    COUNT(*) as cantidad
FROM Usuarios
UNION ALL
SELECT 
    'Médicos activos' as descripcion,
    COUNT(*) as cantidad
FROM Usuarios 
WHERE role IN ('doctor', 'medico');

-- ==========================================
-- PASO 5: RESUMEN FINAL
-- ==========================================

PRINT '=================================================================';
IF @citasRestantes = 0 AND @bloquesVinculados = 0 AND @notificacionesCita = 0
BEGIN
    PRINT '✅ RESET COMPLETO EXITOSO';
    PRINT '   ✓ Todas las citas han sido eliminadas';
    PRINT '   ✓ Todos los bloques han sido desvinculados';
    PRINT '   ✓ Todas las notificaciones de citas han sido eliminadas';
    PRINT '   ✓ El contador de identidad ha sido reiniciado';
    PRINT '   ✓ El sistema está listo para comenzar desde cero';
END
ELSE
BEGIN
    PRINT '⚠️ ADVERTENCIAS EN EL RESET:';
    IF @citasRestantes > 0
        PRINT '   ⚠️ Quedan ' + CAST(@citasRestantes AS VARCHAR(10)) + ' citas en el sistema';
    IF @bloquesVinculados > 0
        PRINT '   ⚠️ Quedan ' + CAST(@bloquesVinculados AS VARCHAR(10)) + ' bloques vinculados';
    IF @notificacionesCita > 0
        PRINT '   ⚠️ Quedan ' + CAST(@notificacionesCita AS VARCHAR(10)) + ' notificaciones de citas';
END

PRINT '=================================================================';
PRINT 'Fecha y hora de ejecución: ' + CONVERT(VARCHAR(19), GETDATE(), 120);
PRINT 'Reset completado por: ' + SYSTEM_USER;
PRINT '=================================================================';

-- Limpiar tabla temporal
IF OBJECT_ID('tempdb..#RespaldoCitas') IS NOT NULL
    DROP TABLE #RespaldoCitas; 