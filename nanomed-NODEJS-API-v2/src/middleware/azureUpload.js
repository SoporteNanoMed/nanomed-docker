const multer = require("multer");
const azureBlobService = require("../utils/azureBlobService");
const path = require("path");

// Configurar multer para almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro para fotos de perfil (solo imágenes)
const profileFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (JPEG, PNG, GIF)"), false);
  }
};

// Filtro para exámenes (más tipos de archivos)
const examFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg", 
    "image/png", 
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/vnd.rar",
    "application/dicom",
    "application/x-dicom"
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos PDF, imágenes, documentos Word, Excel, archivos de texto, ZIP, RAR y DICOM"), false);
  }
};

const azureUpload = multer({
  storage: storage,
  fileFilter: profileFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Multer específico para exámenes con límite mayor
const examMulter = multer({
  storage: storage,
  fileFilter: examFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

// Middleware personalizado para subir a Azure después de multer
const uploadToAzure = (containerName) => {
  return async (req, res, next) => {
    try {
      // Verificar configuración de Azure
      if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
        console.error('❌ AZURE_STORAGE_CONNECTION_STRING no está configurada');
        return res.status(500).json({
          success: false,
          message: "Error de configuración: Azure Blob Storage no está configurado"
        });
      }

      console.log(' Debugging request...');
      console.log(' Headers:', JSON.stringify(req.headers, null, 2));
      console.log(' Body keys:', Object.keys(req.body || {}));
      console.log(' Files:', req.files ? Object.keys(req.files) : 'No files');
      console.log(' File:', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file');

      if (!req.file) {
        console.error('❌ No se recibió archivo en req.file');
        console.error('📋 Contenido de req:', {
          hasBody: !!req.body,
          bodyKeys: Object.keys(req.body || {}),
          hasFiles: !!req.files,
          filesKeys: req.files ? Object.keys(req.files) : [],
          contentType: req.headers['content-type']
        });
        
        return res.status(400).json({
          success: false,
          message: "No se subió ningún archivo. Asegúrate de que el campo se llame 'profilePhoto' y que el archivo sea una imagen válida.",
          debug: {
            contentType: req.headers['content-type'],
            bodyKeys: Object.keys(req.body || {}),
            filesKeys: req.files ? Object.keys(req.files) : []
          }
        });
      }

      console.log(' Iniciando subida a Azure Blob Storage...');
      console.log(` Archivo: ${req.file.originalname}`);
      console.log(` Tamaño: ${req.file.size} bytes`);
      console.log(` Tipo: ${req.file.mimetype}`);
      console.log(` Campo: ${req.file.fieldname}`);

      const userId = req.user ? req.user.id : 'unknown';
      const blobName = azureBlobService.generateBlobName(
        userId, 
        'upload', 
        req.file.originalname, 
        containerName
      );

      console.log(` Nombre del blob: ${blobName}`);
      console.log(` Contenedor: ${containerName}`);

      // Subir archivo a Azure Blob Storage
      const uploadResult = await azureBlobService.uploadFile(
        req.file.buffer,
        blobName,
        containerName,
        req.file.mimetype
      );

      console.log(' Archivo subido exitosamente a Azure');
      console.log(` URL: ${uploadResult.url}`);

      // Agregar información del blob al request
      req.azureBlob = {
        blobName: blobName,
        containerName: containerName,
        url: uploadResult.url,
        etag: uploadResult.etag,
        lastModified: uploadResult.lastModified
      };

      next();
    } catch (error) {
      console.error('❌ Error al subir archivo a Azure:', error);
      
      // Error más específico según el tipo
      let errorMessage = "Error al subir archivo";
      let statusCode = 500;

      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        errorMessage = "Error de conexión con Azure Blob Storage";
        statusCode = 503;
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = "Error de permisos en Azure Blob Storage";
        statusCode = 403;
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorMessage = "Contenedor de Azure Blob Storage no encontrado";
        statusCode = 404;
      } else if (error.message.includes('413') || error.message.includes('Request Entity Too Large')) {
        errorMessage = "El archivo es demasiado grande (máximo 10MB para exámenes)";
        statusCode = 413;
      }

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// Middleware específico para exámenes que usa el paciente_id
const uploadExamToAzure = (containerName) => {
  return async (req, res, next) => {
    try {
      // Verificar configuración de Azure
      if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
        console.error(' AZURE_STORAGE_CONNECTION_STRING no está configurada');
        return res.status(500).json({
          success: false,
          message: "Error de configuración: Azure Blob Storage no está configurado"
        });
      }

      console.log(' Debugging exam upload request...');
      console.log(' Headers:', JSON.stringify(req.headers, null, 2));
      console.log(' Body keys:', Object.keys(req.body || {}));
      console.log(' Files:', req.files ? Object.keys(req.files) : 'No files');
      console.log(' File:', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file');

      if (!req.file) {
        console.error(' No se recibió archivo en req.file');
        console.error(' Contenido de req:', {
          hasBody: !!req.body,
          bodyKeys: Object.keys(req.body || {}),
          hasFiles: !!req.files,
          filesKeys: req.files ? Object.keys(req.files) : [],
          contentType: req.headers['content-type']
        });
        
        return res.status(400).json({
          success: false,
          message: "No se subió ningún archivo. Asegúrate de que el campo se llame 'examFile' y que el archivo sea válido.",
          debug: {
            contentType: req.headers['content-type'],
            bodyKeys: Object.keys(req.body || {}),
            filesKeys: req.files ? Object.keys(req.files) : []
          }
        });
      }

      console.log(' Iniciando subida de examen a Azure Blob Storage...');
      console.log(` Archivo: ${req.file.originalname}`);
      console.log(` Tamaño: ${req.file.size} bytes`);
      console.log(` Tipo: ${req.file.mimetype}`);
      console.log(`  Campo: ${req.file.fieldname}`);

      // Para exámenes, usar el paciente_id en lugar del userId del médico
      let userId = req.user ? req.user.id : 'unknown';
      
      // Si hay paciente_id en el body, usarlo para generar el nombre del blob
      if (req.body && req.body.paciente_id) {
        userId = req.body.paciente_id;
        console.log(` Usando paciente_id (${userId}) para generar nombre del blob`);
      } else {
        console.log(`  No se encontró paciente_id, usando userId del médico (${userId})`);
      }

      // Obtener tipo de examen y fecha del body
      const tipoExamen = req.body.tipo_examen || '';
      const fecha = req.body.fecha || '';
      
      const blobName = azureBlobService.generateBlobName(
        userId, 
        'exam', 
        req.file.originalname, 
        containerName,
        {
          tipoExamen: tipoExamen,
          fecha: fecha
        }
      );

      console.log(` Nombre del blob: ${blobName}`);
      console.log(` Contenedor: ${containerName}`);

      // Subir archivo a Azure Blob Storage
      const uploadResult = await azureBlobService.uploadFile(
        req.file.buffer,
        blobName,
        containerName,
        req.file.mimetype
      );

      console.log(' Archivo de examen subido exitosamente a Azure');
      console.log(` URL: ${uploadResult.url}`);

      // Agregar información del blob al request
      req.azureBlob = {
        blobName: blobName,
        containerName: containerName,
        url: uploadResult.url,
        etag: uploadResult.etag,
        lastModified: uploadResult.lastModified
      };

      next();
    } catch (error) {
      console.error('❌ Error al subir archivo de examen a Azure:', error);
      
      // Error más específico según el tipo
      let errorMessage = "Error al subir archivo de examen";
      let statusCode = 500;

      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        errorMessage = "Error de conexión con Azure Blob Storage";
        statusCode = 503;
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = "Error de permisos en Azure Blob Storage";
        statusCode = 403;
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorMessage = "Contenedor de Azure Blob Storage no encontrado";
        statusCode = 404;
      } else if (error.message.includes('413') || error.message.includes('Request Entity Too Large')) {
        errorMessage = "El archivo es demasiado grande (máximo 10MB para exámenes)";
        statusCode = 413;
      }

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// Middleware específico para fotos de perfil
const profilePictureUpload = [
  azureUpload.single("profilePhoto"),
  uploadToAzure(azureBlobService.containers.profilePictures)
];

// Middleware específico para exámenes - USAR EL NUEVO MIDDLEWARE
const examUpload = [
  examMulter.single("examFile"),
  uploadExamToAzure(azureBlobService.containers.exams)
];

// Middleware específico para documentos
const documentUpload = [
  azureUpload.single("document"),
  uploadToAzure(azureBlobService.containers.documents)
];

// Middleware genérico
const genericUpload = (containerName) => [
  azureUpload.single("file"),
  uploadToAzure(containerName)
];

module.exports = {
  azureUpload,
  examMulter,
  profilePictureUpload,
  examUpload,
  documentUpload,
  genericUpload,
  uploadToAzure,
  uploadExamToAzure
}; 