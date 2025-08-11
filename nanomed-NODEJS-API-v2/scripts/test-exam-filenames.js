const azureBlobService = require("../src/utils/azureBlobService");

function testExamFilenames() {
  console.log("Probando generación de nombres de archivo para exámenes...");
  
  const userId = 99;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_EXAMS || 'exams';
  
  // Casos de prueba
  const testCases = [
    {
      tipoExamen: "Electrocardiograma",
      fecha: "2024-01-15",
      originalName: "ecg-resultado.pdf"
    },
    {
      tipoExamen: "Radiografía de Tórax",
      fecha: "2024-01-20",
      originalName: "radiografia-torax.jpg"
    },
    {
      tipoExamen: "Análisis de Sangre",
      fecha: "2024-02-01",
      originalName: "hemograma.pdf"
    },
    {
      tipoExamen: "Resonancia Magnética",
      fecha: "2024-02-10",
      originalName: "rm-cerebro.dcm"
    },
    {
      tipoExamen: "Holter 24h",
      fecha: "2024-03-05",
      originalName: "holter-resultados.pdf"
    }
  ];
  
  console.log(`Usuario: ${userId}`);
  console.log(`Contenedor: ${containerName}`);
  console.log("\nResultados:");
  
  testCases.forEach((testCase, index) => {
    const blobName = azureBlobService.generateBlobName(
      userId,
      'exam',
      testCase.originalName,
      containerName,
      {
        tipoExamen: testCase.tipoExamen,
        fecha: testCase.fecha
      }
    );
    
    console.log(`\n${index + 1}. ${testCase.tipoExamen} (${testCase.fecha})`);
    console.log(`   Archivo original: ${testCase.originalName}`);
    console.log(`   Nombre generado: ${blobName}`);
    
    // Verificar que el nombre contiene el tipo de examen y la fecha
    const tipoExamenLimpio = testCase.tipoExamen
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const fechaFormateada = testCase.fecha.replace(/-/g, '');
    
    if (blobName.includes(tipoExamenLimpio) && blobName.includes(fechaFormateada)) {
      console.log(`   Nombre válido`);
    } else {
      console.log(`   Nombre inválido`);
    }
  });
  
  // Probar sin opciones (fallback)
  console.log("\n Probando fallback (sin tipo y fecha):");
  const fallbackName = azureBlobService.generateBlobName(
    userId,
    'exam',
    'archivo-generico.pdf',
    containerName
  );
  console.log(`   Nombre fallback: ${fallbackName}`);
  
  console.log("\n Prueba completada!");
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testExamFilenames();
}

module.exports = { testExamFilenames }; 