const blobExamsManager = require("../utils/blobExamsManager");
const db = require("../db/sqlserver");

class BlobExamsController {
  /**
   * Obtener todos los exámenes del blob storage para administradores
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Object>}
   */
  async getAllBlobExams(filtros = {}) {
    try {
      
      const blobExams = await blobExamsManager.getAllExamsFromBlob(filtros);
      
      // Obtener información de usuarios para los exámenes del blob
      const userIds = [...new Set(blobExams.map(exam => exam.paciente_id))];
      const users = await this.getUsersInfo(userIds);
      
      // Enriquecer exámenes con información de usuarios
      const enrichedExams = blobExams.map(exam => {
        const user = users.find(u => u.id === exam.paciente_id);
        return {
          ...exam,
          nombre_paciente: user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado',
          email_paciente: user ? user.email : null,
          rut_paciente: user ? user.rut : null,
          telefono_paciente: user ? user.telefono : null
        };
      });
      
      return {
        examenes: enrichedExams,
        total: enrichedExams.length,
        filtros_aplicados: filtros,
        source: 'blob_storage',
        estadisticas: await this.getBlobExamsStats()
      };
    } catch (error) {
      console.error('Error obteniendo exámenes del blob storage:', error);
      throw error;
    }
  }

  /**
   * Obtener exámenes del blob storage por usuario
   * @param {number} userId - ID del usuario
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Object>}
   */
  async getBlobExamsByUser(userId, filtros = {}) {
    try {
      
      const blobExams = await blobExamsManager.getExamsByUser(userId, filtros);
      
      // Obtener información del usuario
      const [user] = await db.query(
        "SELECT id, nombre, apellido, email, rut, telefono FROM Usuarios WHERE id = @userId",
        { userId }
      );
      
      // Enriquecer exámenes con información del usuario
      const enrichedExams = blobExams.map(exam => ({
        ...exam,
        nombre_paciente: user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado',
        email_paciente: user ? user.email : null,
        rut_paciente: user ? user.rut : null,
        telefono_paciente: user ? user.telefono : null
      }));
      
      return {
        examenes: enrichedExams,
        total: enrichedExams.length,
        filtros_aplicados: { ...filtros, paciente_id: userId },
        source: 'blob_storage',
        usuario: user
      };
    } catch (error) {
      console.error('Error obteniendo exámenes del blob storage por usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de exámenes del blob storage
   * @returns {Promise<Object>}
   */
  async getBlobExamsStats() {
    try {
      
      const stats = await blobExamsManager.getBlobExamsStats();
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas del blob storage:', error);
      throw error;
    }
  }

  /**
   * Obtener tipos de archivo únicos del blob storage
   * @returns {Promise<Array>}
   */
  async getBlobFileTypes() {
    try {
      
      const allExams = await blobExamsManager.getAllExamsFromBlob();
      const fileTypes = [...new Set(allExams.map(exam => exam.tipo_examen))];
      return fileTypes.sort();
    } catch (error) {
      console.error('Error obteniendo tipos de archivo del blob storage:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios con exámenes en el blob storage
   * @returns {Promise<Array>}
   */
  async getUsersWithBlobExams() {
    try {
      
      const allExams = await blobExamsManager.getAllExamsFromBlob();
      const userCounts = {};
      const userSizes = {};
      
      // Contar exámenes y calcular tamaños por usuario
      allExams.forEach(exam => {
        const userId = exam.paciente_id;
        userCounts[userId] = (userCounts[userId] || 0) + 1;
        userSizes[userId] = (userSizes[userId] || 0) + (exam.archivo_tamaño || 0);
      });
      
      // Obtener información de usuarios únicos
      const userIds = Object.keys(userCounts).map(id => parseInt(id));
      const users = await this.getUsersInfo(userIds);
      
      // Combinar información
      const usersWithExams = users.map(user => ({
        user_id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        total_exams: userCounts[user.id] || 0,
        total_size: userSizes[user.id] || 0
      }));
      
      return usersWithExams.sort((a, b) => b.total_exams - a.total_exams);
    } catch (error) {
      console.error('Error obteniendo usuarios con exámenes del blob storage:', error);
      throw error;
    }
  }

  /**
   * Eliminar examen del blob storage
   * @param {string} blobName - Nombre del blob
   * @param {number} userId - ID del usuario que solicita la eliminación
   * @param {string} userRole - Rol del usuario
   * @returns {Promise<Object>}
   */
  async deleteBlobExam(blobName, userId, userRole) {
    try {
      // Verificar permisos
      if (userRole !== 'admin' && userRole !== 'medico') {
        throw new Error('Sin permisos para eliminar exámenes del blob storage');
      }
      
      // Verificar que el archivo existe
      const examExists = await blobExamsManager.fileExists(blobName);
      if (!examExists) {
        throw new Error('Examen no encontrado en el blob storage');
      }
      
      // Eliminar el archivo
      const success = await blobExamsManager.deleteExamFromBlob(blobName);
      
      if (success) {
        return {
          success: true,
          message: 'Examen eliminado exitosamente del blob storage',
          blobName: blobName
        };
      } else {
        throw new Error('Error al eliminar el examen del blob storage');
      }
    } catch (error) {
      console.error('Error eliminando examen del blob storage:', error);
      throw error;
    }
  }

  /**
   * Mover examen a carpeta de archivo
   * @param {string} blobName - Nombre del blob
   * @param {string} newFolder - Nueva carpeta
   * @param {number} userId - ID del usuario que solicita el movimiento
   * @param {string} userRole - Rol del usuario
   * @returns {Promise<Object>}
   */
  async moveBlobExam(blobName, newFolder, userId, userRole) {
    try {
      // Verificar permisos
      if (userRole !== 'admin' && userRole !== 'medico') {
        throw new Error('Sin permisos para mover exámenes del blob storage');
      }
      
      // Verificar que el archivo existe
      const examExists = await blobExamsManager.fileExists(blobName);
      if (!examExists) {
        throw new Error('Examen no encontrado en el blob storage');
      }
      
      // Mover el archivo
      const success = await blobExamsManager.moveExamToFolder(blobName, newFolder);
      
      if (success) {
        return {
          success: true,
          message: 'Examen movido exitosamente',
          blobName: blobName,
          newFolder: newFolder
        };
      } else {
        throw new Error('Error al mover el examen');
      }
    } catch (error) {
      console.error('Error moviendo examen del blob storage:', error);
      throw error;
    }
  }

  /**
   * Restaurar examen archivado
   * @param {string} blobName - Nombre del blob
   * @param {number} userId - ID del usuario que solicita la restauración
   * @param {string} userRole - Rol del usuario
   * @returns {Promise<Object>}
   */
  async restoreBlobExam(blobName, userId, userRole) {
    try {
      // Verificar permisos
      if (userRole !== 'admin' && userRole !== 'medico') {
        throw new Error('Sin permisos para restaurar exámenes del blob storage');
      }
      
      // Verificar que el archivo existe en la carpeta archived
      if (!blobName.includes('archived/')) {
        throw new Error('El examen no está archivado');
      }
      
      // Extraer el usuario ID del blob name
      const userIdMatch = blobName.match(/user-(\d+)/);
      if (!userIdMatch) {
        throw new Error('No se pudo determinar el usuario del examen');
      }
      
      const originalUserId = userIdMatch[1];
      const originalFolder = `user-${originalUserId}`;
      
      // Mover de vuelta a la carpeta original
      const success = await blobExamsManager.moveExamToFolder(blobName, originalFolder);
      
      if (success) {
        return {
          success: true,
          message: 'Examen restaurado exitosamente',
          blobName: blobName,
          originalFolder: originalFolder
        };
      } else {
        throw new Error('Error al restaurar el examen');
      }
    } catch (error) {
      console.error('Error restaurando examen del blob storage:', error);
      throw error;
    }
  }

  /**
   * Realizar acción masiva sobre múltiples exámenes
   * @param {Array} blobIds - Array de IDs de blob
   * @param {Object} action - Acción a realizar
   * @param {number} userId - ID del usuario que solicita la acción
   * @param {string} userRole - Rol del usuario
   * @returns {Promise<Object>}
   */
  async performBulkAction(blobIds, action, userId, userRole) {
    try {
      // Verificar permisos
      if (userRole !== 'admin' && userRole !== 'medico') {
        throw new Error('Sin permisos para realizar acciones masivas en el blob storage');
      }
      
      
      const results = {
        successful: [],
        failed: [],
        errors: {}
      };
      
      for (const blobId of blobIds) {
        try {
          // Decodificar el nombre del blob del ID usando la nueva función
          const blobName = blobExamsManager.decodeBlobNameFromId(blobId);
          
          let success = false;
          
          switch (action.action) {
            case 'delete':
              const deleteResult = await this.deleteBlobExam(blobName, userId, userRole);
              success = deleteResult.success;
              break;
              
            case 'archive':
              const archiveResult = await this.moveBlobExam(blobName, action.target_folder || 'archived', userId, userRole);
              success = archiveResult.success;
              break;
              
            case 'move':
              if (!action.target_folder) {
                throw new Error('Se requiere especificar carpeta destino para la acción move');
              }
              const moveResult = await this.moveBlobExam(blobName, action.target_folder, userId, userRole);
              success = moveResult.success;
              break;
              
            case 'restore':
              const restoreResult = await this.restoreBlobExam(blobName, userId, userRole);
              success = restoreResult.success;
              break;
              
            default:
              throw new Error(`Acción "${action.action}" no reconocida`);
          }
          
          if (success) {
            results.successful.push(blobId);
          } else {
            results.failed.push(blobId);
            results.errors[blobId] = 'La acción no se completó exitosamente';
          }
          
        } catch (error) {
          console.error(`Error procesando ${blobId}:`, error);
          results.failed.push(blobId);
          results.errors[blobId] = error.message;
        }
      }
      
      
      return results;
    } catch (error) {
      console.error('Error en acción masiva del blob storage:', error);
      throw error;
    }
  }

  /**
   * Limpiar blob storage
   * @param {Object} options - Opciones de limpieza
   * @param {number} userId - ID del usuario que solicita la limpieza
   * @param {string} userRole - Rol del usuario
   * @returns {Promise<Object>}
   */
  async cleanupBlobStorage(options, userId, userRole) {
    try {
      // Verificar permisos
      if (userRole !== 'admin') {
        throw new Error('Solo los administradores pueden realizar limpieza del blob storage');
      }
      
      
      const results = await blobExamsManager.cleanupBlobStorage(options);
      
      return {
        success: true,
        message: 'Limpieza del blob storage completada',
        results: results
      };
    } catch (error) {
      console.error('Error en limpieza del blob storage:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo examen en blob storage (subido por médico)
   * @param {Object} examData - Datos del examen
   * @returns {Promise<Object>}
   */
  async createBlobExam(examData) {
    try {
      const { paciente_id, medico_id, tipo_examen, fecha, descripcion, azure_blob } = examData;
      
      
      // Verificar que el paciente existe
      const [paciente] = await db.query(
        "SELECT id, nombre, apellido, email FROM Usuarios WHERE id = @pacienteId AND role = 'user'",
        { pacienteId: paciente_id }
      );
      
      if (!paciente) {
        throw new Error('Paciente no encontrado');
      }
      
      // Verificar que el médico existe
      const [medico] = await db.query(
        "SELECT id, nombre, apellido, email FROM Usuarios WHERE id = @medicoId AND role = 'medico'",
        { medicoId: medico_id }
      );
      
      if (!medico) {
        throw new Error('Médico no encontrado');
      }
      
      // Codificar el nombre del blob para el ID usando la nueva función
      const encodedBlobName = Buffer.from(azure_blob.blobName).toString('base64').replace(/[+/=]/g, (match) => {
        return { '+': '-', '/': '_', '=': '' }[match];
      });
      
      // El archivo ya fue subido a Azure por el middleware, solo necesitamos retornar información del examen creado
      const nuevoExamen = {
        id: `blob_${encodedBlobName}`,
        paciente_id,
        medico_id,
        tipo_examen,
        fecha,
        descripcion,
        estado: 'completado',
        archivo_path: azure_blob.blobName,
        archivo_nombre_original: azure_blob.blobName.split('/').pop(),
        archivo_container: azure_blob.containerName,
        archivo_url: azure_blob.url,
        creado_en: new Date(),
        actualizado_en: new Date(),
        nombre_medico: `${medico.nombre} ${medico.apellido}`,
        email_medico: medico.email,
        nombre_paciente: `${paciente.nombre} ${paciente.apellido}`,
        email_paciente: paciente.email,
        es_blob_storage: true
      };
      
      return {
        success: true,
        message: 'Examen creado exitosamente en blob storage',
        examen: nuevoExamen
      };
    } catch (error) {
      console.error('Error creando examen en blob storage:', error);
      throw error;
    }
  }

  /**
   * Obtener información de usuarios por IDs
   * @param {Array} userIds - Array de IDs de usuario
   * @returns {Promise<Array>}
   */
  async getUsersInfo(userIds) {
    try {
      if (!userIds || userIds.length === 0) {
        return [];
      }
      
      // Crear placeholders para la consulta
      const placeholders = userIds.map((_, index) => `@userId${index}`).join(',');
      const params = {};
      userIds.forEach((id, index) => {
        params[`userId${index}`] = id;
      });
      
      const users = await db.query(
        `SELECT id, nombre, apellido, email, rut, telefono FROM Usuarios WHERE id IN (${placeholders})`,
        params
      );
      
      return users;
    } catch (error) {
      console.error('Error obteniendo información de usuarios:', error);
      return [];
    }
  }

  /**
   * Obtener examen específico del blob storage
   * @param {string} blobId - ID del blob
   * @param {number} userId - ID del usuario que solicita el examen
   * @param {string} userRole - Rol del usuario
   * @returns {Promise<Object>}
   */
  async getBlobExamById(blobId, userId, userRole) {
    try {
      // Decodificar el nombre del blob del ID usando la nueva función
      const blobName = blobExamsManager.decodeBlobNameFromId(blobId);
      
      // Verificar que el archivo existe
      const examExists = await blobExamsManager.fileExists(blobName);
      if (!examExists) {
        throw new Error('Examen no encontrado en el blob storage');
      }
      
      // Obtener información del blob
      const containerClient = blobExamsManager.getContainerClient(blobExamsManager.containerName);
      const blobClient = containerClient.getBlockBlobClient(blobName);
      const properties = await blobClient.getProperties();
      
      // Crear objeto de examen
      const exam = await blobExamsManager.processBlobToExam({
        name: blobName,
        properties: properties
      });
      
      if (!exam) {
        throw new Error('Error procesando examen del blob storage');
      }
      
      // Verificar permisos
      if (userRole !== 'admin' && userRole !== 'medico' && exam.paciente_id !== userId) {
        throw new Error('Sin permisos para acceder a este examen');
      }
      
      // Obtener información del usuario
      const [user] = await db.query(
        "SELECT id, nombre, apellido, email, rut, telefono FROM Usuarios WHERE id = @userId",
        { userId: exam.paciente_id }
      );
      
      // Enriquecer examen con información del usuario
      return {
        ...exam,
        nombre_paciente: user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado',
        email_paciente: user ? user.email : null,
        rut_paciente: user ? user.rut : null,
        telefono_paciente: user ? user.telefono : null
      };
    } catch (error) {
      console.error('Error obteniendo examen del blob storage:', error);
      throw error;
    }
  }

  /**
   * Descargar archivo del blob storage
   * @param {string} blobId - ID del blob
   * @param {number} userId - ID del usuario que solicita la descarga
   * @param {string} userRole - Rol del usuario
   * @returns {Promise<Object>}
   */
  async downloadBlobExam(blobId, userId, userRole) {
    try {
      // Decodificar el nombre del blob del ID usando la nueva función
      const blobName = blobExamsManager.decodeBlobNameFromId(blobId);
      
      // Verificar que el archivo existe
      const examExists = await blobExamsManager.fileExists(blobName);
      if (!examExists) {
        throw new Error('Examen no encontrado en el blob storage');
      }
      
      // Obtener información del examen para verificar permisos
      const exam = await this.getBlobExamById(blobId, userId, userRole);
      
      // Generar URL de descarga temporal
      const downloadUrl = await blobExamsManager.getDownloadUrl(blobName, 60);
      
      return {
        downloadUrl,
        originalName: exam.archivo_nombre_original,
        mimeType: exam.archivo_tipo,
        size: exam.archivo_tamaño,
        isAzure: true
      };
    } catch (error) {
      console.error('Error descargando examen del blob storage:', error);
      throw error;
    }
  }
}

module.exports = new BlobExamsController(); 