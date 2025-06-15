const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const {
    createAIRateLimiter,
    checkWarningThresholds
} = require('../middleware/aiRateLimit');
const { getPool } = require('../config/database');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

// ESP32 sensor data ingestion endpoint for irrigation logs
router.post('/esp32/irrigation-data',
    optionalAuth, // Allow both authenticated and device-key based access
    [
        body('farmId').notEmpty().withMessage('Farm ID is required'),
        body('zoneId').notEmpty().withMessage('Zone ID is required'),
        body('deviceId').notEmpty().withMessage('Device ID is required'),
        body('moistureLevel').isFloat({ min: 0, max: 100 }).withMessage('Moisture level must be between 0-100'),
        body('waterFlowRate').optional().isFloat({ min: 0 }).withMessage('Water flow rate must be positive'),
        body('durationMinutes').optional().isFloat({ min: 0 }).withMessage('Duration must be positive'),
        body('temperature').optional().isFloat().withMessage('Temperature must be numeric'),
        body('humidity').optional().isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0-100'),
        body('pumpStatus').optional().isIn(['on', 'off', 'auto']).withMessage('Invalid pump status'),
        body('valveStatus').optional().isIn(['open', 'closed', 'partial']).withMessage('Invalid valve status')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const {
                farmId,
                zoneId,
                deviceId,
                moistureLevel,
                waterFlowRate = 0,
                durationMinutes = 0,
                temperature,
                humidity,
                pumpStatus = 'auto',
                valveStatus = 'auto',
                timestamp
            } = req.body;

            // Use provided timestamp or current time
            const dataTimestamp = timestamp ? new Date(timestamp) : new Date();

            // Insert irrigation log data
            const insertQuery = `
                INSERT INTO irrigation_logs (
                    farm_id, zone_id, device_id, moisture_level, 
                    water_flow_rate, duration_minutes, temperature, 
                    humidity, pump_status, valve_status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id, created_at
            `;

            const result = await getPool().query(insertQuery, [
                farmId, zoneId, deviceId, moistureLevel,
                waterFlowRate, durationMinutes, temperature,
                humidity, pumpStatus, valveStatus, dataTimestamp
            ]);

            const logId = result.rows[0].id;

            // Clear relevant cache entries
            await cache.del(`irrigation_efficiency:${farmId}:*`);
            await cache.del(`soil_health:${farmId}:*`);
            await cache.del(`zone_performance:${farmId}:*`);

            // Log successful data ingestion
            logger.info(`ESP32 irrigation data ingested successfully`, {
                farmId,
                zoneId,
                deviceId,
                logId,
                moistureLevel,
                waterFlowRate
            });

            // Check for alerts based on moisture level
            const alerts = [];
            if (moistureLevel < 20) {
                alerts.push({
                    type: 'critical',
                    message: 'Soil moisture critically low',
                    action: 'immediate_irrigation_required'
                });
            } else if (moistureLevel < 30) {
                alerts.push({
                    type: 'warning',
                    message: 'Soil moisture low',
                    action: 'consider_irrigation'
                });
            } else if (moistureLevel > 80) {
                alerts.push({
                    type: 'info',
                    message: 'Soil moisture very high',
                    action: 'reduce_irrigation_frequency'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Irrigation data saved successfully',
                data: {
                    log_id: logId,
                    timestamp: result.rows[0].created_at,
                    alerts
                }
            });

        } catch (error) {
            logger.error('Error ingesting ESP32 irrigation data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save irrigation data'
            });
        }
    }
);

