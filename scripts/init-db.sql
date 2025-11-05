-- Initialize KOL Analytics Database
-- This script creates the database and initial setup

-- Create database if it doesn't exist
-- (This is handled by Docker Compose environment variables)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created by Prisma migrations, but listed here for reference

-- Full-text search indexes for future search functionality
-- CREATE INDEX idx_kol_profiles_search ON kol_profiles USING gin(to_tsvector('english', username || ' ' || COALESCE(display_name, '') || ' ' || COALESCE(bio, '')));

-- Performance optimization indexes
-- CREATE INDEX CONCURRENTLY idx_kol_performance_composite ON kol_performance(kol_id, content_type, data_freshness DESC);
-- CREATE INDEX CONCURRENTLY idx_kol_audience_freshness ON kol_audience(data_freshness DESC);

-- Insert sample data for testing (optional)
-- This would typically be done through seed scripts or the API

-- Create readonly user for analytics queries (optional)
-- CREATE USER analytics_reader WITH PASSWORD 'secure_password';
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_reader;

-- Set up row-level security policies (optional for multi-tenant)
-- ALTER TABLE kol_profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY kol_profiles_policy ON kol_profiles FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Create views for common queries (optional)
-- CREATE VIEW kol_summary AS
-- SELECT 
--   p.id,
--   p.username,
--   p.follower_count,
--   a.engagement_rate,
--   pr.base_price,
--   perf.avg_views
-- FROM kol_profiles p
-- LEFT JOIN kol_audience a ON p.id = a.kol_id
-- LEFT JOIN kol_pricing pr ON p.id = pr.kol_id AND pr.is_active = true
-- LEFT JOIN kol_performance perf ON p.id = perf.kol_id AND perf.period = '30d';

-- Create materialized views for heavy aggregations (optional)
-- CREATE MATERIALIZED VIEW kol_performance_summary AS
-- SELECT 
--   kol_id,
--   AVG(avg_views) as avg_views_30d,
--   AVG(avg_likes) as avg_likes_30d,
--   AVG(engagement_rate) as avg_engagement_rate_30d
-- FROM kol_performance 
-- WHERE period = '30d'
-- GROUP BY kol_id;

-- Create refresh function for materialized view
-- CREATE OR REPLACE FUNCTION refresh_kol_performance_summary()
-- RETURNS void AS $$
-- BEGIN
--   REFRESH MATERIALIZED VIEW CONCURRENTLY kol_performance_summary;
-- END;
-- $$ LANGUAGE plpgsql;

-- Create scheduled job using pg_cron extension (optional)
-- SELECT cron.schedule('refresh-performance-summary', '0 */6 * * *', 'SELECT refresh_kol_performance_summary();');

-- Set up database monitoring
-- Create a function to log slow queries
-- CREATE OR REPLACE FUNCTION log_slow_queries()
-- RETURNS void AS $$
-- BEGIN
--   -- This would be used with pg_stat_statements extension
--   -- to monitor and log slow queries
-- END;
-- $$ LANGUAGE plpgsql;