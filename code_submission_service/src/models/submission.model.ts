// Query to define submission status as enum (if it does not exists)
export const submissionStatusDefinitionQuery = `
    DO $$ 
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_type') THEN
            CREATE TYPE status_type AS ENUM (
                'Queued', 
                'Compile Error', 
                'Runtime Error', 
                'Time Limit Error', 
                'Wrong Answer', 
                'Successful', 
                'Server Error'
            );
        END IF;
    END $$;
`;

// Query to create submission table
export const submissionTableCreationQuery = `
    CREATE TABLE IF NOT EXISTS submissions (
        submission_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        problem_id CHAR(36) NOT NULL,
        language VARCHAR(50) NOT NULL,
        status STATUS_TYPE NOT NULL DEFAULT 'Queued',
        runtime FLOAT,
        memory_used FLOAT,
        test_cases_passed INTEGER,
        total_test_cases INTEGER,
        error_message TEXT,
        submission_key TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        executed_at TIMESTAMPTZ
    );
`;