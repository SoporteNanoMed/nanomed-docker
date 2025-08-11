-- ==========================================
-- SCRIPT DE VERIFICACIÓN RÁPIDA DEL ESTADO DE CITAS
-- ==========================================
-- Descripción: Muestra estadísticas completas del sistema de citas
-- Uso: Ejecutar ANTES de cualquier operación de eliminación

PRINT '=== VERIFICACIÓN DEL ESTADO ACTUAL DEL SISTEMA ===';
PRINT 'Fecha y hora: ' + CONVERT(VARCHAR(19), GETDATE(), 120);
PRINT '';

-- ==========================================
-- ESTADÍSTICAS GENERALES
-- ==========================================

PRINT '=== ESTADÍSTICAS GENERALES ===';

SELECT 
    'Total de citas en el sistema' as descripcion,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Sistema limpio'
        WHEN COUNT(*) < 10 THEN '⚠️ Pocas citas'
        WHEN COUNT(*) < 100 THEN '📊 Cantidad normal'
        ELSE '📈 Muchas citas'
    END as estado
FROM CitasMedicas
UNION ALL
SELECT 
    'Total de usuarios',
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ Usuarios activos' ELSE '❌ Sin usuarios' END
FROM Usuarios
UNION ALL
SELECT 
    'Total de médicos',
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ Médicos disponibles' ELSE '❌ Sin médicos' END
FROM Usuarios WHERE role IN ('doctor', 'medico')
UNION ALL
SELECT 
    'Bloques de disponibilidad',
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN '✅ Bloques configurados' ELSE '⚠️ Sin bloques' END
FROM BloquesDisponibilidad;

-- ==========================================
-- DISTRIBUCIÓN DE CITAS POR ESTADO
-- ==========================================

PRINT '';
PRINT '=== DISTRIBUCIÓN DE CITAS POR ESTADO ===';

IF EXISTS (SELECT 1 FROM CitasMedicas)
BEGIN
    SELECT 
        ISNULL(estado, 'NULL') as estado,
        COUNT(*) as cantidad,
        CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM CitasMedicas) AS DECIMAL(5,2)) as porcentaje,
        CASE 
            WHEN estado = 'programada' THEN '📅 Programadas'
            WHEN estado = 'confirmada' THEN '✅ Confirmadas'
            WHEN estado = 'completada' THEN '✔️ Completadas'
            WHEN estado = 'cancelada' THEN '❌ Canceladas'
            ELSE '❓ Estado desconocido'
        END as descripcion_estado
    FROM CitasMedicas
    GROUP BY estado
    ORDER BY cantidad DESC;
END
ELSE
BEGIN
    PRINT '✅ No hay citas en el sistema';
END

-- ==========================================
-- CITAS POR FECHA
-- ==========================================

PRINT '';
PRINT '=== DISTRIBUCIÓN DE CITAS POR FECHA ===';

IF EXISTS (SELECT 1 FROM CitasMedicas)
BEGIN
    SELECT 
        CAST(fecha_hora AS DATE) as fecha,
        COUNT(*) as citas_del_dia,
        MIN(fecha_hora) as primera_cita,
        MAX(fecha_hora) as ultima_cita
    FROM CitasMedicas
    GROUP BY CAST(fecha_hora AS DATE)
    ORDER BY fecha DESC;
END
ELSE
BEGIN
    PRINT '✅ No hay citas programadas';
END

-- ==========================================
-- RELACIONES Y DEPENDENCIAS
-- ==========================================

PRINT '';
PRINT '=== RELACIONES Y DEPENDENCIAS ===';

SELECT 
    'Bloques vinculados a citas' as descripcion,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Ningún bloque vinculado'
        ELSE '⚠️ Bloques que se desvincularán'
    END as impacto
FROM BloquesDisponibilidad 
WHERE cita_id IS NOT NULL
UNION ALL
SELECT 
    'Notificaciones de citas',
    COUNT(*),
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Sin notificaciones pendientes'
        ELSE '⚠️ Notificaciones que se eliminarán'
    END
FROM Notificaciones 
WHERE referencia_tipo = 'cita'
UNION ALL
SELECT 
    'Exámenes médicos totales',
    COUNT(*),
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Sin exámenes'
        ELSE 'ℹ️ Se mantendrán (no relacionados directamente)'
    END
FROM ExamenesMedicos;

-- ==========================================
-- ÚLTIMAS ACTIVIDADES
-- ==========================================

PRINT '';
PRINT '=== ÚLTIMAS ACTIVIDADES ===';

IF EXISTS (SELECT 1 FROM CitasMedicas)
BEGIN
    PRINT '--- Últimas 5 citas creadas ---';
    SELECT TOP 5
        id,
        usuario_id,
        medico_id,
        fecha_hora,
        estado,
        DATEDIFF(day, creado_en, GETDATE()) as dias_desde_creacion
    FROM CitasMedicas
    ORDER BY creado_en DESC;

    PRINT '';
    PRINT '--- Próximas 5 citas programadas ---';
    SELECT TOP 5
        id,
        usuario_id,
        medico_id,
        fecha_hora,
        estado,
        DATEDIFF(day, GETDATE(), fecha_hora) as dias_hasta_cita
    FROM CitasMedicas
    WHERE fecha_hora >= GETDATE()
    ORDER BY fecha_hora ASC;
END
ELSE
BEGIN
    PRINT '✅ No hay actividad de citas para mostrar';
END

-- ==========================================
-- RECOMENDACIONES
-- ==========================================

PRINT '';
PRINT '=== RECOMENDACIONES ===';

DECLARE @totalCitas INT = (SELECT COUNT(*) FROM CitasMedicas);
DECLARE @citasFuturas INT = (SELECT COUNT(*) FROM CitasMedicas WHERE fecha_hora >= GETDATE());

IF @totalCitas = 0
BEGIN
    PRINT '✅ El sistema ya está limpio - no necesita reset';
END
ELSE
BEGIN
    PRINT '📊 IMPACTO DE LA ELIMINACIÓN:';
    PRINT '   • Se eliminarán ' + CAST(@totalCitas AS VARCHAR(10)) + ' citas en total';
    IF @citasFuturas > 0
        PRINT '   • ⚠️ Se perderán ' + CAST(@citasFuturas AS VARCHAR(10)) + ' citas futuras';
    
    PRINT '';
    PRINT '🔧 SCRIPTS DISPONIBLES:';
    PRINT '   • reset_citas_simple.sql - Elimina solo citas (recomendado)';
    PRINT '   • reset_todas_las_citas.sql - Reset completo (más agresivo)';
    
    PRINT '';
    PRINT '⚠️ IMPORTANTE:';
    PRINT '   • Hacer respaldo antes de ejecutar cualquier script';
    PRINT '   • Verificar que no hay citas importantes programadas';
    PRINT '   • Considerar notificar a usuarios sobre la limpieza';
END

PRINT '';
PRINT '=== FIN DE VERIFICACIÓN ===';
PRINT 'Sistema verificado el: ' + CONVERT(VARCHAR(19), GETDATE(), 120); 