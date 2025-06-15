// services/sim800Service.js
const admin = require('./firebaseService');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

class SIM800LService {
  constructor() {
    this.port = null;
    this.parser = null;
    this.isInitialized = false;
    this.commandQueue = [];
    this.isProcessingCommand = false;
    this.responseBuffer = '';
    this.currentCommand = null;
    this.commandTimeout = null;
  }

  /**
   * Initialize the SIM800L module
   * @param {string} portPath - Serial port path (e.g., '/dev/ttyS0')
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize(portPath) {
    try {
      if (this.isInitialized) {
        console.log('SIM800L already initialized');
        return true;
      }

      console.log(`Initializing SIM800L on port ${portPath}`);
      
      this.port = new SerialPort(portPath, {
        baudRate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
      });
      
      this.parser = this.port.pipe(new Readline({ delimiter: '\r\n' }));
      
      // Set up event handlers
      this.port.on('error', (err) => {
        console.error('SIM800L port error:', err);
      });
      
      this.parser.on('data', (data) => {
        this.handleResponse(data);
      });
      
      // Wait for port to open
      await new Promise((resolve, reject) => {
        this.port.on('open', resolve);
        this.port.on('error', reject);
      });
      
      // Initialize modem
      await this.executeCommand('AT', 1000);
      await this.executeCommand('AT+CMGF=1', 1000); // Set SMS mode to text
      
      this.isInitialized = true;
      console.log('SIM800L initialized successfully');
      
      // Start listening for incoming SMS
      this.startSMSListener();
      
      return true;
    } catch (error) {
      console.error('Error initializing SIM800L:', error);
      return false;
    }
  }
  
  /**
   * Execute AT command on SIM800L
   * @param {string} command - AT command to execute
   * @param {number} timeout - Command timeout in milliseconds
   * @returns {Promise<string>} - Command response
   */
  executeCommand(command, timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized) {
        reject(new Error('SIM800L not initialized'));
        return;
      }
      
      console.log(`Executing command: ${command}`);
      this.responseBuffer = '';
      
