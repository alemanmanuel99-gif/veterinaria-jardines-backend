-- Tabla de citas para Veterinaria Jardines
-- Ejecutar este script una sola vez en la base de datos de Hostinger
-- (phpMyAdmin -> pestaña "SQL" -> pegar y ejecutar)

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_name VARCHAR(150) NOT NULL,
  owner_phone VARCHAR(20) NOT NULL,
  pet_info VARCHAR(255) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  pref_date DATE NOT NULL,
  pref_time ENUM('manana', 'tarde', 'noche') NOT NULL,
  status ENUM('pendiente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
