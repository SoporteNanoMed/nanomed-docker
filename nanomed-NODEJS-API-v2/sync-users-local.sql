-- Script para sincronizar usuarios en la base de datos local
-- Primero limpiar la tabla Usuarios existente

-- Eliminar registros existentes (mantener la estructura)
DELETE FROM Usuarios;

-- Resetear el contador de identidad
DBCC CHECKIDENT ('Usuarios', RESEED, 0);

-- Aquí se insertarán los usuarios exportados de bddnanomed_DEV
-- Los INSERT statements se generarán desde el script export-users.sql

PRINT 'Tabla Usuarios limpiada y lista para sincronización';
