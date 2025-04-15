
    /**
     * Script de parcheo para proxy AIPI
     * Este archivo se crea automáticamente durante el despliegue
     */
    process.env.PORT = "3001";
    require('./server/index.ts');
    