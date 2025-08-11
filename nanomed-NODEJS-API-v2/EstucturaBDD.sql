-- ==========================================
-- ESTRUCTURA COMPLETA DE LA BASE DE DATOS NANOMED
-- Basada en la estructura de Azure
-- ==========================================

-- Tabla: Usuarios
CREATE TABLE Usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(MAX) NOT NULL,
    telefono VARCHAR(20),
    rut VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    region VARCHAR(100),
    foto_perfil VARCHAR(255),
    creado_en DATETIME DEFAULT GETDATE(),
    actualizado_en DATETIME DEFAULT GETDATE(),
    email_verified BIT DEFAULT 0,
    verification_token NVARCHAR(255),
    reset_token NVARCHAR(255),
    reset_token_expires DATETIME,
    role NVARCHAR(50) DEFAULT 'user',
    login_attempts INT DEFAULT 0,
    last_failed_login DATETIME,
    mfa_enabled BIT DEFAULT 0,
    mfa_secret NVARCHAR(255),
    mfa_token NVARCHAR(255),
    mfa_token_expires DATETIME,
    mfa_code_hash NVARCHAR(255),
    verification_token_expires DATETIME,
    especialidad VARCHAR(100)
);

-- Tabla: CitasMedicas
CREATE TABLE CitasMedicas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    medico_id INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    duracion INT DEFAULT 30,
    lugar VARCHAR(255),
    direccion VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'pendiente',
    notas TEXT,
    creado_en DATETIME DEFAULT GETDATE(),
    actualizado_en DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    FOREIGN KEY (medico_id) REFERENCES Usuarios(id)
);

-- Tabla: ContactosEmergencia
CREATE TABLE ContactosEmergencia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    relacion VARCHAR(100),
    telefono VARCHAR(20) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- Tabla: ExamenesMedicos
CREATE TABLE ExamenesMedicos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    tipo_examen VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    resultados TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    archivo_path VARCHAR(255),
    archivo_nombre_original VARCHAR(255),
    creado_en DATETIME DEFAULT GETDATE(),
    actualizado_en DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (paciente_id) REFERENCES Usuarios(id),
    FOREIGN KEY (medico_id) REFERENCES Usuarios(id)
);

-- Tabla: InformacionMedica
CREATE TABLE InformacionMedica (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    grupo_sanguineo VARCHAR(10),
    alergias TEXT,
    medicamentos TEXT,
    condiciones_medicas TEXT,
    actualizado_en DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- Tabla: Notificaciones
CREATE TABLE Notificaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT,
    referencia_tipo VARCHAR(50),
    referencia_id INT,
    leida BIT DEFAULT 0,
    creado_en DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- Tabla: PreferenciasNotificacion
CREATE TABLE PreferenciasNotificacion (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    email_citas BIT DEFAULT 1,
    email_resultados BIT DEFAULT 1,
    email_promociones BIT DEFAULT 1,
    sms_citas BIT DEFAULT 1,
    sms_resultados BIT DEFAULT 1,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- Tabla: RefreshTokens
CREATE TABLE RefreshTokens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    token NVARCHAR(500) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_revoked BIT DEFAULT 0,
    device_info NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    revoked_at DATETIME,
    token_id NVARCHAR(36),
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Usuarios(id)
);

-- Tabla: RequestLogs
CREATE TABLE RequestLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45),
    email NVARCHAR(255),
    route NVARCHAR(255),
    method NVARCHAR(10),
    user_agent NVARCHAR(MAX),
    timestamp DATETIME DEFAULT GETDATE()
);

-- Tabla: HorariosMedicos
CREATE TABLE HorariosMedicos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    medico_id INT NOT NULL,
    dia_semana INT NOT NULL, -- 1=Lunes, 2=Martes, etc.
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_cita INT DEFAULT 30,
    activo BIT DEFAULT 1,
    fecha_desde DATE,
    fecha_hasta DATE,
    creado_en DATETIME DEFAULT GETDATE(),
    actualizado_en DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (medico_id) REFERENCES Usuarios(id)
);

-- Tabla: ExcepcionesHorarios
CREATE TABLE ExcepcionesHorarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    medico_id INT NOT NULL,
    fecha DATE NOT NULL,
    motivo VARCHAR(255),
    todo_el_dia BIT DEFAULT 1,
    hora_inicio TIME,
    hora_fin TIME,
    creado_en DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (medico_id) REFERENCES Usuarios(id)
);

-- Tabla: BloquesDisponibilidad
CREATE TABLE BloquesDisponibilidad (
    id INT IDENTITY(1,1) PRIMARY KEY,
    medico_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    creado_en DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (medico_id) REFERENCES Usuarios(id)
);

