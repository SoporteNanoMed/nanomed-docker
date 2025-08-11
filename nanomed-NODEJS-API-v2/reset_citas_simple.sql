-- ==========================================
-- SCRIPT SIMPLE PARA ELIMINAR TODAS LAS CITAS
-- ==========================================
-- Descripción: Elimina SOLO las citas médicas, manteniendo otros datos del sistema
-- Uso: Para limpiar citas pero mantener usuarios, médicos, horarios, etc.
-- ADVERTENCIA: Esta operación es IRREVERSIBLE

PRINT '=== SCRIPT SIMPLE DE ELIMINACIÓN DE CITAS ===';
PRINT 'Este script elimina SOLO las citas, manteniendo:';
PRINT '- Usuarios y médicos';
PRINT '- Horarios médicos';
PRINT '- Bloques de disponibilidad (desvinculados)';
PRINT '- Exámenes médicos';
PRINT '';

-- Mostrar estadísticas actuales
PRINT '=== ESTADÍSTICAS ANTES DE LA ELIMINACIÓN ===';
SELECT 
    'Total de citas' as descripcion,
    COUNT(*) as cantidad
FROM CitasMedicas;

SELECT 
    estado,
    COUNT(*) as cantidad
FROM CitasMedicas
GROUP BY estado
ORDER BY cantidad DESC;

-- Iniciar eliminación
PRINT '=== INICIANDO ELIMINACIÓN SIMPLE ===';

BEGIN TRANSACTION;

BEGIN TRY
    
    -- 1. Desvincular bloques de disponibilidad
    PRINT '--- Desvinculando bloques de disponibilidad ---';
    UPDATE BloquesDisponibilidad
    SET cita_id = NULL
    WHERE cita_id IS NOT NULL;
    
    PRINT 'Bloques desvinculados: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    -- 2. Eliminar notificaciones de citas
    PRINT '--- Eliminando notificaciones de citas ---';
    DELETE FROM Notificaciones
    WHERE referencia_tipo = 'cita';
    
    PRINT 'Notificaciones eliminadas: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

    -- 3. Eliminar todas las citas
    PRINT '--- Eliminando todas las citas ---';
    DELETE FROM CitasMedicas;
    
    DECLARE @citasEliminadas INT = @@ROWCOUNT;
    PRINT 'Citas eliminadas: ' + CAST(@citasEliminadas AS VARCHAR(10));

    -- 4. Reiniciar contador de identidad
    DBCC CHECKIDENT ('CitasMedicas', RESEED, 0);
    
    COMMIT TRANSACTION;
    
    PRINT '✅ ELIMINACIÓN SIMPLE COMPLETADA';

END TRY
BEGIN CATCH
    
    ROLLBACK TRANSACTION;
    
    PRINT '❌ ERROR: ' + ERROR_MESSAGE();
    PRINT 'Operación cancelada - todos los cambios revertidos';
    
    THROW;
    
END CATCH;

-- Verificación final
PRINT '=== VERIFICACIÓN FINAL ===';
SELECT 
    'Citas restantes' as descripcion,
    COUNT(*) as cantidad
FROM CitasMedicas;

PRINT 'Reset simple completado el: ' + CONVERT(VARCHAR(19), GETDATE(), 120); 