-- Script de inicialización de PostgreSQL
-- Se ejecuta automáticamente al crear el contenedor por primera vez

-- Crear extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar timezone
SET timezone = 'America/La_Paz';

-- Nota: Las tablas se crean automáticamente vía Prisma Migrate
-- Este script es para configuraciones adicionales o datos iniciales

-- Comentario: Aquí podrías agregar configuraciones específicas de la BD
-- que no se manejan desde Prisma