// ESP32 NPK sensor data ingestion endpoint
router.post('/esp32/npk-data',
    optionalAuth,
    [
        body('farmId').notEmpty().withMessage('Farm ID is required'),
        body('zoneId').notEmpty().withMessage('Zone ID is required'),
        body('deviceId').notEmpty().withMessage('Device ID is required'),
        body('nitrogenLevel').isFloat({ min: 0 }).withMessage('Nitrogen level must be positive'),
        body('phosphorusLevel').isFloat({ min: 0 }).withMessage('Phosphorus level must be positive'),
        body('potassiumLevel').isFloat({ min: 0 }).withMessage('Potassium level must be positive'),
        body('phLevel').isFloat({ min: 0, max: 14 }).withMessage('pH level must be between 0-14'),
        body('moistureLevel').optional().isFloat({ min: 0, max: 100 }).withMessage('Moisture level must be between 0-100'),
        body('temperature').optional().isFloat().withMessage('Temperature must be numeric'),
        body('conductivity').optional().isFloat({ min: 0 }).withMessage('Conductivity must be positive')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const {
                farmId,
                zoneId,
                deviceId,
                nitrogenLevel,
                phosphorusLevel,
                potassiumLevel,
                phLevel,
                moistureLevel,
                temperature,
                conductivity,
                timestamp
            } = req.body;

            const dataTimestamp = timestamp ? new Date(timestamp) : new Date();

            // Insert NPK reading data
            const insertQuery = `
                INSERT INTO npk_readings (
                    farm_id, zone_id, device_id, nitrogen_level, 
                    phosphorus_level, potassium_level, ph_level, 
                    moisture_level, temperature, conductivity, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id, created_at
            `;

            const result = await getPool().query(insertQuery, [
                farmId, zoneId, deviceId, nitrogenLevel,
                phosphorusLevel, potassiumLevel, phLevel,
                moistureLevel, temperature, conductivity, dataTimestamp
            ]);

            const readingId = result.rows[0].id;

            // Clear relevant cache entries
            await cache.del(`soil_health:${farmId}:*`);
            await cache.del(`crop_recommendations:${farmId}:*`);
            await cache.del(`zone_performance:${farmId}:*`);

            logger.info(`ESP32 NPK data ingested successfully`, {
                farmId,
                zoneId,
                deviceId,
                readingId,
                npk: { nitrogenLevel, phosphorusLevel, potassiumLevel },
                phLevel
            });

            // Generate soil health alerts
            const alerts = [];
            
            if (phLevel < 5.5) {
                alerts.push({
                    type: 'warning',
                    message: 'Soil pH too acidic',
                    action: 'apply_lime_to_raise_ph'
                });
            } else if (phLevel > 8.0) {
                alerts.push({
                    type: 'warning',
                    message: 'Soil pH too alkaline',
                    action: 'apply_sulfur_to_lower_ph'
                });
            }

            if (nitrogenLevel < 30) {
                alerts.push({
                    type: 'critical',
                    message: 'Nitrogen levels critically low',
                    action: 'apply_nitrogen_fertilizer'
                });
            }

            if (phosphorusLevel < 15) {
                alerts.push({
                    type: 'warning',
                    message: 'Phosphorus levels low',
                    action: 'consider_phosphorus_fertilizer'
                });
            }

            if (potassiumLevel < 80) {
                alerts.push({
                    type: 'warning',
                    message: 'Potassium levels low',
                    action: 'consider_potassium_fertilizer'
                });
            }

            res.status(201).json({
                success: true,
                message: 'NPK data saved successfully',
                data: {
                    reading_id: readingId,
                    timestamp: result.rows[0].created_at,
                    soil_health_score: calculateSimpleSoilHealthScore({
                        nitrogen_level: nitrogenLevel,
                        phosphorus_level: phosphorusLevel,
                        potassium_level: potassiumLevel,
                        ph_level: phLevel
                    }),
                    alerts
                }
            });

        } catch (error) {
            logger.error('Error ingesting ESP32 NPK data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save NPK data'
            });
        }
    }
);