      // Send command to modem
      this.port.write(`${command}\r\n`, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Set timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          reject(new Error(`Command timeout: ${command}`));
        }, timeout);
        
        // Function to check if response is complete
        const checkResponse = () => {
          if (this.responseBuffer.includes('OK') || 
              this.responseBuffer.includes('ERROR') ||
              this.responseBuffer.includes('FAILED')) {
            clearTimeout(timeoutId);
            resolve(this.responseBuffer);
          } else {
            setTimeout(checkResponse, 100);
          }
        };
        
        checkResponse();
      });
    });
  }
  
  /**
   * Handle responses from SIM800L
   * @param {string} data - Data received from SIM800L
   */
  handleResponse(data) {
    console.log(`SIM800L response: ${data}`);
    this.responseBuffer += data + '\r\n';
    
    // Check for incoming SMS notification
    if (data.includes('+CMTI:')) {
      const match = data.match(/\+CMTI: "(.+)",(\d+)/);
      if (match && match[2]) {
        const messageIndex = match[2];
        this.readSMS(messageIndex);
      }
    }
  }
  
  /**
   * Start listening for incoming SMS
   */
  async startSMSListener() {
    try {
      await this.executeCommand('AT+CNMI=2,1,0,0,0', 2000);
      console.log('SMS listener started');
    } catch (error) {
      console.error('Error starting SMS listener:', error);
    }
  }
  
  /**
   * Read SMS message at given index
   * @param {string|number} index - SMS index in SIM memory
   */
  async readSMS(index) {
    try {
      const response = await this.executeCommand(`AT+CMGR=${index}`, 5000);
      
      // Parse sender and message content
      const lines = response.split('\r\n');
      if (lines.length >= 2) {
        const headerLine = lines[0];
        const messageLine = lines[1];
        
        // Extract sender phone number
        const headerMatch = headerLine.match(/\+CMGR:.+,"(.+)"/);
        if (headerMatch && headerMatch[1]) {
          const senderPhone = headerMatch[1];
          
          // Process the incoming message
          await this.processIncomingSMS(senderPhone, messageLine);
          
          // Delete the message to free up space
          await this.executeCommand(`AT+CMGD=${index}`, 2000);
        }
      }
    } catch (error) {
      console.error(`Error reading SMS at index ${index}:`, error);
    }
  }
  
  /**
   * Send an SMS message
   * @param {string} phoneNumber - The recipient phone number
   * @param {string} message - The SMS message content
   * @returns {Promise<boolean>} - Whether message was sent successfully
   */
  async sendSMS(phoneNumber, message) {
    try {
      if (!this.isInitialized) {
        throw new Error('SIM800L not initialized');
      }
      
      console.log(`Sending SMS to ${phoneNumber}: ${message}`);
      
      // Set SMS mode to text
      await this.executeCommand('AT+CMGF=1', 1000);
      
      // Set recipient phone number
      const setNumberResponse = await this.executeCommand(`AT+CMGS="${phoneNumber}"`, 5000);
      
      // Send message content and send Ctrl+Z
      const sendMessageResponse = await new Promise((resolve, reject) => {
        this.port.write(`${message}${String.fromCharCode(26)}`, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Wait for response (can take a while)
          setTimeout(() => {
            resolve(this.responseBuffer);
          }, 5000);
        });
      });
      
      // Check if message was sent successfully
      const success = sendMessageResponse.includes('+CMGS:');
      
      // Save to Firebase for tracking
      const smsRef = admin.firestore().collection('outboundSMS').doc();
      await smsRef.set({
        phoneNumber,
        message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: success ? 'sent' : 'failed'
      });
      
      return success;
    } catch (error) {
      console.error('Error sending SMS:', error);
      
      // Log the failure
      const smsRef = admin.firestore().collection('outboundSMS').doc();
      await smsRef.set({
        phoneNumber,
        message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'failed',
        error: error.message
      });
      
      return false;
    }
  }
  
  /**
   * Process incoming SMS messages
   * @param {string} senderPhone - The sender's phone number
   * @param {string} messageText - The message content
   * @returns {Promise<void>}
   */
  async processIncomingSMS(senderPhone, messageText) {
    try {
      console.log(`Processing SMS from ${senderPhone}: ${messageText}`);
      
      // Save the incoming message
      const inboundRef = admin.firestore().collection('inboundSMS').doc();
      await inboundRef.set({
        senderPhone,
        message: messageText,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        processed: false
      });
      
      // Find the associated device for this sender
      const devicesSnapshot = await admin.firestore()
        .collection('devices')
        .where('authorizedNumbers', 'array-contains', senderPhone)
        .limit(1)
        .get();
      
      if (devicesSnapshot.empty) {
        console.log(`No device found for phone number: ${senderPhone}`);
        // Optionally send a response indicating unauthorized access
        await this.sendSMS(senderPhone, 'Unauthorized access: Your number is not registered with any device.');
        return;
      }
      
      let deviceId;
      let deviceData;
      devicesSnapshot.forEach(doc => {
        deviceId = doc.id;
        deviceData = doc.data();
      });
      
      // Create command record
      const commandRef = admin.firestore()
        .collection('devices')
        .doc(deviceId)
        .collection('smsCommands')
        .doc();
        
      await commandRef.set({
        command: messageText,
        senderPhone,
        processed: false,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        processedAt: null,
        result: null
      });
      
      // Mark inbound message as processed
      await inboundRef.update({
        processed: true,
        deviceId,
        commandId: commandRef.id
      });
      
      // Process the command
      // Import this from a shared module that both routes can use
      const commandProcessor = require('./commandProcessor');
      const result = await commandProcessor.processCommand(deviceId, messageText);
      
      // Update command status
      await commandRef.update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        result: result.status
      });
      
      // Create response record
      const responseRef = admin.firestore()
        .collection('devices')
        .doc(deviceId)
        .collection('smsResponses')
        .doc();
        
      await responseRef.set({
        commandId: commandRef.id,
        message: result.message,
        recipientPhone: senderPhone,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        deliveryStatus: 'pending'
      });
      
      // Send response SMS
      const sent = await this.sendSMS(senderPhone, result.message);
      
      // Update delivery status
      await responseRef.update({
        deliveryStatus: sent ? 'sent' : 'failed'
      });
      
    } catch (error) {
      console.error('Error processing incoming SMS:', error);
      throw error;
    }
  }
  
  /**
   * Close the connection to SIM800L
   */
  async close() {
    if (this.port && this.port.isOpen) {
      this.port.close();
      this.isInitialized = false;
      console.log('SIM800L connection closed');
    }
  }
}

// Create singleton instance
const sim800l = new SIM800LService();

module.exports = sim800l;
