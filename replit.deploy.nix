# Este archivo es una configuración específica para despliegues en Replit
{ pkgs, ... }: {
  targets.none.packages = [
    (pkgs.writeScriptBin "startApp" ''
      #!/bin/sh
      echo "🚀 Iniciando la aplicación AIPI en modo producción"
      cd "$REPL_HOME"
      
      # Verificar si la aplicación necesita ser compilada
      if [ ! -d "dist/client" ]; then
        echo "📦 Compilando la aplicación..."
        npm run build
      fi
      
      # Iniciar la aplicación
      NODE_ENV=production node dist/index.js
    '')
  ];
  
  # Configuración del entorno
  env.PORT = "3000"; # Puerto para producción
  env.NODE_ENV = "production";
  
  # Configuraciones para mejorar el despliegue
  processes.startApp.exec = "startApp";
  
  # Configuración del servidor HTTP
  http.enable = true;
  http.port = 3000;
  http.root = "public";
  http.notFound = {
    root = "public";
    path = "redirect-handler.html";
  };
}