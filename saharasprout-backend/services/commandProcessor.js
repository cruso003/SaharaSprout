// services/commandProcessor.js
const admin = require('./firebaseService');

/**
 * Process device commands
 * @param {string} deviceId - The device ID
 * @param {string} commandText - The command text
 * @returns {Promise<{status: string, message: string}>} - Command result
 */
async function processCommand(deviceId, commandText) {
  try {
    const deviceRef = admin.firestore().collection('devices').doc(deviceId);
    
    // Parse the command
    const commandParts = commandText.trim().toUpperCase().split(' ');
    const command = commandParts[0];
    
    switch (command) {
      case 'STATUS':
        // Get current device status
        const deviceDoc = await deviceRef.get();
        if (!deviceDoc.exists) {
          return { 
            status: 'error', 
            message: 'Device not found' 
          };
        }
        
        const deviceData = deviceDoc.data();
        const moistureValue = deviceData.subDevices?.moistureSensor?.lastReading || 'Unknown';
        const pumpStatus = deviceData.subDevices?.pump?.status || 'Unknown';
        const flowRate = deviceData.waterFlow?.lastFlowRate || 'N/A';
        const totalWater = deviceData.waterFlow?.lastTotalVolume || 'N/A';
        
        return {
          status: 'success',
          message: `Device: ${deviceData.name}\nMode: ${deviceData.mode || 'Unknown'}\nMoisture: ${moistureValue}%\nPump: ${pumpStatus}\nFlow: ${flowRate}L/min\nTotal: ${totalWater}L`
        };
        
      case 'ON':
        // Turn irrigation on
        await deviceRef.update({
          'subDevices.pump.status': 'active',
          'subDevices.pump.lastUpdate': admin.firestore.FieldValue.serverTimestamp(),
          isIrrigating: true
        });
        
        return {
          status: 'success',
          message: 'Irrigation turned ON'
        };
        
      case 'OFF':
        // Turn irrigation off
        await deviceRef.update({
          'subDevices.pump.status': 'inactive',
          'subDevices.pump.lastUpdate': admin.firestore.FieldValue.serverTimestamp(),
          isIrrigating: false
        });
        
        return {
          status: 'success',
          message: 'Irrigation turned OFF'
        };
        
      case 'AUTO':
        // Enable automatic mode
        await deviceRef.update({
          mode: 'auto',
          lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return {
          status: 'success',
          message: 'Automatic mode enabled'
        };
        
      case 'MANUAL':
        // Enable manual mode
        await deviceRef.update({
          mode: 'manual',
          lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return {
          status: 'success',
          message: 'Manual mode enabled'
        };
        
      case 'SET':
        // Set moisture threshold
        if (commandParts.length < 2 || isNaN(commandParts[1])) {
          return {
            status: 'error',
            message: 'Invalid threshold value. Usage: SET [1-100]'
          };
        }
        
        const threshold = parseInt(commandParts[1]);
        if (threshold < 1 || threshold > 100) {
          return {
            status: 'error',
            message: 'Threshold must be between 1 and 100'
          };
        }
        
        await deviceRef.update({
          moistureThreshold: threshold,
          lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return {
          status: 'success',
          message: `Moisture threshold set to ${threshold}%`
        };
        
      case 'WATER':
        // Run irrigation for specified minutes
        if (commandParts.length < 2 || isNaN(commandParts[1])) {
          return {
            status: 'error',
            message: 'Invalid duration. Usage: WATER [minutes]'
          };
        }
        
        const minutes = parseInt(commandParts[1]);
        if (minutes < 1 || minutes > 60) {
          return {
            status: 'error',
            message: 'Duration must be between 1 and 60 minutes'
          };
        }
        
        // Start irrigation
        await deviceRef.update({
          'subDevices.pump.status': 'active',
          'subDevices.pump.lastUpdate': admin.firestore.FieldValue.serverTimestamp(),
          isIrrigating: true,
          irrigationEndTime: admin.firestore.Timestamp.fromMillis(Date.now() + (minutes * 60 * 1000))
        });
        
        // In production, we would use Firebase Cloud Functions to schedule turning off the pump
        // For simplicity, we'll just return a message
        return {
          status: 'success',
          message: `Irrigation started for ${minutes} minutes`
        };
        
      case 'SENSORS':
        // Get sensors status
        const sensorsDoc = await deviceRef.get();
        if (!sensorsDoc.exists) {
          return { 
            status: 'error', 
            message: 'Device not found' 
          };
        }
        
        const sensorsData = sensorsDoc.data();
        const moisture = sensorsData.subDevices?.moistureSensor?.lastReading || 'Unknown';
        const waterFlow = sensorsData.waterFlow?.lastFlowRate || 'N/A';
        
        return {
          status: 'success',
          message: `Sensors:\nMoisture: ${moisture}%\nWater Flow: ${waterFlow}L/min`
        };
        
      case 'FLOW':
        // Get water usage data
        const waterDoc = await deviceRef.get();
        if (!waterDoc.exists) {
          return { 
            status: 'error', 
            message: 'Device not found' 
          };
        }
        
        const waterData = waterDoc.data();
        const currentFlow = waterData.waterFlow?.lastFlowRate || 'N/A';
        const totalUsage = waterData.waterFlow?.lastTotalVolume || 'N/A';
        
        return {
          status: 'success',
          message: `Water Usage:\nCurrent Flow: ${currentFlow}L/min\nTotal Volume: ${totalUsage}L`
        };
        
      case 'HELP':
        return {
          status: 'success',
          message: 'Available commands:\nSTATUS - System status\nON - Start irrigation\nOFF - Stop irrigation\nAUTO - Enable auto mode\nMANUAL - Enable manual mode\nSET [1-100] - Set moisture threshold\nWATER [1-60] - Run for minutes\nSENSORS - Sensor readings\nFLOW - Water usage data\nHELP - Show commands'
        };
        
      default:
        return {
          status: 'error',
          message: 'Unknown command. Send HELP for available commands.'
        };
    }
  } catch (error) {
    console.error('Error processing command:', error);
    return {
      status: 'error',
      message: 'Error processing command. Please try again.'
    };
  }
}

module.exports = {
  processCommand
};
