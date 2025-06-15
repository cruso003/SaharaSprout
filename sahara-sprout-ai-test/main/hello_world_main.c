/**
 * Sahara Sprout AI Test - Smart Irrigation System
 * ESP32-S3 with 8MB PSRAM
 * This code is designed to run on the Sahara Sprout AI board with a green adapter.
 */

#include <stdio.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_system.h"
#include "esp_mac.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"
#include "driver/gpio.h"

static const char *TAG = "IrrigationAI";

// Pin definitions for your green adapter board
#define MOISTURE_SENSOR_GPIO GPIO_NUM_1    // GPIO1 for ADC1_CHANNEL_0
#define PUMP_PIN GPIO_NUM_15
#define SOLENOID_PIN GPIO_NUM_14
#define STATUS_LED GPIO_NUM_2           // Built-in LED

// ADC configuration
#define ADC_CHANNEL ADC_CHANNEL_0
#define ADC_UNIT ADC_UNIT_1
#define ADC_ATTEN ADC_ATTEN_DB_12

// ADC handle
static adc_oneshot_unit_handle_t adc1_handle;
#define SOLENOID_PIN GPIO_NUM_14
#define STATUS_LED GPIO_NUM_2           // Built-in LED

// Irrigation parameters
#define DRY_THRESHOLD 40        // Start irrigation below 40%
#define WET_THRESHOLD 60        // Stop irrigation above 60%
#define AIR_VALUE 800           // Sensor reading in air
#define WATER_VALUE 375         // Sensor reading in water

// System state
bool is_irrigating = false;
TickType_t irrigation_start_time = 0;
TickType_t last_sensor_check = 0;

// Sensor data structure (ready for AI expansion)
typedef struct {
    float soil_moisture;
    float soil_temperature;    // Future: add temperature sensor
    float air_humidity;        // Future: add humidity sensor  
    float time_of_day;         // Current hour (0-23)
    float days_since_rain;     // Future: weather integration
    float last_irrigation_hours; // Hours since last watering
} sensor_data_t;

// AI decision structure (ready for TensorFlow Lite)
typedef struct {
    float irrigation_duration;  // Recommended minutes
    float urgency_score;        // 0.0 = no urgency, 1.0 = critical
    float confidence;           // AI confidence in decision
    bool should_irrigate;       // Final decision
} irrigation_decision_t;

// Function prototypes
int read_moisture_percentage(void);
irrigation_decision_t make_irrigation_decision(sensor_data_t* sensors);
void start_irrigation(void);
void stop_irrigation(void);
void update_status_led(void);
sensor_data_t collect_sensor_data(void);
void test_relay_module(void);

