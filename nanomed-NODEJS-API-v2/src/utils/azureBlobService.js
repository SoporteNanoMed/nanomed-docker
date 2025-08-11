const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
const fs = require("fs");

class AzureBlobService {
  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    this.accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    
    // Contenedores
    this.containers = {
      profilePictures: process.env.AZURE_STORAGE_CONTAINER_PROFILE_PICTURES || 'profile-pictures',
      exams: process.env.AZURE_STORAGE_CONTAINER_EXAMS || 'exams',
      documents: process.env.AZURE_STORAGE_CONTAINER_DOCUMENTS || 'documents',
      temp: process.env.AZURE_STORAGE_CONTAINER_TEMP || 'temp'
    };

    // Inicializar cliente
    this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
  }

  /**
   * Obtener cliente de contenedor
   * @param {string} containerName - Nombre del contenedor
   * @returns {ContainerClient}
   */
  getContainerClient(containerName) {
    return this.blobServiceClient.getContainerClient(containerName);
  }

  /**
   * Subir archivo a Azure Blob Storage
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {string} blobName - Nombre del blob (incluyendo ruta)
   * @param {string} containerName - Nombre del contenedor
   * @param {string} contentType - Tipo de contenido
   * @returns {Promise<Object>}
   */
  async uploadFile(fileBuffer, blobName, containerName, contentType = 'application/octet-stream') {
    try {
      const containerClient = this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const uploadResult = await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      });

      return {
        success: true,
        url: blockBlobClient.url,
        blobName: blobName,
        etag: uploadResult.etag,
        lastModified: uploadResult.lastModified
      };
    } catch (error) {
      console.error('Error uploading to Azure Blob:', error);
      throw new Error(`Error al subir archivo a Azure: ${error.message}`);
    }
  }

  /**
   * Subir archivo desde ruta local
   * @param {string} filePath - Ruta del archivo local
   * @param {string} blobName - Nombre del blob
   * @param {string} containerName - Nombre del contenedor
   * @returns {Promise<Object>}
   */
  async uploadFileFromPath(filePath, blobName, containerName) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const contentType = this.getContentType(filePath);
      return await this.uploadFile(fileBuffer, blobName, containerName, contentType);
    } catch (error) {
      console.error('Error uploading file from path:', error);
      throw new Error(`Error al subir archivo desde ruta: ${error.message}`);
    }
  }

  /**
   * Eliminar archivo de Azure Blob Storage
   * @param {string} blobName - Nombre del blob
   * @param {string} containerName - Nombre del contenedor
   * @returns {Promise<boolean>}
   */
  async deleteFile(blobName, containerName) {
    try {
      const containerClient = this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const deleteResult = await blockBlobClient.delete();
      return deleteResult.errorCode === undefined;
    } catch (error) {
      console.error('Error deleting from Azure Blob:', error);
      return false;
    }
  }

  /**
   * Obtener URL de descarga temporal
   * @param {string} blobName - Nombre del blob
   * @param {string} containerName - Nombre del contenedor
   * @param {number} expiresInMinutes - Tiempo de expiración en minutos
   * @returns {Promise<string>}
   */
  async getDownloadUrl(blobName, containerName, expiresInMinutes = 60) {
    try {
      const containerClient = this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const expiresOn = new Date();
      expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);
      
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: 'r',
        expiresOn: expiresOn
      });
      
      return sasUrl;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error(`Error al generar URL de descarga: ${error.message}`);
    }
  }

  /**
   * Verificar si un archivo existe
   * @param {string} blobName - Nombre del blob
   * @param {string} containerName - Nombre del contenedor
   * @returns {Promise<boolean>}
   */
  async fileExists(blobName, containerName) {
    try {
      const containerClient = this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const properties = await blockBlobClient.getProperties();
      return properties.lastModified !== undefined;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener propiedades del archivo
   * @param {string} blobName - Nombre del blob
   * @param {string} containerName - Nombre del contenedor
   * @returns {Promise<Object>}
   */
  async getFileProperties(blobName, containerName) {
    try {
      const containerClient = this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const properties = await blockBlobClient.getProperties();
      return {
        size: properties.contentLength,
        lastModified: properties.lastModified,
        contentType: properties.contentType,
        etag: properties.etag
      };
    } catch (error) {
      console.error('Error getting file properties:', error);
      throw new Error(`Error al obtener propiedades del archivo: ${error.message}`);
    }
  }

  /**
   * Generar nombre de blob único
   * @param {string} userId - ID del usuario
   * @param {string} fileType - Tipo de archivo (profile, exam, document)
   * @param {string} originalName - Nombre original del archivo
   * @param {string} containerName - Nombre del contenedor
   * @param {Object} options - Opciones adicionales para el nombre
   * @returns {string}
   */
  generateBlobName(userId, fileType, originalName, containerName, options = {}) {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const ext = path.extname(originalName);
    
    // Crear estructura de carpetas por usuario
    const userFolder = `user-${userId}`;
    
    switch (containerName) {
      case this.containers.profilePictures:
        return `${userFolder}/profile-${timestamp}-${randomSuffix}${ext}`;
      
      case this.containers.exams:
        // Para exámenes, usar tipo de examen y fecha si están disponibles
        if (options.tipoExamen && options.fecha) {
          const fechaFormateada = options.fecha.replace(/-/g, '');
          const tipoExamenLimpio = options.tipoExamen
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase()
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          return `${userFolder}/${tipoExamenLimpio}-${fechaFormateada}-${randomSuffix}${ext}`;
        }
        return `${userFolder}/exam-${timestamp}-${randomSuffix}${ext}`;
      
      case this.containers.documents:
        return `${userFolder}/document-${timestamp}-${randomSuffix}${ext}`;
      
      case this.containers.temp:
        return `temp-${timestamp}-${randomSuffix}${ext}`;
      
      default:
        return `${userFolder}/${fileType}-${timestamp}-${randomSuffix}${ext}`;
    }
  }

  /**
   * Obtener tipo de contenido basado en extensión
   * @param {string} filePath - Ruta del archivo
   * @returns {string}
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.dicom': 'application/dicom'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Migrar archivo desde almacenamiento local a Azure
   * @param {string} localPath - Ruta local del archivo
   * @param {string} userId - ID del usuario
   * @param {string} containerName - Nombre del contenedor
   * @returns {Promise<Object>}
   */
  async migrateFromLocal(localPath, userId, containerName) {
    try {
      if (!fs.existsSync(localPath)) {
        throw new Error(`Archivo local no encontrado: ${localPath}`);
      }

      const fileName = path.basename(localPath);
      const blobName = this.generateBlobName(userId, 'migrated', fileName, containerName);
      
      const result = await this.uploadFileFromPath(localPath, blobName, containerName);
      
      // Eliminar archivo local después de migración exitosa
      fs.unlinkSync(localPath);
      
      return {
        ...result,
        originalPath: localPath,
        migrated: true
      };
    } catch (error) {
      console.error('Error migrating file:', error);
      throw new Error(`Error al migrar archivo: ${error.message}`);
    }
  }
}

module.exports = new AzureBlobService(); 