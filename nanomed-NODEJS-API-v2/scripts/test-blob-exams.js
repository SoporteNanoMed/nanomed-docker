const blobExamsManager = require("../src/utils/blobExamsManager");

async function testBlobExamsManagement() {
  console.log("Probando gestión de exámenes del blob storage...");
  
  try {
    // Test 1: Obtener estadísticas
    console.log("\n Test 1: Obtener estadísticas del blob storage");
    const stats = await blobExamsManager.getBlobExamsStats();
    console.log("Estadísticas obtenidas:", {
      totalFiles: stats.totalFiles,
      totalSize: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
      usersWithFiles: stats.usersWithFiles,
      fileTypes: stats.fileTypes,
      recentFiles: stats.recentFiles
    });

    // Test 2: Obtener todos los exámenes
    console.log("\n Test 2: Obtener todos los exámenes del blob storage");
    const allExams = await blobExamsManager.getAllExamsFromBlob();
    console.log(`Exámenes obtenidos: ${allExams.length}`);
    
    if (allExams.length > 0) {
      console.log("Primer examen:", {
        id: allExams[0].id,
        tipo_examen: allExams[0].tipo_examen,
        paciente_id: allExams[0].paciente_id,
        fecha: allExams[0].fecha,
        archivo_nombre_original: allExams[0].archivo_nombre_original,
        es_blob_storage: allExams[0].es_blob_storage
      });
    }

    // Test 3: Obtener exámenes por usuario (si hay usuarios con archivos)
    if (stats.usersWithFiles > 0) {
      console.log("\n Test 3: Obtener exámenes por usuario");
      const userIds = Array.from(stats.usersWithFiles || []);
      const firstUserId = userIds[0];
      
      const userExams = await blobExamsManager.getExamsByUser(firstUserId);
      console.log(` Exámenes del usuario ${firstUserId}: ${userExams.length}`);
      
      if (userExams.length > 0) {
        console.log(" Primer examen del usuario:", {
          id: userExams[0].id,
          tipo_examen: userExams[0].tipo_examen,
          fecha: userExams[0].fecha
        });
      }
    }

    // Test 4: Probar filtros
    console.log("\n Test 4: Probar filtros");
    const filteredExams = await blobExamsManager.getAllExamsFromBlob({
      tipo_examen: "PDF"
    });
    console.log(`Exámenes filtrados por tipo "PDF": ${filteredExams.length}`);

    // Test 5: Probar limpieza (solo simulación)
    console.log("\n Test 5: Probar limpieza (simulación)");
    const cleanupResults = await blobExamsManager.cleanupBlobStorage({
      deleteTempFiles: true,
      deleteDuplicates: false,
      olderThanDays: 90,
      dryRun: true // Solo simular
    });
    console.log("Resultados de limpieza (simulación):", cleanupResults);

    console.log("\n Todos los tests completados exitosamente!");
    
  } catch (error) {
    console.error("Error en los tests:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Función para probar la gestión de un examen específico
async function testSpecificExamManagement() {
  console.log("\n Probando gestión de examen específico...");
  
  try {
    // Obtener un examen para probar
    const allExams = await blobExamsManager.getAllExamsFromBlob();
    
    if (allExams.length === 0) {
      console.log("  No hay exámenes para probar");
      return;
    }
    
    const testExam = allExams[0];
    console.log(` Probando con examen: ${testExam.id}`);
    
    // Test 1: Verificar que el archivo existe
    console.log("\n Test 1: Verificar existencia del archivo");
    const exists = await blobExamsManager.fileExists(testExam.archivo_path);
    console.log(` Archivo existe: ${exists}`);
    
    // Test 2: Obtener propiedades del archivo
    if (exists) {
      console.log("\n Test 2: Obtener propiedades del archivo");
      const properties = await blobExamsManager.getFileProperties(testExam.archivo_path);
      console.log("Propiedades del archivo:", {
        size: `${(properties.size / 1024 / 1024).toFixed(2)} MB`,
        contentType: properties.contentType,
        lastModified: properties.lastModified
      });
    }
    
    // Test 3: Generar URL de descarga
    console.log("\n Test 3: Generar URL de descarga");
    const downloadUrl = await blobExamsManager.getDownloadUrl(testExam.archivo_path, 60);
    console.log(` URL de descarga generada: ${downloadUrl.substring(0, 100)}...`);
    
    console.log("\n Tests de gestión específica completados!");
    
  } catch (error) {
    console.error(" Error en tests de gestión específica:", error.message);
  }
}

// Función principal
async function main() {
  console.log(" Iniciando tests de gestión de exámenes del blob storage...");
  
  await testBlobExamsManagement();
  await testSpecificExamManagement();
  
  console.log("\n✨ Tests completados!");
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testBlobExamsManagement,
  testSpecificExamManagement
}; 