-- Tabla: TransaccionesPago
CREATE TABLE TransaccionesPago (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cita_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    token_transbank VARCHAR(255),
    fecha_transaccion DATETIME DEFAULT GETDATE(),
    respuesta_transbank TEXT,
    FOREIGN KEY (cita_id) REFERENCES CitasMedicas(id)
);

-- ==========================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ==========================================

-- Índices para Usuarios
CREATE INDEX IX_Usuarios_Email ON Usuarios(email);
CREATE INDEX IX_Usuarios_Role ON Usuarios(role);
CREATE INDEX IX_Usuarios_Rut ON Usuarios(rut);

-- Índices para CitasMedicas
CREATE INDEX IX_CitasMedicas_UsuarioId ON CitasMedicas(usuario_id);
CREATE INDEX IX_CitasMedicas_MedicoId ON CitasMedicas(medico_id);
CREATE INDEX IX_CitasMedicas_FechaHora ON CitasMedicas(fecha_hora);
CREATE INDEX IX_CitasMedicas_Estado ON CitasMedicas(estado);

-- Índices para ExamenesMedicos
CREATE INDEX IX_ExamenesMedicos_PacienteId ON ExamenesMedicos(paciente_id);
CREATE INDEX IX_ExamenesMedicos_MedicoId ON ExamenesMedicos(medico_id);
CREATE INDEX IX_ExamenesMedicos_Fecha ON ExamenesMedicos(fecha);

-- Índices para Notificaciones
CREATE INDEX IX_Notificaciones_UsuarioId ON Notificaciones(usuario_id);
CREATE INDEX IX_Notificaciones_Leida ON Notificaciones(leida);

-- Índices para RefreshTokens
CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(user_id);
CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(token);

-- Índices para HorariosMedicos
CREATE INDEX IX_HorariosMedicos_MedicoId ON HorariosMedicos(medico_id);
CREATE INDEX IX_HorariosMedicos_DiaSemana ON HorariosMedicos(dia_semana);

-- ==========================================
-- DATOS INICIALES
-- ==========================================

-- Insertar usuario API
INSERT INTO Usuarios (
    nombre,
    apellido,
    email,
    password_hash,
    telefono,
    rut,
    fecha_nacimiento,
    genero,
    direccion,
    ciudad,
    region,
    foto_perfil,
    creado_en,
    actualizado_en,
    email_verified,
    role,
    login_attempts,
    mfa_enabled
) VALUES (
    'API',
    'BlueAid',
    'api@blueaid.ai',
    '$2b$12$K3vHAr4LJvhVlTPWyWj9OOPJlGHz/XW5i3/wKtKyb6XLEEEraJcSO',
    '+56988289770',
    '78.123.012-K',
    '2025-03-10',
    'No especificado',
    'Dirección API',
    'Salamanca',
    'Coquimbo',
    NULL,
    GETDATE(),
    GETDATE(),
    1,
    'api',
    0,
    0
);

-- Insertar usuario de prueba
INSERT INTO Usuarios (
    nombre,
    apellido,
    email,
    password_hash,
    telefono,
    rut,
    fecha_nacimiento,
    genero,
    direccion,
    ciudad,
    region,
    creado_en,
    actualizado_en,
    email_verified,
    role,
    login_attempts,
    mfa_enabled
) VALUES (
    'Usuario',
    'Test',
    'test@test.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', -- test123
    '+56912345678',
    '12.345.678-9',
    '1990-01-01',
    'No especificado',
    'Dirección Test',
    'Santiago',
    'Metropolitana',
    GETDATE(),
    GETDATE(),
    1,
    'user',
    0,
    0
);

-- Insertar médico de prueba
INSERT INTO Usuarios (
    nombre,
    apellido,
    email,
    password_hash,
    telefono,
    rut,
    fecha_nacimiento,
    genero,
    direccion,
    ciudad,
    region,
    especialidad,
    creado_en,
    actualizado_en,
    email_verified,
    role,
    login_attempts,
    mfa_enabled
) VALUES (
    'Dr. Juan',
    'Pérez',
    'dr.perez@nanomed.cl',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', -- test123
    '+56987654321',
    '98.765.432-1',
    '1980-05-15',
    'Masculino',
    'Av. Providencia 123',
    'Santiago',
    'Metropolitana',
    'Medicina General',
    GETDATE(),
    GETDATE(),
    1,
    'medico',
    0,
    0
);

PRINT '✅ Estructura de base de datos creada exitosamente';
PRINT '✅ Datos iniciales insertados';
PRINT '✅ Índices creados para optimización';
