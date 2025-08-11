const { initializeTypeORM } = require("../db/init-typeorm");

async function createTables() {
  try {
    const AppDataSource = await initializeTypeORM();
    
    // Crear tabla Users
    await AppDataSource.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) DEFAULT 'user',
        isActive BIT DEFAULT 1,
        emailVerified BIT DEFAULT 0,
        verificationToken NVARCHAR(255) NULL,
        resetPasswordToken NVARCHAR(255) NULL,
        resetPasswordExpires DATETIME NULL,
        lastLogin DATETIME NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
      )
    `);

    // Crear tabla Doctores
    await AppDataSource.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Doctores' AND xtype='U')
      CREATE TABLE Doctores (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        specialty NVARCHAR(255) NOT NULL,
        license NVARCHAR(255) NOT NULL,
        experience INT NULL,
        bio TEXT NULL,
        isAvailable BIT DEFAULT 1,
        rating DECIMAL(3,2) DEFAULT 0,
        totalAppointments INT DEFAULT 0,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
      )
    `);

    // Crear tabla CitasMedicas
    await AppDataSource.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CitasMedicas' AND xtype='U')
      CREATE TABLE CitasMedicas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        doctorId INT NOT NULL,
        date DATETIME NOT NULL,
        status NVARCHAR(50) DEFAULT 'pendiente',
        type NVARCHAR(50) DEFAULT 'consulta',
        notes TEXT NULL,
        symptoms TEXT NULL,
        diagnosis TEXT NULL,
        prescription TEXT NULL,
        paymentStatus NVARCHAR(50) DEFAULT 'pendiente',
        amount DECIMAL(10,2) NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (doctorId) REFERENCES Doctores(id)
      )
    `);

    console.log("✅ Tablas creadas exitosamente");
  } catch (error) {
    console.error("❌ Error al crear tablas:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTables()
    .then(() => {
      console.log("✅ Migración completada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error en migración:", error);
      process.exit(1);
    });
}

module.exports = createTables;
