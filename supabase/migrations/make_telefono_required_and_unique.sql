-- Migración: Hacer el campo telefono obligatorio y único en la tabla socios
-- ============================================

-- Primero, debemos manejar los casos donde hay teléfonos duplicados o nulos
-- 1. Eliminar teléfonos duplicados manteniendo solo uno (el más antiguo por created_at)
DO $$
DECLARE
    dup_record RECORD;
    keep_id UUID;
BEGIN
    -- Encontrar teléfonos duplicados
    FOR dup_record IN 
        SELECT telefono
        FROM socios
        WHERE telefono IS NOT NULL AND telefono != '' AND telefono !~ '^T[0-9]'
        GROUP BY telefono
        HAVING COUNT(*) > 1
    LOOP
        -- Obtener el ID del registro más antiguo para este teléfono
        SELECT id INTO keep_id
        FROM socios
        WHERE telefono = dup_record.telefono
        ORDER BY created_at ASC, id ASC
        LIMIT 1;
        
        -- Actualizar los duplicados a NULL temporalmente (excepto el que mantenemos)
        UPDATE socios
        SET telefono = NULL
        WHERE telefono = dup_record.telefono 
        AND id != keep_id;
    END LOOP;
END $$;

-- 2. Asignar teléfonos temporales únicos a los registros sin teléfono
-- Usar el ID del socio (UUID) para generar un teléfono único que quepa en VARCHAR(20)
DO $$
DECLARE
    soc_record RECORD;
    counter INTEGER := 1;
    uuid_str TEXT;
    hash_num BIGINT;
    telefono_temp TEXT;
    i INTEGER;
    epoch_base BIGINT;
BEGIN
    -- Obtener un timestamp base para garantizar unicidad
    epoch_base := (EXTRACT(EPOCH FROM NOW())::BIGINT % 100000000);
    
    FOR soc_record IN 
        SELECT id
        FROM socios
        WHERE telefono IS NULL OR telefono = ''
        ORDER BY created_at
    LOOP
        -- Generar un hash único basado en el UUID
        uuid_str := REPLACE(soc_record.id::text, '-', '');
        hash_num := 0;
        
        -- Crear un número único usando suma de códigos ASCII del UUID
        -- Usar módulo durante el cálculo para evitar overflow de BIGINT
        FOR i IN 1..LEAST(16, LENGTH(uuid_str)) LOOP
            hash_num := ((hash_num * 31) % 99999999 + ASCII(SUBSTRING(uuid_str, i, 1))) % 99999999;
        END LOOP;
        hash_num := ABS(hash_num);
        
        -- Combinar hash del UUID con timestamp base y contador para garantizar unicidad
        hash_num := (hash_num + epoch_base + counter) % 99999999;
        
        -- Generar teléfono temporal: T + hash del UUID (8 dígitos) + contador (3 dígitos)
        -- Formato: T[hash][counter] = exactamente 12 caracteres (T + 8 + 3)
        telefono_temp := 'T' || LPAD(hash_num::text, 8, '0') || LPAD(counter::text, 3, '0');
        
        UPDATE socios
        SET telefono = telefono_temp
        WHERE id = soc_record.id;
        
        counter := counter + 1;
        
        -- Si el contador se vuelve muy grande, resetearlo (muy poco probable)
        IF counter > 999 THEN
            counter := 1;
        END IF;
    END LOOP;
END $$;

-- 3. Agregar restricción UNIQUE al campo telefono
DO $$
BEGIN
    -- Eliminar índice único existente si existe (para evitar conflictos)
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'socios' 
        AND indexname = 'socios_telefono_key'
    ) THEN
        DROP INDEX IF EXISTS socios_telefono_key;
    END IF;
    
    -- Eliminar restricción UNIQUE existente si existe
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'socios_telefono_key' 
        AND conrelid = 'socios'::regclass
    ) THEN
        ALTER TABLE socios DROP CONSTRAINT IF EXISTS socios_telefono_key;
    END IF;
    
    -- Agregar restricción UNIQUE (esto también creará un índice único automáticamente)
    ALTER TABLE socios 
    ADD CONSTRAINT socios_telefono_key UNIQUE (telefono);
END $$;

-- 4. Hacer el campo obligatorio (NOT NULL)
DO $$
BEGIN
    -- Verificar si el campo ya tiene la restricción NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'socios' 
        AND column_name = 'telefono'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE socios 
        ALTER COLUMN telefono SET NOT NULL;
    END IF;
END $$;

-- Comentario para documentación
COMMENT ON COLUMN socios.telefono IS 'Número de teléfono del socio. Campo obligatorio y único. Los teléfonos temporales (T*) deben ser reemplazados por números reales.';

