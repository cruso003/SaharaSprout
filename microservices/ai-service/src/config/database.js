const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool;

const connectDatabase = async () => {
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'saharasprout_ai',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    } else {
      pool = new Pool(config);
    }

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('AI Service database connection established');
    
    // Initialize database schema
    await initializeSchema();
    
    return pool;
  } catch (error) {
    logger.error('AI Service database connection failed:', error);
    throw error;
  }
};

const initializeSchema = async () => {
  try {
    const client = await pool.connect();
    
    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    
    // Drop all tables to ensure clean state (in reverse dependency order)
    await client.query(`
      DROP TABLE IF EXISTS device_health CASCADE;
      DROP TABLE IF EXISTS soil_analysis CASCADE;
      DROP TABLE IF EXISTS farm_analytics CASCADE;
      DROP TABLE IF EXISTS language_translations CASCADE;
      DROP TABLE IF EXISTS water_flow_logs CASCADE;
      DROP TABLE IF EXISTS npk_readings CASCADE;
      DROP TABLE IF EXISTS irrigation_logs CASCADE;
      DROP TABLE IF EXISTS crop_predictions CASCADE;
      DROP TABLE IF EXISTS weather_insights CASCADE;
      DROP TABLE IF EXISTS ai_generated_content CASCADE;
      DROP TABLE IF EXISTS market_analysis CASCADE;
      DROP TABLE IF EXISTS crops CASCADE;
      DROP TABLE IF EXISTS farms CASCADE;
    `);
    
    logger.info('Existing tables dropped, creating fresh schema...');
    
    // Create base tables first (without foreign key constraints)
    
    // Create farms table
    await client.query(`
      CREATE TABLE farms (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        country VARCHAR(100),
        area_hectares DECIMAL(10,2),
        soil_type VARCHAR(100),
        climate_zone VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create crops table
    await client.query(`
      CREATE TABLE crops (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        farm_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        variety VARCHAR(255),
        planting_date DATE,
        expected_harvest_date DATE,
        growth_stage VARCHAR(100),
        area_hectares DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'active',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create market_analysis table
    await client.query(`
      CREATE TABLE market_analysis (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        farm_id UUID NOT NULL,
        crop_type VARCHAR(100) NOT NULL,
        analysis_type VARCHAR(50) NOT NULL,
        market_data JSONB NOT NULL,
        price_predictions JSONB,
        demand_forecast JSONB,
        recommendations TEXT,
        confidence_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create ai_generated_content table
    await client.query(`
      CREATE TABLE ai_generated_content (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content_type VARCHAR(50) NOT NULL,
        farm_id UUID,
        crop_id UUID,
        language_code VARCHAR(10) DEFAULT 'en',
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        tags TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create weather_insights table
    await client.query(`
      CREATE TABLE weather_insights (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        farm_id UUID NOT NULL,
        location_data JSONB NOT NULL,
        weather_data JSONB NOT NULL,
        insights JSONB NOT NULL,
        recommendations TEXT,
        risk_assessment JSONB,
        alert_level VARCHAR(20) DEFAULT 'low',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );
    `);

    // Create crop_predictions table
    await client.query(`
      CREATE TABLE crop_predictions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        farm_id UUID NOT NULL,
        crop_type VARCHAR(100) NOT NULL,
        growth_stage VARCHAR(50),
        prediction_type VARCHAR(50) NOT NULL,
        predicted_data JSONB NOT NULL,
        confidence_score DECIMAL(3,2),
        factors_considered JSONB,
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP
      );
    `);

    // Create irrigation_logs table
    await client.query(`
      CREATE TABLE irrigation_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id VARCHAR(100) NOT NULL,
        farm_id UUID NOT NULL,
        zone_id VARCHAR(50),
        moisture_level DECIMAL(5,2) NOT NULL,
        water_flow_rate DECIMAL(8,3),
        duration_minutes INTEGER,
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        pump_status VARCHAR(20),
        valve_status VARCHAR(20),
        trigger_type VARCHAR(50),
        efficiency_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create npk_readings table
    await client.query(`
      CREATE TABLE npk_readings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id VARCHAR(100) NOT NULL,
        farm_id UUID NOT NULL,
        zone_id VARCHAR(50),
        nitrogen_level DECIMAL(6,2) NOT NULL,
        phosphorus_level DECIMAL(6,2) NOT NULL,
        potassium_level DECIMAL(6,2) NOT NULL,
        ph_level DECIMAL(4,2),
        moisture_level DECIMAL(5,2),
        temperature DECIMAL(5,2),
        conductivity DECIMAL(6,3),
        recommendations JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create water_flow_logs table
    await client.query(`
      CREATE TABLE water_flow_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id VARCHAR(100) NOT NULL,
        farm_id UUID NOT NULL,
        zone_id VARCHAR(50),
        flow_rate DECIMAL(8,3) NOT NULL,
        total_volume DECIMAL(10,3),
        pressure DECIMAL(6,2),
        pump_status VARCHAR(20),
        temperature DECIMAL(5,2),
        quality_metrics JSONB,
        anomalies_detected JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create language_translations table
    await client.query(`
      CREATE TABLE language_translations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        source_language VARCHAR(10) NOT NULL,
        target_language VARCHAR(10) NOT NULL,
        source_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        context_type VARCHAR(50),
        confidence_score DECIMAL(3,2),
        cached_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create farm_analytics table
    await client.query(`
      CREATE TABLE farm_analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        farm_id UUID NOT NULL,
        analytics_type VARCHAR(50) NOT NULL,
        time_period VARCHAR(20) NOT NULL,
        data_points JSONB NOT NULL,
        insights JSONB,
        recommendations JSONB,
        performance_metrics JSONB,
        comparison_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create soil_analysis table
    await client.query(`
      CREATE TABLE soil_analysis (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        farm_id UUID NOT NULL,
        zone_id VARCHAR(50),
        analysis_type VARCHAR(50) NOT NULL,
        soil_composition JSONB NOT NULL,
        nutrient_levels JSONB NOT NULL,
        ph_analysis JSONB,
        moisture_analysis JSONB,
        recommendations JSONB,
        health_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP
      );
    `);

    // Create device_health table
    await client.query(`
      CREATE TABLE device_health (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id VARCHAR(100) NOT NULL,
        farm_id UUID NOT NULL,
        device_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        last_heartbeat TIMESTAMP,
        battery_level INTEGER,
        signal_strength INTEGER,
        error_count INTEGER DEFAULT 0,
        diagnostics JSONB,
        maintenance_needed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add foreign key constraints after all tables exist
    await client.query(`
      DO $$
      BEGIN
        -- Add foreign key for crops table
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'crops_farm_id_fkey') THEN
          ALTER TABLE crops ADD CONSTRAINT crops_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        -- Add foreign key for ai_generated_content table
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'ai_generated_content_farm_id_fkey') THEN
          ALTER TABLE ai_generated_content ADD CONSTRAINT ai_generated_content_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'ai_generated_content_crop_id_fkey') THEN
          ALTER TABLE ai_generated_content ADD CONSTRAINT ai_generated_content_crop_id_fkey 
          FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE;
        END IF;

        -- Add foreign keys for other tables
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'market_analysis_farm_id_fkey') THEN
          ALTER TABLE market_analysis ADD CONSTRAINT market_analysis_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'weather_insights_farm_id_fkey') THEN
          ALTER TABLE weather_insights ADD CONSTRAINT weather_insights_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'crop_predictions_farm_id_fkey') THEN
          ALTER TABLE crop_predictions ADD CONSTRAINT crop_predictions_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'irrigation_logs_farm_id_fkey') THEN
          ALTER TABLE irrigation_logs ADD CONSTRAINT irrigation_logs_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'npk_readings_farm_id_fkey') THEN
          ALTER TABLE npk_readings ADD CONSTRAINT npk_readings_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'water_flow_logs_farm_id_fkey') THEN
          ALTER TABLE water_flow_logs ADD CONSTRAINT water_flow_logs_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'farm_analytics_farm_id_fkey') THEN
          ALTER TABLE farm_analytics ADD CONSTRAINT farm_analytics_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'soil_analysis_farm_id_fkey') THEN
          ALTER TABLE soil_analysis ADD CONSTRAINT soil_analysis_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'device_health_farm_id_fkey') THEN
          ALTER TABLE device_health ADD CONSTRAINT device_health_farm_id_fkey 
          FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_market_analysis_farm_id ON market_analysis(farm_id);
      CREATE INDEX IF NOT EXISTS idx_market_analysis_crop_type ON market_analysis(crop_type);
      CREATE INDEX IF NOT EXISTS idx_ai_content_farm_id ON ai_generated_content(farm_id);
      CREATE INDEX IF NOT EXISTS idx_ai_content_language ON ai_generated_content(language_code);
      CREATE INDEX IF NOT EXISTS idx_weather_insights_farm_id ON weather_insights(farm_id);
      CREATE INDEX IF NOT EXISTS idx_crop_predictions_farm_id ON crop_predictions(farm_id);
      CREATE INDEX IF NOT EXISTS idx_irrigation_device_id ON irrigation_logs(device_id);
      CREATE INDEX IF NOT EXISTS idx_irrigation_farm_id ON irrigation_logs(farm_id);
      CREATE INDEX IF NOT EXISTS idx_npk_device_id ON npk_readings(device_id);
      CREATE INDEX IF NOT EXISTS idx_npk_farm_id ON npk_readings(farm_id);
      CREATE INDEX IF NOT EXISTS idx_water_flow_device_id ON water_flow_logs(device_id);
      CREATE INDEX IF NOT EXISTS idx_water_flow_farm_id ON water_flow_logs(farm_id);
      CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON crops(farm_id);
      CREATE INDEX IF NOT EXISTS idx_crops_name ON crops(name);
      CREATE INDEX IF NOT EXISTS idx_translations_source_target ON language_translations(source_language, target_language);
      CREATE INDEX IF NOT EXISTS idx_farm_analytics_farm_id ON farm_analytics(farm_id);
      CREATE INDEX IF NOT EXISTS idx_soil_analysis_farm_id ON soil_analysis(farm_id);
      CREATE INDEX IF NOT EXISTS idx_device_health_device_id ON device_health(device_id);
      CREATE INDEX IF NOT EXISTS idx_device_health_farm_id ON device_health(farm_id);
    `);

    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for tables with updated_at columns
    const tablesWithUpdatedAt = [
      'market_analysis',
      'ai_generated_content', 
      'crops',
      'device_health'
    ];

    for (const table of tablesWithUpdatedAt) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
            BEFORE UPDATE ON ${table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    client.release();
    logger.info('AI Service database schema initialized successfully');
  } catch (error) {
    logger.error('AI Service database schema initialization failed:', error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
};

const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    logger.info('AI Service database connection closed');
  }
};

module.exports = {
  connectDatabase,
  getPool,
  closeDatabase,
  get pool() {
    return pool;
  }
};
