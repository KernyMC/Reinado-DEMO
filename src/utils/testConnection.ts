import { apiClient } from '@/services/api';

export const testServerConnection = async (): Promise<{
  success: boolean;
  message: string;
  serverInfo?: any;
}> => {
  try {
    console.log('🔄 Probando conexión con el servidor...');
    
    // Test basic connectivity
    const response = await apiClient.get('/health');
    
    if (response.status === 200) {
      console.log('✅ Servidor conectado exitosamente');
      return {
        success: true,
        message: 'Conexión exitosa con el servidor',
        serverInfo: response.data,
      };
    } else {
      console.log('❌ Servidor respondió con estado:', response.status);
      return {
        success: false,
        message: `Servidor respondió con estado: ${response.status}`,
      };
    }
  } catch (error: any) {
    console.error('❌ Error de conexión:', error);
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      return {
        success: false,
        message: 'No se puede conectar al servidor. Verificar que esté ejecutándose en http://localhost:3000',
      };
    }
    
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Endpoint /health no encontrado. Verificar configuración del servidor.',
      };
    }
    
    return {
      success: false,
      message: error.message || 'Error desconocido al conectar con el servidor',
    };
  }
};

export const testAuthEndpoint = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log('🔄 Probando endpoint de autenticación...');
    
    // Test login endpoint with invalid credentials (should return 401)
    const response = await apiClient.post('/auth/login', {
      email: 'test@test.com',
      password: 'invalid',
    });
    
    return {
      success: false,
      message: 'Endpoint de auth responde incorrectamente',
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Endpoint de autenticación funcionando');
      return {
        success: true,
        message: 'Endpoint de autenticación funcionando correctamente',
      };
    }
    
    console.error('❌ Error en endpoint de auth:', error);
    return {
      success: false,
      message: error.message || 'Error en endpoint de autenticación',
    };
  }
};

export const testDatabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log('🔄 Probando conexión con base de datos...');
    
    // Test getting events (should work without auth)
    const response = await apiClient.get('/events');
    
    if (response.status === 200) {
      console.log('✅ Base de datos conectada');
      return {
        success: true,
        message: 'Base de datos conectada exitosamente',
        data: response.data,
      };
    }
    
    return {
      success: false,
      message: 'Error al obtener datos de la base de datos',
    };
  } catch (error: any) {
    console.error('❌ Error de base de datos:', error);
    return {
      success: false,
      message: error.response?.data?.error || 'Error de conexión con base de datos',
    };
  }
};

export const runFullConnectionTest = async () => {
  console.log('🚀 Iniciando prueba completa de conexión...');
  console.log('================================================');
  
  const results = {
    server: await testServerConnection(),
    auth: await testAuthEndpoint(),
    database: await testDatabaseConnection(),
  };
  
  console.log('📊 Resultados de la prueba:');
  console.log('Server:', results.server.success ? '✅' : '❌', results.server.message);
  console.log('Auth:', results.auth.success ? '✅' : '❌', results.auth.message);
  console.log('Database:', results.database.success ? '✅' : '❌', results.database.message);
  
  const allSuccess = results.server.success && results.auth.success && results.database.success;
  
  if (allSuccess) {
    console.log('🎉 ¡Todas las conexiones funcionando correctamente!');
  } else {
    console.log('⚠️ Algunas conexiones tienen problemas');
  }
  
  return results;
}; 