import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface DiagnosticTest {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  details?: string;
  value?: number;
}

const DeviceDiagnostics = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>([
    { id: 'connectivity', name: 'Connectivity', status: 'pending' },
    { id: 'signal', name: 'Signal Strength', status: 'pending' },
    { id: 'battery', name: 'Battery Health', status: 'pending' },
    { id: 'sensors', name: 'Sensor Status', status: 'pending' },
    { id: 'controllers', name: 'Controller Status', status: 'pending' },
    { id: 'firmware', name: 'Firmware Version', status: 'pending' },
  ]);
  
  // Signal strength history data
  const signalData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [80, 85, 75, 72, 68, 78, 82],
        color: (opacity = 1) => theme.primary,
        strokeWidth: 2,
      },
    ],
  };
  
  // System overview stats
  const systemStats = {
    onlineDevices: 5,
    totalDevices: 6,
    avgSignal: 78,
    avgBattery: 76,
    lastFullSync: '2 hours ago',
  };
  
  // Mock diagnostic results
  const mockResults = [
    { id: 'connectivity', status: 'passed', details: 'All devices connected', value: 100 },
    { id: 'signal', status: 'warning', details: 'Zone 3 has weak signal (45%)', value: 72 },
    { id: 'battery', status: 'warning', details: 'Zone 1 valve below 20%', value: 65 },
    { id: 'sensors', status: 'passed', details: 'All sensors reporting', value: 100 },
    { id: 'controllers', status: 'passed', details: 'Controller online', value: 100 },
    { id: 'firmware', status: 'failed', details: 'Update required for 2 devices', value: 40 },
  ];
  
  // Run diagnostic tests
  const runDiagnostics = () => {
    setIsRunningTests(true);
    
    // Reset tests to running state
    setDiagnosticTests(
      diagnosticTests.map(test => ({ ...test, status: 'running' }))
    );
    
    // Simulate tests running with staggered completion
    let delay = 1000;
    mockResults.forEach(result => {
          setTimeout(() => {
            setDiagnosticTests(currentTests => 
              currentTests.map(test => 
                test.id === result.id 
                  ? { ...test, status: result.status as DiagnosticTest['status'], details: result.details, value: result.value } 
                  : test
              )
            );
          }, delay);
          delay += 800; // Stagger test completions
        });
    
    // Complete all tests
    setTimeout(() => {
      setIsRunningTests(false);
    }, delay);
  };
  
  // Get status icon name
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return 'time-outline';
      case 'running': return 'sync-outline';
      case 'passed': return 'checkmark-circle';
      case 'failed': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'help-circle-outline';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return theme.textSecondary;
      case 'running': return theme.primary;
      case 'passed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'warning': return '#FF9800';
      default: return theme.textSecondary;
   }
 };
 
 // Calculate overall system health percentage
 const calculateSystemHealth = () => {
   if (diagnosticTests.every(test => test.status === 'pending' || test.status === 'running')) {
     return 0;
   }
   
   let totalScore = 0;
   let testsWithValue = 0;
   
   diagnosticTests.forEach(test => {
     if (test.value !== undefined) {
       totalScore += test.value;
       testsWithValue++;
     }
   });
   
   return testsWithValue > 0 ? Math.round(totalScore / testsWithValue) : 0;
 };
 
 // System health score
 const systemHealth = calculateSystemHealth();
 
 // Get system health color
 const getSystemHealthColor = (health: number) => {
   if (health >= 80) return '#4CAF50';
   if (health >= 60) return '#FF9800';
   return '#F44336';
 };
 
 return (
   <ThemedView style={styles.container}>
     <SafeAreaView style={styles.safeArea}>
       <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color={theme.text} />
         </TouchableOpacity>
         <ThemedText style={styles.title}>System Diagnostics</ThemedText>
         <TouchableOpacity style={styles.refreshButton}>
           <Ionicons name="refresh-outline" size={24} color={theme.text} />
         </TouchableOpacity>
       </View>
       
       <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
         <Card style={styles.systemHealthCard}>
           <View style={styles.systemHealthHeader}>
             <ThemedText style={styles.systemHealthTitle}>System Health</ThemedText>
             <View style={styles.systemHealthStatusContainer}>
               <View style={[
                 styles.systemHealthStatusDot, 
                 { backgroundColor: getSystemHealthColor(systemHealth) }
               ]}/>
               <ThemedText style={[
                 styles.systemHealthStatus, 
                 { color: getSystemHealthColor(systemHealth) }
               ]}>
                 {systemHealth >= 80 ? 'Good' : systemHealth >= 60 ? 'Fair' : 'Needs Attention'}
               </ThemedText>
             </View>
           </View>
           
           <View style={styles.healthMeterContainer}>
             <View style={styles.healthMeter}>
               <View style={[
                 styles.healthMeterFill, 
                 { 
                   width: `${systemHealth}%`,
                   backgroundColor: getSystemHealthColor(systemHealth)
                 }
               ]}/>
             </View>
             <ThemedText style={styles.healthScore}>{systemHealth}%</ThemedText>
           </View>
           
           <View style={styles.systemStatsContainer}>
             <View style={styles.systemStat}>
               <ThemedText style={styles.systemStatLabel}>Devices</ThemedText>
               <ThemedText style={styles.systemStatValue}>
                 {systemStats.onlineDevices}/{systemStats.totalDevices}
               </ThemedText>
             </View>
             <View style={styles.systemStat}>
               <ThemedText style={styles.systemStatLabel}>Signal</ThemedText>
               <ThemedText style={styles.systemStatValue}>{systemStats.avgSignal}%</ThemedText>
             </View>
             <View style={styles.systemStat}>
               <ThemedText style={styles.systemStatLabel}>Battery</ThemedText>
               <ThemedText style={styles.systemStatValue}>{systemStats.avgBattery}%</ThemedText>
             </View>
           </View>
           
           <TouchableOpacity 
             style={[
               styles.runDiagnosticsButton, 
               isRunningTests && { opacity: 0.7 }
             ]}
             onPress={runDiagnostics}
             disabled={isRunningTests}
           >
             <Ionicons 
               name={isRunningTests ? "sync" : "pulse"} 
               size={20} 
               color="#fff" 
             />
             <ThemedText style={styles.runDiagnosticsText}>
               {isRunningTests ? 'Running Diagnostics...' : 'Run Diagnostics'}
             </ThemedText>
           </TouchableOpacity>
         </Card>
         
         <View style={styles.sectionHeader}>
           <ThemedText style={styles.sectionTitle}>Diagnostic Results</ThemedText>
           <ThemedText style={styles.lastRunText}>
             Last run: {isRunningTests ? 'Running now...' : systemHealth > 0 ? 'Just now' : 'Never'}
           </ThemedText>
         </View>
         
         {diagnosticTests.map((test) => (
           <Card key={test.id} style={styles.testCard}>
             <View style={styles.testHeader}>
               <View style={styles.testTitleContainer}>
                 <ThemedText style={styles.testTitle}>{test.name}</ThemedText>
                 {test.status === 'running' && (
                   <ActivityIndicator 
                     size="small" 
                     color={theme.primary} 
                     style={styles.runningIndicator} 
                   />
                 )}
               </View>
               <Ionicons 
                 name={getStatusIcon(test.status)} 
                 size={24} 
                 color={getStatusColor(test.status)} 
               />
             </View>
             
             {test.details && test.status !== 'pending' && (
               <ThemedText style={[
                 styles.testDetails,
                 { color: getStatusColor(test.status) }
               ]}>
                 {test.details}
               </ThemedText>
             )}
             
             {test.value !== undefined && test.status !== 'pending' && (
               <View style={styles.testValueContainer}>
                 <View style={styles.testValueMeter}>
                   <View style={[
                     styles.testValueFill,
                     { 
                       width: `${test.value}%`,
                       backgroundColor: getStatusColor(test.status)
                     }
                   ]}/>
                 </View>
                 <ThemedText style={styles.testValueText}>{test.value}%</ThemedText>
               </View>
             )}
           </Card>
         ))}
         
         <View style={styles.sectionHeader}>
           <ThemedText style={styles.sectionTitle}>Signal Strength Trends</ThemedText>
         </View>
         
         <Card style={styles.chartCard}>
           <LineChart
             data={signalData}
             width={width - 64}
             height={220}
             chartConfig={{
               backgroundColor: theme.cardBackground,
               backgroundGradientFrom: theme.cardBackground,
               backgroundGradientTo: theme.cardBackground,
               decimalPlaces: 0,
               color: (opacity = 1) => theme.primary,
               labelColor: (opacity = 1) => theme.text,
               propsForDots: {
                 r: "5",
                 strokeWidth: "2",
                 stroke: theme.primary
               },
               propsForLabels: {
                 fontSize: 12,
               },
             }}
             bezier
             style={styles.chart}
             yAxisSuffix="%"
           />
           
           <View style={styles.chartDescription}>
             <ThemedText style={styles.chartDescriptionText}>
               Signal strength has been stable over the past week. The average signal strength is {systemStats.avgSignal}%.
             </ThemedText>
           </View>
         </Card>
         
         <View style={styles.sectionHeader}>
           <ThemedText style={styles.sectionTitle}>Troubleshooting</ThemedText>
         </View>
         
         <View style={styles.troubleshootingContainer}>
           <TouchableOpacity style={styles.troubleshootButton}>
             <Ionicons name="sync" size={20} color={theme.primary} />
             <ThemedText style={styles.troubleshootButtonText}>Force Resync All Devices</ThemedText>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.troubleshootButton}>
             <Ionicons name="refresh-circle" size={20} color={theme.primary} />
             <ThemedText style={styles.troubleshootButtonText}>Restart Controller</ThemedText>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.troubleshootButton}>
             <Ionicons name="cloud-upload" size={20} color={theme.primary} />
             <ThemedText style={styles.troubleshootButtonText}>Update Firmware</ThemedText>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.troubleshootButton}>
             <Ionicons name="construct" size={20} color={theme.primary} />
             <ThemedText style={styles.troubleshootButtonText}>Advanced Diagnostics</ThemedText>
           </TouchableOpacity>
         </View>
         
         <TouchableOpacity style={styles.supportButton}>
           <Ionicons name="help-circle" size={20} color="#fff" />
           <ThemedText style={styles.supportButtonText}>Contact Support</ThemedText>
         </TouchableOpacity>
       </ScrollView>
     </SafeAreaView>
   </ThemedView>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
 },
 safeArea: {
   flex: 1,
 },
 header: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   paddingHorizontal: 16,
   paddingVertical: 12,
   borderBottomWidth: 1,
   borderBottomColor: 'rgba(0,0,0,0.05)',
 },
 backButton: {
   padding: 4,
 },
 title: {
   fontSize: 20,
   fontWeight: 'bold',
 },
 refreshButton: {
   padding: 4,
 },
 content: {
   padding: 16,
   paddingBottom: 40,
 },
 systemHealthCard: {
   borderRadius: 12,
   padding: 16,
   marginBottom: 24,
 },
 systemHealthHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 16,
 },
 systemHealthTitle: {
   fontSize: 18,
   fontWeight: 'bold',
 },
 systemHealthStatusContainer: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 systemHealthStatusDot: {
   width: 8,
   height: 8,
   borderRadius: 4,
   marginRight: 6,
 },
 systemHealthStatus: {
   fontSize: 14,
   fontWeight: '600',
 },
 healthMeterContainer: {
   marginBottom: 16,
 },
 healthMeter: {
   height: 16,
   backgroundColor: 'rgba(0,0,0,0.1)',
   borderRadius: 8,
   marginBottom: 8,
   overflow: 'hidden',
 },
 healthMeterFill: {
   height: '100%',
   borderRadius: 8,
 },
 healthScore: {
   textAlign: 'center',
   fontSize: 16,
   fontWeight: 'bold',
 },
 systemStatsContainer: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   marginBottom: 16,
 },
 systemStat: {
   alignItems: 'center',
 },
 systemStatLabel: {
   fontSize: 12,
   opacity: 0.7,
   marginBottom: 4,
 },
 systemStatValue: {
   fontSize: 16,
   fontWeight: '600',
 },
 runDiagnosticsButton: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   backgroundColor: Colors.light.primary,
   paddingVertical: 10,
   borderRadius: 20,
 },
 runDiagnosticsText: {
   color: '#fff',
   fontWeight: '600',
   marginLeft: 8,
 },
 sectionHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 12,
 },
 sectionTitle: {
   fontSize: 16,
   fontWeight: '600',
 },
 lastRunText: {
   fontSize: 12,
   opacity: 0.7,
 },
 testCard: {
   borderRadius: 12,
   padding: 16,
   marginBottom: 12,
 },
 testHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 testTitleContainer: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 testTitle: {
   fontSize: 16,
   fontWeight: '500',
 },
 runningIndicator: {
   marginLeft: 8,
 },
 testDetails: {
   fontSize: 14,
   marginTop: 8,
 },
 testValueContainer: {
   marginTop: 8,
 },
 testValueMeter: {
   height: 8,
   backgroundColor: 'rgba(0,0,0,0.1)',
   borderRadius: 4,
   overflow: 'hidden',
   marginBottom: 4,
 },
 testValueFill: {
   height: '100%',
   borderRadius: 4,
 },
 testValueText: {
   fontSize: 12,
   textAlign: 'right',
 },
 chartCard: {
   borderRadius: 12,
   padding: 16,
   marginBottom: 24,
 },
 chart: {
   marginVertical: 8,
   borderRadius: 16,
 },
 chartDescription: {
   marginTop: 8,
 },
 chartDescriptionText: {
   fontSize: 14,
   opacity: 0.8,
 },
 troubleshootingContainer: {
   marginBottom: 24,
 },
 troubleshootButton: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: 'rgba(0,0,0,0.03)',
   paddingVertical: 12,
   paddingHorizontal: 16,
   borderRadius: 8,
   marginBottom: 8,
 },
 troubleshootButtonText: {
   marginLeft: 12,
   fontSize: 14,
   fontWeight: '500',
 },
 supportButton: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   backgroundColor: Colors.light.primary,
   paddingVertical: 12,
   borderRadius: 24,
   marginBottom: 24,
 },
 supportButtonText: {
   color: '#fff',
   fontWeight: '600',
   marginLeft: 8,
 },
});

export default DeviceDiagnostics;