// ESP32 water flow sensor data ingestion
router.post('/esp32/water-flow',
    optionalAuth,
    [
        body('farmId').notEmpty().withMessage('Farm ID is required'),
        body('zoneId').notEmpty().withMessage('Zone ID is required'),
        body('deviceId').notEmpty().withMessage('Device ID is required'),
        body('flowRate').isFloat({ min: 0 }).withMessage('Flow rate must be positive'),
        body('totalVolume').optional().isFloat({ min: 0 }).withMessage('Total volume must be positive'),
        body('pressure').optional().isFloat({ min: 0 }).withMessage('Pressure must be positive'),
        body('pumpStatus').optional().isIn(['on', 'off', 'auto']).withMessage('Invalid pump status')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const {
                farmId,
                zoneId,
                deviceId,
                flowRate,
                totalVolume = 0,
                pressure,
                pumpStatus = 'auto',
                timestamp
            } = req.body;

            const dataTimestamp = timestamp ? new Date(timestamp) : new Date();

            // Insert water flow data
            const insertQuery = `
                INSERT INTO water_flow_logs (
                    farm_id, zone_id, device_id, flow_rate, 
                    total_volume, pressure, pump_status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, created_at
            `;

            const result = await getPool().query(insertQuery, [
                farmId, zoneId, deviceId, flowRate,
                totalVolume, pressure, pumpStatus, dataTimestamp
            ]);

            const logId = result.rows[0].id;

            // Clear relevant cache entries
            await cache.del(`water_prediction:${farmId}:*`);
            await cache.del(`irrigation_efficiency:${farmId}:*`);

            logger.info(`ESP32 water flow data ingested successfully`, {
                farmId,
                zoneId,
                deviceId,
                logId,
                flowRate,
                totalVolume
            });

            // Check for flow anomalies
            const alerts = [];
            if (flowRate > 50) { // Assuming normal max flow is 50 L/min
                alerts.push({
                    type: 'warning',
                    message: 'High water flow detected',
                    action: 'check_for_leaks_or_valve_issues'
                });
            } else if (flowRate < 1 && pumpStatus === 'on') {
                alerts.push({
                    type: 'critical',
                    message: 'Low flow despite pump running',
                    action: 'check_pump_and_pipes'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Water flow data saved successfully',
                data: {
                    log_id: logId,
                    timestamp: result.rows[0].created_at,
                    alerts
                }
            });

        } catch (error) {
            logger.error('Error ingesting ESP32 water flow data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save water flow data'
            });
        }
    }
);

// Batch data ingestion for ESP32 offline sync
router.post('/esp32/batch-sync',
    optionalAuth,
    [
        body('farmId').notEmpty().withMessage('Farm ID is required'),
        body('deviceId').notEmpty().withMessage('Device ID is required'),
        body('data').isArray().withMessage('Data must be an array'),
        body('data.*.type').isIn(['irrigation', 'npk', 'water_flow']).withMessage('Invalid data type'),
        body('data.*.timestamp').isISO8601().withMessage('Invalid timestamp format'),
        body('data.*.zoneId').notEmpty().withMessage('Zone ID required for each record')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { farmId, deviceId, data } = req.body;
            const results = {
                irrigation: 0,
                npk: 0,
                water_flow: 0,
                errors: []
            };

            // Process each data record
            for (const record of data) {
                try {
                    const { type, timestamp, zoneId, ...recordData } = record;
                    const dataTimestamp = new Date(timestamp);

                    if (type === 'irrigation') {
                        const insertQuery = `
                            INSERT INTO irrigation_logs (
                                farm_id, zone_id, device_id, moisture_level, 
                                water_flow_rate, duration_minutes, temperature, 
                                humidity, pump_status, valve_status, created_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        `;

                        await getPool().query(insertQuery, [
                            farmId, zoneId, deviceId, 
                            recordData.moistureLevel || 0,
                            recordData.waterFlowRate || 0,
                            recordData.durationMinutes || 0,
                            recordData.temperature || null,
                            recordData.humidity || null,
                            recordData.pumpStatus || 'auto',
                            recordData.valveStatus || 'auto',
                            dataTimestamp
                        ]);
                        results.irrigation++;

                    } else if (type === 'npk') {
                        const insertQuery = `
                            INSERT INTO npk_readings (
                                farm_id, zone_id, device_id, nitrogen_level, 
                                phosphorus_level, potassium_level, ph_level, 
                                moisture_level, temperature, conductivity, created_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        `;

                        await getPool().query(insertQuery, [
                            farmId, zoneId, deviceId,
                            recordData.nitrogenLevel || 0,
                            recordData.phosphorusLevel || 0,
                            recordData.potassiumLevel || 0,
                            recordData.phLevel || 7.0,
                            recordData.moistureLevel || null,
                            recordData.temperature || null,
                            recordData.conductivity || null,
                            dataTimestamp
                        ]);
                        results.npk++;

                    } else if (type === 'water_flow') {
                        const insertQuery = `
                            INSERT INTO water_flow_logs (
                                farm_id, zone_id, device_id, flow_rate, 
                                total_volume, pressure, pump_status, created_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        `;

                        await getPool().query(insertQuery, [
                            farmId, zoneId, deviceId,
                            recordData.flowRate || 0,
                            recordData.totalVolume || 0,
                            recordData.pressure || null,
                            recordData.pumpStatus || 'auto',
                            dataTimestamp
                        ]);
                        results.water_flow++;
                    }

                } catch (recordError) {
                    logger.error(`Error processing batch record:`, recordError);
                    results.errors.push({
                        record,
                        error: recordError.message
                    });
                }
            }

            // Clear all related cache entries after batch processing
            await cache.del(`irrigation_efficiency:${farmId}:*`);
            await cache.del(`soil_health:${farmId}:*`);
            await cache.del(`zone_performance:${farmId}:*`);
            await cache.del(`water_prediction:${farmId}:*`);

            logger.info(`ESP32 batch sync completed`, {
                farmId,
                deviceId,
                totalRecords: data.length,
                processed: results.irrigation + results.npk + results.water_flow,
                errors: results.errors.length
            });

            res.status(201).json({
                success: true,
                message: 'Batch data sync completed',
                data: {
                    records_processed: {
                        irrigation: results.irrigation,
                        npk: results.npk,
                        water_flow: results.water_flow,
                        total: results.irrigation + results.npk + results.water_flow
                    },
                    errors: results.errors.length,
                    error_details: results.errors
                }
            });

        } catch (error) {
            logger.error('Error processing ESP32 batch sync:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process batch data sync'
            });
        }
    }
);

