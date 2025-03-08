// Query to define user role as enums (if it does not exists)
export const userRoleDefinitionQuery = `
    DO $$ 
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
            CREATE TYPE role_type AS ENUM ('normal', 'admin', 'moderator');
        END IF;
    END $$;
`;

// Query to create user table
export const userTableCreationQuery = `
    CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(30) UNIQUE NOT NULL,
        email VARCHAR(320) UNIQUE NOT NULL,
        password_hash VARCHAR(60) NOT NULL,
        role ROLE_TYPE NOT NULL DEFAULT 'normal',
        bio VARCHAR(200),
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;