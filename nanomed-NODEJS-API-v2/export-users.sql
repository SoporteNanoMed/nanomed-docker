-- Script para exportar usuarios de la base de datos de desarrollo
-- Ejecutar en la base de datos bddnanomed_DEV

-- Exportar todos los usuarios con sus datos completos
SELECT 
    'INSERT INTO Usuarios (' +
    'nombre, apellido, email, password_hash, telefono, rut, ' +
    'fecha_nacimiento, genero, direccion, ciudad, region, ' +
    'foto_perfil, creado_en, actualizado_en, email_verified, ' +
    'verification_token, reset_token, reset_token_expires, ' +
    'role, login_attempts, last_failed_login, mfa_enabled, ' +
    'mfa_secret, mfa_token, mfa_token_expires, mfa_code_hash, ' +
    'verification_token_expires, especialidad) VALUES (' +
    '''' + ISNULL(nombre, '') + ''', ' +
    '''' + ISNULL(apellido, '') + ''', ' +
    '''' + ISNULL(email, '') + ''', ' +
    '''' + ISNULL(password_hash, '') + ''', ' +
    '''' + ISNULL(telefono, '') + ''', ' +
    '''' + ISNULL(rut, '') + ''', ' +
    CASE WHEN fecha_nacimiento IS NULL THEN 'NULL' ELSE '''' + CONVERT(VARCHAR, fecha_nacimiento, 23) + '''' END + ', ' +
    '''' + ISNULL(genero, '') + ''', ' +
    '''' + ISNULL(direccion, '') + ''', ' +
    '''' + ISNULL(ciudad, '') + ''', ' +
    '''' + ISNULL(region, '') + ''', ' +
    CASE WHEN foto_perfil IS NULL THEN 'NULL' ELSE '''' + ISNULL(foto_perfil, '') + '''' END + ', ' +
    CASE WHEN creado_en IS NULL THEN 'GETDATE()' ELSE '''' + CONVERT(VARCHAR, creado_en, 121) + '''' END + ', ' +
    CASE WHEN actualizado_en IS NULL THEN 'GETDATE()' ELSE '''' + CONVERT(VARCHAR, actualizado_en, 121) + '''' END + ', ' +
    CASE WHEN email_verified IS NULL THEN '0' ELSE CAST(email_verified AS VARCHAR) END + ', ' +
    CASE WHEN verification_token IS NULL THEN 'NULL' ELSE '''' + ISNULL(verification_token, '') + '''' END + ', ' +
    CASE WHEN reset_token IS NULL THEN 'NULL' ELSE '''' + ISNULL(reset_token, '') + '''' END + ', ' +
    CASE WHEN reset_token_expires IS NULL THEN 'NULL' ELSE '''' + CONVERT(VARCHAR, reset_token_expires, 121) + '''' END + ', ' +
    '''' + ISNULL(role, 'user') + ''', ' +
    CASE WHEN login_attempts IS NULL THEN '0' ELSE CAST(login_attempts AS VARCHAR) END + ', ' +
    CASE WHEN last_failed_login IS NULL THEN 'NULL' ELSE '''' + CONVERT(VARCHAR, last_failed_login, 121) + '''' END + ', ' +
    CASE WHEN mfa_enabled IS NULL THEN '0' ELSE CAST(mfa_enabled AS VARCHAR) END + ', ' +
    CASE WHEN mfa_secret IS NULL THEN 'NULL' ELSE '''' + ISNULL(mfa_secret, '') + '''' END + ', ' +
    CASE WHEN mfa_token IS NULL THEN 'NULL' ELSE '''' + ISNULL(mfa_token, '') + '''' END + ', ' +
    CASE WHEN mfa_token_expires IS NULL THEN 'NULL' ELSE '''' + CONVERT(VARCHAR, mfa_token_expires, 121) + '''' END + ', ' +
    CASE WHEN mfa_code_hash IS NULL THEN 'NULL' ELSE '''' + ISNULL(mfa_code_hash, '') + '''' END + ', ' +
    CASE WHEN verification_token_expires IS NULL THEN 'NULL' ELSE '''' + CONVERT(VARCHAR, verification_token_expires, 121) + '''' END + ', ' +
    CASE WHEN especialidad IS NULL THEN 'NULL' ELSE '''' + ISNULL(especialidad, '') + '''' END + ');'
FROM Usuarios
ORDER BY id;