void app_main(void)
{
    ESP_LOGI(TAG, "🌱 Smart Irrigation AI System Starting");
    ESP_LOGI(TAG, "ESP32-S3 with 8MB PSRAM - TensorFlow Lite Ready!");
    
    // Initialize GPIO pins with explicit configuration
    ESP_LOGI(TAG, "Configuring GPIO pins...");
    
    // Configure pump relay pin (GPIO15)
    gpio_config_t pump_conf = {
        .pin_bit_mask = (1ULL << PUMP_PIN),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    gpio_config(&pump_conf);
    
    // Configure solenoid relay pin (GPIO14)
    gpio_config_t solenoid_conf = {
        .pin_bit_mask = (1ULL << SOLENOID_PIN),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    gpio_config(&solenoid_conf);
    
    // Configure status LED
    gpio_config_t led_conf = {
        .pin_bit_mask = (1ULL << STATUS_LED),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    gpio_config(&led_conf);
    
    // Initialize all outputs to OFF
    gpio_set_level(PUMP_PIN, 0);
    gpio_set_level(SOLENOID_PIN, 0);
    gpio_set_level(STATUS_LED, 0);
    
    ESP_LOGI(TAG, "GPIO configured - Testing relay outputs...");
    
    // Test relay outputs on startup
    ESP_LOGI(TAG, "Testing PUMP relay (GPIO%d)...", PUMP_PIN);
    gpio_set_level(PUMP_PIN, 1);
    vTaskDelay(pdMS_TO_TICKS(2000));
    gpio_set_level(PUMP_PIN, 0);
    ESP_LOGI(TAG, "PUMP relay test complete");
    
    ESP_LOGI(TAG, "Testing SOLENOID relay (GPIO%d)...", SOLENOID_PIN);
    gpio_set_level(SOLENOID_PIN, 1);
    vTaskDelay(pdMS_TO_TICKS(2000));
    gpio_set_level(SOLENOID_PIN, 0);
    ESP_LOGI(TAG, "SOLENOID relay test complete");
    
    ESP_LOGI(TAG, "Testing STATUS LED (GPIO%d)...", STATUS_LED);
    for(int i = 0; i < 5; i++) {
        gpio_set_level(STATUS_LED, 1);
        vTaskDelay(pdMS_TO_TICKS(200));
        gpio_set_level(STATUS_LED, 0);
        vTaskDelay(pdMS_TO_TICKS(200));
    }
    ESP_LOGI(TAG, "LED test complete");
    
    // Configure ADC for moisture sensor (ESP-IDF v5.4+ API)
    adc_oneshot_unit_init_cfg_t init_config1 = {
        .unit_id = ADC_UNIT,
    };
    ESP_ERROR_CHECK(adc_oneshot_new_unit(&init_config1, &adc1_handle));
    
    adc_oneshot_chan_cfg_t config = {
        .bitwidth = ADC_BITWIDTH_12,
        .atten = ADC_ATTEN,
    };
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc1_handle, ADC_CHANNEL, &config));
    
    ESP_LOGI(TAG, "⚡ POWER SUPPLY TIP: Use external 5V breadboard PSU for relay VCC");
    ESP_LOGI(TAG, "Hardware initialized - Starting irrigation monitoring");
    
    // Main irrigation control loop
    while (1) {
        // Collect all sensor data
        sensor_data_t sensors = collect_sensor_data();
        
        // Make irrigation decision (currently rule-based, will become AI)
        irrigation_decision_t decision = make_irrigation_decision(&sensors);
        
        // Log current status
        ESP_LOGI(TAG, "Moisture: %.1f%% | Decision: %s | Confidence: %.2f", 
                 sensors.soil_moisture,
                 decision.should_irrigate ? "IRRIGATE" : "WAIT",
                 decision.confidence);
        
        // Execute irrigation decision
        if (decision.should_irrigate && !is_irrigating) {
            start_irrigation();
        } else if (!decision.should_irrigate && is_irrigating) {
            stop_irrigation();
        }
        
        // Update status indicators
        update_status_led();
        
        // Wait before next check
        vTaskDelay(pdMS_TO_TICKS(5000)); // Check every 5 seconds
    }
}

sensor_data_t collect_sensor_data(void) {
    sensor_data_t sensors = {0};
    
    // Read soil moisture
    sensors.soil_moisture = read_moisture_percentage();
    
    // TODO: Add more sensors
    sensors.soil_temperature = 25.0;  // Placeholder
    sensors.air_humidity = 60.0;      // Placeholder
    
    // Calculate time of day (hours since midnight) - using system ticks
    sensors.time_of_day = (float)((xTaskGetTickCount() * portTICK_PERIOD_MS / 1000 / 3600) % 24);
    
    // Placeholder values for future expansion
    sensors.days_since_rain = 2.0;
    sensors.last_irrigation_hours = is_irrigating ? 0.0 : 1.0;
    
    return sensors;
}

int read_moisture_percentage(void) {
    int raw_value;
    ESP_ERROR_CHECK(adc_oneshot_read(adc1_handle, ADC_CHANNEL, &raw_value));
    
    // Convert raw ADC to percentage (calibrate these values for your sensor)
    int percentage = ((AIR_VALUE - raw_value) * 100) / (AIR_VALUE - WATER_VALUE);
    
    // Constrain to valid range
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    return percentage;
}

irrigation_decision_t make_irrigation_decision(sensor_data_t* sensors) {
    irrigation_decision_t decision = {0};
    
    // Current rule-based logic (will be replaced with TensorFlow Lite AI)
    if (sensors->soil_moisture < DRY_THRESHOLD) {
        decision.should_irrigate = true;
        decision.irrigation_duration = 5.0;  // 5 minutes
        decision.urgency_score = (DRY_THRESHOLD - sensors->soil_moisture) / DRY_THRESHOLD;
        decision.confidence = 0.85;
    } else if (sensors->soil_moisture > WET_THRESHOLD) {
        decision.should_irrigate = false;
        decision.irrigation_duration = 0.0;
        decision.urgency_score = 0.0;
        decision.confidence = 0.90;
    } else {
        // In between - maintain current state
        decision.should_irrigate = is_irrigating;
        decision.irrigation_duration = is_irrigating ? 2.0 : 0.0;
        decision.urgency_score = 0.3;
        decision.confidence = 0.70;
    }
    
    // TODO: Replace above logic with AI inference:
    // decision = ai_model_predict(sensors);
    
    return decision;
}

void start_irrigation(void) {
    if (is_irrigating) return;
    
    ESP_LOGI(TAG, "🚰 STARTING irrigation sequence");
    
    // Start pump first
    gpio_set_level(PUMP_PIN, 1);
    ESP_LOGI(TAG, "Pump ON - building pressure...");
    
    // Wait for pump to build pressure
    vTaskDelay(pdMS_TO_TICKS(2000));
    
    // Open solenoid valve
    gpio_set_level(SOLENOID_PIN, 1);
    ESP_LOGI(TAG, "Valve OPEN - water flowing");
    
    is_irrigating = true;
    irrigation_start_time = xTaskGetTickCount();
}

void stop_irrigation(void) {
    if (!is_irrigating) return;
    
    ESP_LOGI(TAG, "🛑 STOPPING irrigation sequence");
    
    // Close solenoid valve first
    gpio_set_level(SOLENOID_PIN, 0);
    ESP_LOGI(TAG, "Valve CLOSED - stopping water flow");
    
    // Wait for pressure to stabilize
    vTaskDelay(pdMS_TO_TICKS(1000));
    
    // Stop pump
    gpio_set_level(PUMP_PIN, 0);
    ESP_LOGI(TAG, "Pump OFF");
    
    TickType_t irrigation_duration = xTaskGetTickCount() - irrigation_start_time;
    ESP_LOGI(TAG, "Irrigation completed - Duration: %lu seconds", 
             (unsigned long)(irrigation_duration * portTICK_PERIOD_MS / 1000));
    
    is_irrigating = false;
}

void update_status_led(void) {
    // Blink pattern indicates system status
    if (is_irrigating) {
        // Fast blink when irrigating
        static bool led_state = false;
        led_state = !led_state;
        gpio_set_level(STATUS_LED, led_state);
    } else {
        // Slow pulse when monitoring
        static int counter = 0;
        counter++;
        gpio_set_level(STATUS_LED, (counter % 10) < 2);
    }
}

// Function to test relay module connectivity
void test_relay_module(void) {
    ESP_LOGI(TAG, "🔧 RELAY TROUBLESHOOTING MODE");
    ESP_LOGI(TAG, "⚠️  POWER SUPPLY ISSUE DETECTED!");
    ESP_LOGI(TAG, "Your relay module needs more current than ESP32-S3 can provide");
    ESP_LOGI(TAG, "");
    ESP_LOGI(TAG, "SOLUTION OPTIONS:");
    ESP_LOGI(TAG, "1. Use external 5V power supply for relay VCC");
    ESP_LOGI(TAG, "2. Use USB wall adapter (not computer USB)");
    ESP_LOGI(TAG, "3. Try 3.3V connection if relay supports it");
    ESP_LOGI(TAG, "");
    ESP_LOGI(TAG, "Current wiring test:");
    ESP_LOGI(TAG, "VCC -> 5V (try external 5V PSU)");
    ESP_LOGI(TAG, "GND -> GND (keep connected to ESP32-S3)");
    ESP_LOGI(TAG, "IN1 -> GPIO%d (PUMP)", PUMP_PIN);
    ESP_LOGI(TAG, "IN2 -> GPIO%d (SOLENOID)", SOLENOID_PIN);
    ESP_LOGI(TAG, "");
    
    for(int cycle = 0; cycle < 10; cycle++) {
        ESP_LOGI(TAG, "=== Test Cycle %d ===", cycle + 1);
        ESP_LOGI(TAG, "Free heap: %lu bytes", (unsigned long)esp_get_free_heap_size());
        
        // Test one relay at a time to reduce current draw
        ESP_LOGI(TAG, "PUMP relay HIGH - Check relay LED and listen for click");
        gpio_set_level(PUMP_PIN, 1);
        vTaskDelay(pdMS_TO_TICKS(5000)); // Longer delay for observation
        
        ESP_LOGI(TAG, "PUMP relay LOW");
        gpio_set_level(PUMP_PIN, 0);
        vTaskDelay(pdMS_TO_TICKS(2000));
        
        // Test second relay
        ESP_LOGI(TAG, "SOLENOID relay HIGH - Check relay LED and listen for click");
        gpio_set_level(SOLENOID_PIN, 1);
        vTaskDelay(pdMS_TO_TICKS(5000)); // Longer delay for observation
        
        ESP_LOGI(TAG, "SOLENOID relay LOW");
        gpio_set_level(SOLENOID_PIN, 0);
        vTaskDelay(pdMS_TO_TICKS(2000));
        
        // Status indicator
        gpio_set_level(STATUS_LED, 1);
        vTaskDelay(pdMS_TO_TICKS(200));
        gpio_set_level(STATUS_LED, 0);
        vTaskDelay(pdMS_TO_TICKS(3000)); // Longer pause between cycles
    }
}
