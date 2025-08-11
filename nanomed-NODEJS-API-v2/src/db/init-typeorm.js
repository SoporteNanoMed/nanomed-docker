const AppDataSource = require("./typeorm-config");

async function initializeTypeORM() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ TypeORM inicializado correctamente");
      
      // Verificar conexión
      const isConnected = AppDataSource.isInitialized;
      if (isConnected) {
        console.log("✅ Conexión a la base de datos establecida");
      } else {
        throw new Error("No se pudo establecer conexión a la base de datos");
      }
    }
    return AppDataSource;
  } catch (error) {
    console.error("❌ Error al inicializar TypeORM:", error);
    throw error;
  }
}

async function closeTypeORM() {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("✅ Conexión TypeORM cerrada correctamente");
    }
  } catch (error) {
    console.error("❌ Error al cerrar TypeORM:", error);
  }
}

module.exports = {
  initializeTypeORM,
  closeTypeORM,
  AppDataSource,
};
