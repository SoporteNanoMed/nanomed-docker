const azureBlobService = require("./azureBlobService");
const path = require("path");
const { BlobServiceClient } = require("@azure/storage-blob");

class BlobExamsManager {
  constructor() {
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_EXAMS || 'exams';
  }

  /**
   * Decodificar nombre del blob desde un ID blob
   * @param {string} blobId - ID del blob (formato: blob_<encoded_name>)
   * @returns {string} - Nombre original del blob
   */
  decodeBlobNameFromId(blobId) {
    try {
      // Remover el prefijo 'blob_'
      const encodedName = blobId.replace('blob_', '');
      
      // Si el ID no está codificado en base64 (formato antiguo), usar conversión legacy
      if (!this.isBase64Encoded(encodedName)) {
        return encodedName.replace(/_/g, '/');
      }
      
      // Decodificar de base64 URL-safe
      const base64 = encodedName.replace(/-/g, '+').replace(/_/g, '/');
      // Agregar padding si es necesario
      const paddedBase64 = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);
      
      const decodedName = Buffer.from(paddedBase64, 'base64').toString('utf-8');
      return decodedName;
    } catch (error) {
      // Fallback a conversión legacy
      const encodedName = blobId.replace('blob_', '');
      return encodedName.replace(/_/g, '/');
    }
  }

  /**
   * Verificar si una cadena está codificada en base64
   * @param {string} str - Cadena a verificar
   * @returns {boolean}
   */
  isBase64Encoded(str) {
    try {
      // Base64 URL-safe solo contiene A-Z, a-z, 0-9, -, _
      const base64Pattern = /^[A-Za-z0-9\-_]+$/;
      if (!base64Pattern.test(str)) {
        return false;
      }
      
      // Intentar decodificar
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);
      Buffer.from(paddedBase64, 'base64');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtener cliente de contenedor
   * @param {string} containerName - Nombre del contenedor
   * @returns {ContainerClient}
   */
  getContainerClient(containerName) {
    return azureBlobService.getContainerClient(containerName || this.containerName);
  }

  /**
   * Verificar si un archivo existe en el blob storage
   * @param {string} blobName - Nombre del blob
   * @param {string} containerName - Nombre del contenedor (opcional)
   * @returns {Promise<boolean>}
   */
  async fileExists(blobName, containerName = null) {
    return azureBlobService.fileExists(blobName, containerName || this.containerName);
  }

  /**
   * Obtener URL de descarga temporal
   * @param {string} blobName - Nombre del blob
   * @param {number} expiresInMinutes - Tiempo de expiración en minutos
   * @param {string} containerName - Nombre del contenedor (opcional)
   * @returns {Promise<string>}
   */
  async getDownloadUrl(blobName, expiresInMinutes = 60, containerName = null) {
    return azureBlobService.getDownloadUrl(blobName, containerName || this.containerName, expiresInMinutes);
  }

  /**
   * Obtener todos los exámenes del blob storage para todos los usuarios
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>}
   */
  async getAllExamsFromBlob(options = {}) {
    try {
      const containerClient = azureBlobService.getContainerClient(this.containerName);
      const allExams = [];
      
      // Listar todos los blobs en el contenedor
      for await (const blob of containerClient.listBlobsFlat()) {
        try {
          const exam = await this.processBlobToExam(blob);
          if (exam) {
            // Aplicar filtros si se especifican
            if (this.applyFilters(exam, options)) {
              allExams.push(exam);
            }
          }
        } catch (error) {
          console.error(`Error procesando blob ${blob.name}:`, error);
        }
      }
      
      // Ordenar por fecha de creación (más recientes primero)
      return allExams.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
    } catch (error) {
      console.error('Error obteniendo exámenes del blob storage:', error);
      throw error;
    }
  }

  /**
   * Obtener exámenes de un usuario específico
   * @param {number} userId - ID del usuario
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>}
   */
  async getExamsByUser(userId, options = {}) {
    try {
      const containerClient = azureBlobService.getContainerClient(this.containerName);
      const userFolder = `user-${userId}`;
      const userExams = [];
      
      // Listar blobs en la carpeta del usuario
      for await (const blob of containerClient.listBlobsFlat({ prefix: userFolder + '/' })) {
        try {
          // Excluir archivos que no son exámenes
          if (!blob.name.includes('/profile-') && !blob.name.includes('/document-')) {
            const exam = await this.processBlobToExam(blob);
            if (exam && this.applyFilters(exam, options)) {
              userExams.push(exam);
            }
          }
        } catch (error) {
          console.error(`Error procesando blob ${blob.name}:`, error);
        }
      }
      
      return userExams.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
    } catch (error) {
      console.error('Error obteniendo exámenes del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de exámenes en blob storage
   * @returns {Promise<Object>}
   */
  async getBlobExamsStats() {
    try {
      const containerClient = azureBlobService.getContainerClient(this.containerName);
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        usersWithFiles: new Set(),
        fileTypes: {},
        recentFiles: 0,
        oldestFile: null,
        newestFile: null
      };
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      for await (const blob of containerClient.listBlobsFlat()) {
        if (!blob.name.includes('/profile-') && !blob.name.includes('/document-')) {
          stats.totalFiles++;
          stats.totalSize += blob.properties.contentLength || 0;
          
          // Extraer userId del nombre del blob
          const userIdMatch = blob.name.match(/user-(\d+)/);
          if (userIdMatch) {
            stats.usersWithFiles.add(parseInt(userIdMatch[1]));
          }
          
          // Contar tipos de archivo
          const ext = path.extname(blob.name).toLowerCase();
          stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
          
          // Archivos recientes (últimos 30 días)
          if (blob.properties.lastModified > thirtyDaysAgo) {
            stats.recentFiles++;
          }
          
          // Archivo más antiguo y más nuevo
          if (!stats.oldestFile || blob.properties.lastModified < stats.oldestFile) {
            stats.oldestFile = blob.properties.lastModified;
          }
          if (!stats.newestFile || blob.properties.lastModified > stats.newestFile) {
            stats.newestFile = blob.properties.lastModified;
          }
        }
      }
      
      return {
        ...stats,
        usersWithFiles: stats.usersWithFiles.size,
        averageFileSize: stats.totalFiles > 0 ? Math.round(stats.totalSize / stats.totalFiles) : 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del blob storage:', error);
      throw error;
    }
  }

  /**
   * Eliminar examen del blob storage
   * @param {string} blobName - Nombre del blob
   * @returns {Promise<boolean>}
   */
  async deleteExamFromBlob(blobName) {
    try {
      const success = await azureBlobService.deleteFile(blobName, this.containerName);
      if (success) {
        console.log(` Examen eliminado del blob storage: ${blobName}`);
      } else {
        console.error(` Error eliminando examen del blob storage: ${blobName}`);
      }
      return success;
    } catch (error) {
      console.error('Error eliminando examen del blob storage:', error);
      return false;
    }
  }

  /**
   * Mover examen a otra carpeta (archivar)
   * @param {string} blobName - Nombre del blob actual
   * @param {string} newFolder - Nueva carpeta (ej: 'archived', 'processed')
   * @returns {Promise<boolean>}
   */
  async moveExamToFolder(blobName, newFolder) {
    try {
      const containerClient = azureBlobService.getContainerClient(this.containerName);
      const sourceBlob = containerClient.getBlockBlobClient(blobName);
      
      // Crear nuevo nombre con la nueva carpeta
      const fileName = path.basename(blobName);
      const newBlobName = `${newFolder}/${fileName}`;
      const destBlob = containerClient.getBlockBlobClient(newBlobName);
      
      // Copiar blob
      await destBlob.beginCopyFromURL(sourceBlob.url);
      
      // Eliminar blob original
      await sourceBlob.delete();
      
      console.log(` Examen movido: ${blobName} -> ${newBlobName}`);
      return true;
    } catch (error) {
      console.error('Error moviendo examen:', error);
      return false;
    }
  }

  /**
   * Limpiar archivos temporales o duplicados
   * @param {Object} options - Opciones de limpieza
   * @returns {Promise<Object>}
   */
  async cleanupBlobStorage(options = {}) {
    const {
      deleteTempFiles = true,
      deleteDuplicates = false,
      olderThanDays = 90,
      dryRun = true
    } = options;
    
    try {
      const containerClient = azureBlobService.getContainerClient(this.containerName);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const cleanupResults = {
        tempFilesDeleted: 0,
        duplicatesDeleted: 0,
        oldFilesDeleted: 0,
        totalSizeFreed: 0,
        errors: []
      };
      
      const processedFiles = new Map(); // Para detectar duplicados
      
      for await (const blob of containerClient.listBlobsFlat()) {
        try {
          const shouldDelete = [];
          
          // Verificar archivos temporales
          if (deleteTempFiles && blob.name.includes('/temp-')) {
            shouldDelete.push('temp');
          }
          
          // Verificar archivos antiguos
          if (blob.properties.lastModified < cutoffDate) {
            shouldDelete.push('old');
          }
          
          // Verificar duplicados (por tamaño y nombre)
          if (deleteDuplicates) {
            const fileKey = `${blob.properties.contentLength}_${path.basename(blob.name)}`;
            if (processedFiles.has(fileKey)) {
              shouldDelete.push('duplicate');
            } else {
              processedFiles.set(fileKey, blob.name);
            }
          }
          
          if (shouldDelete.length > 0 && !dryRun) {
            const success = await azureBlobService.deleteFile(blob.name, this.containerName);
            if (success) {
              cleanupResults.totalSizeFreed += blob.properties.contentLength || 0;
              
              if (shouldDelete.includes('temp')) cleanupResults.tempFilesDeleted++;
              if (shouldDelete.includes('old')) cleanupResults.oldFilesDeleted++;
              if (shouldDelete.includes('duplicate')) cleanupResults.duplicatesDeleted++;
            }
          }
        } catch (error) {
          cleanupResults.errors.push({
            blob: blob.name,
            error: error.message
          });
        }
      }
      
      return cleanupResults;
    } catch (error) {
      console.error('Error en limpieza del blob storage:', error);
      throw error;
    }
  }

  /**
   * Procesar blob y convertirlo a formato de examen
   * @param {Object} blob - Objeto blob de Azure
   * @returns {Promise<Object|null>}
   */
  async processBlobToExam(blob) {
    try {
      const fileName = path.basename(blob.name);
      const fileExt = path.extname(fileName).toLowerCase();
      
      // Extraer userId del nombre del blob
      const userIdMatch = blob.name.match(/user-(\d+)/);
      if (!userIdMatch) {
        return null;
      }
      
      const userId = parseInt(userIdMatch[1]);
      
      // Determinar tipo de examen basado en la extensión
      let tipoExamen = this.getExamTypeFromExtension(fileExt);
      
      // Extraer información adicional del nombre del archivo
      const examInfo = this.extractExamInfoFromFileName(fileName);
      
      // Generar URL de descarga temporal
      const downloadUrl = await azureBlobService.getDownloadUrl(
        blob.name,
        this.containerName,
        60 // 60 minutos
      );
      
      // Codificar el nombre del blob en base64 para preservar la estructura original
      const encodedBlobName = Buffer.from(blob.name).toString('base64').replace(/[+/=]/g, (match) => {
        return { '+': '-', '/': '_', '=': '' }[match];
      });
      
      return {
        id: `blob_${encodedBlobName}`,
        paciente_id: userId,
        medico_id: null,
        tipo_examen: examInfo.tipoExamen || tipoExamen,
        fecha: examInfo.fecha || blob.properties.lastModified.toISOString().split('T')[0],
        descripcion: examInfo.descripcion || `Archivo subido: ${fileName}`,
        resultados: null,
        estado: 'completado',
        archivo_path: blob.name,
        archivo_nombre_original: fileName,
        archivo_container: this.containerName,
        archivo_url: downloadUrl,
        archivo_tamaño: blob.properties.contentLength,
        archivo_tipo: blob.properties.contentType,
        creado_en: blob.properties.lastModified,
        actualizado_en: blob.properties.lastModified,
        nombre_medico: "Sistema",
        email_medico: null,
        nombre_paciente: null,
        email_paciente: null,
        rut_paciente: null,
        es_blob_storage: true,
        blob_properties: {
          etag: blob.properties.etag,
          contentType: blob.properties.contentType,
          contentLength: blob.properties.contentLength,
          lastModified: blob.properties.lastModified
        }
      };
    } catch (error) {
      console.error(`Error procesando blob ${blob.name}:`, error);
      return null;
    }
  }

  /**
   * Aplicar filtros a un examen
   * @param {Object} exam - Examen a filtrar
   * @param {Object} filters - Filtros a aplicar
   * @returns {boolean}
   */
  applyFilters(exam, filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return true;
    }
    
    // Filtro por tipo de examen
    if (filters.tipo_examen && !exam.tipo_examen.toLowerCase().includes(filters.tipo_examen.toLowerCase())) {
      return false;
    }
    
    // Filtro por fecha desde
    if (filters.fecha_desde && new Date(exam.fecha) < new Date(filters.fecha_desde)) {
      return false;
    }
    
    // Filtro por fecha hasta
    if (filters.fecha_hasta && new Date(exam.fecha) > new Date(filters.fecha_hasta)) {
      return false;
    }
    
    // Filtro por paciente
    if (filters.paciente_id && exam.paciente_id !== parseInt(filters.paciente_id)) {
      return false;
    }
    
    return true;
  }

  /**
   * Determinar tipo de examen basado en la extensión
   * @param {string} extension - Extensión del archivo
   * @returns {string}
   */
  getExamTypeFromExtension(extension) {
    const typeMap = {
      '.jpg': 'Imagen médica',
      '.jpeg': 'Imagen médica',
      '.png': 'Imagen médica',
      '.gif': 'Imagen médica',
      '.bmp': 'Imagen médica',
      '.webp': 'Imagen médica',
      '.pdf': 'Documento PDF',
      '.doc': 'Documento Word',
      '.docx': 'Documento Word',
      '.xls': 'Hoja de cálculo',
      '.xlsx': 'Hoja de cálculo',
      '.zip': 'Paquete comprimido',
      '.rar': 'Paquete comprimido',
      '.dicom': 'Imagen DICOM',
      '.txt': 'Documento de texto'
    };
    
    return typeMap[extension] || 'Documento médico';
  }

  /**
   * Extraer información del examen del nombre del archivo
   * @param {string} fileName - Nombre del archivo
   * @returns {Object}
   */
  extractExamInfoFromFileName(fileName) {
    const info = {
      tipoExamen: null,
      fecha: null,
      descripcion: null
    };
    
    // Buscar patrón de fecha en el nombre
    const dateMatch = fileName.match(/(\d{4})(\d{2})(\d{2})/);
    if (dateMatch) {
      info.fecha = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }
    
    // Buscar timestamp
    const timestampMatch = fileName.match(/(\d{13})/);
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch[1]);
      if (!info.fecha) {
        info.fecha = new Date(timestamp).toISOString().split('T')[0];
      }
    }
    
    // Extraer tipo de examen del nombre
    const nameWithoutExt = path.basename(fileName, path.extname(fileName));
    const parts = nameWithoutExt.split('-');
    
    if (parts.length > 1) {
      // El primer elemento suele ser el tipo de examen
      info.tipoExamen = parts[0].replace(/([A-Z])/g, ' $1').trim();
    }
    
    return info;
  }
}

module.exports = new BlobExamsManager(); 