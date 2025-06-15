-- AI Service Database Schema
-- SaharaSprout AI Service Tables

-- AI Analysis Results
CREATE TABLE IF NOT EXISTS ai_analysis (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    farm_id VARCHAR(255),
    analysis_type VARCHAR(100) NOT NULL, -- 'crop_disease', 'soil_analysis', 'market_research', etc.
    input_data JSONB NOT NULL,
    analysis_result JSONB NOT NULL,
    confidence_score DECIMAL(5,2), -- 0.00 to 100.00
    model_version VARCHAR(50),
    processing_time_ms INTEGER,
    api_cost DECIMAL(10,4), -- Track API costs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Image Analysis Results
CREATE TABLE IF NOT EXISTS image_analysis (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    farm_id VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    image_hash VARCHAR(64), -- For deduplication
    analysis_type VARCHAR(100) NOT NULL, -- 'crop_health', 'disease_detection', 'growth_stage', etc.
    detected_objects JSONB,
    health_score DECIMAL(5,2),
    recommendations JSONB,
    model_version VARCHAR(50),
    processing_time_ms INTEGER,
    api_cost DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Market Research Data
CREATE TABLE IF NOT EXISTS market_research (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    crop_type VARCHAR(100) NOT NULL,
    research_data JSONB NOT NULL,
    price_trends JSONB,
    demand_forecast JSONB,
    recommendations JSONB,
    data_sources JSONB, -- Track which APIs/sources were used
    validity_period INTERVAL DEFAULT '24 hours',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- AI Generated Content
CREATE TABLE IF NOT EXISTS ai_content (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL, -- 'description', 'marketing_copy', 'recommendations', etc.
    input_prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    metadata JSONB,
    model_used VARCHAR(100),
    token_count INTEGER,
    api_cost DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Usage Tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL, -- 'openai', 'perplexity', 'replicate', etc.
    endpoint VARCHAR(200),
    request_count INTEGER DEFAULT 1,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0.00,
    date_hour TIMESTAMP WITH TIME ZONE NOT NULL, -- Rounded to hour for aggregation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rate Limiting Tracking
CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    limit_type VARCHAR(100) NOT NULL, -- 'hourly', 'daily', 'monthly'
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cache Metadata (for cache analytics)
CREATE TABLE IF NOT EXISTS cache_metadata (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    data_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(255),
    size_bytes INTEGER,
    hit_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON ai_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON ai_analysis(created_at);

CREATE INDEX IF NOT EXISTS idx_image_analysis_user_id ON image_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analysis_hash ON image_analysis(image_hash);
CREATE INDEX IF NOT EXISTS idx_image_analysis_created_at ON image_analysis(created_at);

CREATE INDEX IF NOT EXISTS idx_market_research_crop_region ON market_research(crop_type, region);
CREATE INDEX IF NOT EXISTS idx_market_research_expires_at ON market_research(expires_at);

CREATE INDEX IF NOT EXISTS idx_ai_content_user_id ON ai_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_type ON ai_content(content_type);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_date ON api_usage(user_id, date_hour);
CREATE INDEX IF NOT EXISTS idx_api_usage_service ON api_usage(service_type);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_service ON rate_limits(user_id, service_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start, window_end);

CREATE INDEX IF NOT EXISTS idx_cache_metadata_key ON cache_metadata(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_metadata_expires ON cache_metadata(expires_at);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_ai_analysis_updated_at BEFORE UPDATE ON ai_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_analysis_updated_at BEFORE UPDATE ON image_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_content_updated_at BEFORE UPDATE ON ai_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
