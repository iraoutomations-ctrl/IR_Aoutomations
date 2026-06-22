-- ==========================================================================
-- autoRI-studio CRM: Supabase Database Monitor RPC Helper Functions
-- Run this script in the Supabase SQL Editor to enable database size,
-- table row count, and pg_cron job health monitoring from the CRM client.
-- ==========================================================================

-- 1. Function to retrieve total DB size and individual table statistics
CREATE OR REPLACE FUNCTION get_supabase_db_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_db_size BIGINT;
    v_tables JSONB;
BEGIN
    -- Get total size of current database
    SELECT pg_database_size(current_database()) INTO v_db_size;
    
    -- Get row counts and total physical size (table + indexes) for public tables
    SELECT json_agg(json_build_object(
        'table_name', t.table_name,
        'row_count', (
            SELECT COALESCE(n_live_tup, 0)
            FROM pg_stat_user_tables
            WHERE relname = t.table_name
            LIMIT 1
        ),
        'size_bytes', pg_total_relation_size(quote_ident(t.table_name))
    ))::JSONB INTO v_tables
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE';
      
    RETURN jsonb_build_object(
        'db_size_bytes', v_db_size,
        'tables', COALESCE(v_tables, '[]'::jsonb)
    );
END;
$$;

-- 2. Function to safely retrieve pg_cron execution history
-- Uses SECURITY DEFINER to query the restricted "cron" schema safely on behalf of client users
CREATE OR REPLACE FUNCTION get_supabase_cron_jobs_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cron_jobs JSONB;
BEGIN
    BEGIN
        SELECT json_agg(json_build_object(
            'jobid', j.jobid,
            'jobname', j.jobname,
            'schedule', j.schedule,
            'active', j.active,
            'last_run_status', (
                SELECT status 
                FROM cron.job_run_details 
                WHERE jobid = j.jobid 
                ORDER BY start_time DESC 
                LIMIT 1
            ),
            'last_run_time', (
                SELECT start_time 
                FROM cron.job_run_details 
                WHERE jobid = j.jobid 
                ORDER BY start_time DESC 
                LIMIT 1
            ),
            'last_run_message', (
                SELECT return_message 
                FROM cron.job_run_details 
                WHERE jobid = j.jobid 
                ORDER BY start_time DESC 
                LIMIT 1
            )
        ))::JSONB INTO v_cron_jobs
        FROM cron.job j;
    EXCEPTION WHEN OTHERS THEN
        -- Fallback if pg_cron is not enabled or schema is inaccessible
        v_cron_jobs := '[]'::jsonb;
    END;
    
    RETURN COALESCE(v_cron_jobs, '[]'::jsonb);
END;
$$;