// ESP32 device status heartbeat
router.post('/esp32/heartbeat',
    optionalAuth,
    [
        body('farmId').notEmpty().withMessage('Farm ID is required'),
        body('deviceId').notEmpty().withMessage('Device ID is required'),
        body('status').isIn(['online', 'offline', 'maintenance']).withMessage('Invalid status'),
        body('batteryLevel').optional().isFloat({ min: 0, max: 100 }).withMessage('Battery level must be between 0-100'),
        body('signalStrength').optional().isFloat({ min: 0, max: 100 }).withMessage('Signal strength must be between 0-100'),
        body('memoryUsage').optional().isFloat({ min: 0, max: 100 }).withMessage('Memory usage must be between 0-100'),
        body('cpuTemperature').optional().isFloat().withMessage('CPU temperature must be numeric')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const {
                farmId,
                deviceId,
                status,
                batteryLevel,
                signalStrength,
                memoryUsage,
                cpuTemperature,
                firmwareVersion,
                uptime
            } = req.body;

            // Update device status in cache for quick access
            const deviceStatus = {
                farm_id: farmId,
                device_id: deviceId,
                status,
                battery_level: batteryLevel,
                signal_strength: signalStrength,
                memory_usage: memoryUsage,
                cpu_temperature: cpuTemperature,
                firmware_version: firmwareVersion,
                uptime,
                last_heartbeat: new Date().toISOString()
            };

            await cache.set(`device_status:${deviceId}`, JSON.stringify(deviceStatus), 300); // 5 min TTL

            logger.info(`ESP32 heartbeat received`, {
                farmId,
                deviceId,
                status,
                batteryLevel,
                signalStrength
            });

            // Generate device health alerts
            const alerts = [];
            if (batteryLevel && batteryLevel < 20) {
                alerts.push({
                    type: 'warning',
                    message: 'Device battery low',
                    action: 'check_solar_panel_and_battery'
                });
            }

            if (signalStrength && signalStrength < 30) {
                alerts.push({
                    type: 'warning',
                    message: 'Weak cellular signal',
                    action: 'check_antenna_and_position'
                });
            }

            if (memoryUsage && memoryUsage > 90) {
                alerts.push({
                    type: 'critical',
                    message: 'Device memory usage critical',
                    action: 'restart_device_or_contact_support'
                });
            }

            res.json({
                success: true,
                message: 'Heartbeat received',
                data: {
                    device_id: deviceId,
                    status: 'acknowledged',
                    next_heartbeat: 300, // seconds
                    alerts
                }
            });

        } catch (error) {
            logger.error('Error processing ESP32 heartbeat:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process heartbeat'
            });
        }
    }
);

// Helper function for simple soil health scoring
function calculateSimpleSoilHealthScore(data) {
    let score = 50;
    
    // pH scoring (6.0-7.0 is optimal)
    if (data.ph_level >= 6.0 && data.ph_level <= 7.0) score += 20;
    else if (data.ph_level >= 5.5 && data.ph_level <= 7.5) score += 10;
    
    // NPK balance scoring
    if (data.nitrogen_level >= 50 && data.nitrogen_level <= 200) score += 10;
    if (data.phosphorus_level >= 20 && data.phosphorus_level <= 100) score += 10;
    if (data.potassium_level >= 100 && data.potassium_level <= 300) score += 10;
    
    return Math.min(score, 100);
}

module.exports = router;
