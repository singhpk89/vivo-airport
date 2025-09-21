# Data Sync Examples

## Offline-First Architecture

### React Native Offline Sync Service
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import APIService from './APIService';

interface PendingActivity {
  id: string; // Local ID
  data: CreateActivityRequest;
  timestamp: number;
  retryCount: number;
}

interface SyncStatus {
  lastSyncTime: number;
  pendingCount: number;
  isOnline: boolean;
}

class SyncService {
  private static instance: SyncService;
  private pendingActivities: PendingActivity[] = [];
  private isOnline = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeNetworkListener();
    this.loadPendingActivities();
    this.startPeriodicSync();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected || false;
      if (this.isOnline) {
        this.syncPendingActivities();
      }
    });
  }

  private async loadPendingActivities(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('pending_activities');
      if (stored) {
        this.pendingActivities = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load pending activities:', error);
    }
  }

  private async savePendingActivities(): Promise<void> {
    try {
      await AsyncStorage.setItem('pending_activities', JSON.stringify(this.pendingActivities));
    } catch (error) {
      console.error('Failed to save pending activities:', error);
    }
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingActivities();
      }
    }, 5 * 60 * 1000);
  }

  // Add activity to pending queue for offline creation
  async createActivityOffline(data: CreateActivityRequest): Promise<string> {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pendingActivity: PendingActivity = {
      id: localId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.pendingActivities.push(pendingActivity);
    await this.savePendingActivities();

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncSingleActivity(pendingActivity);
    }

    return localId;
  }

  // Sync all pending activities
  async syncPendingActivities(): Promise<void> {
    if (!this.isOnline || this.pendingActivities.length === 0) {
      return;
    }

    const activitiesToSync = [...this.pendingActivities];
    
    for (const activity of activitiesToSync) {
      await this.syncSingleActivity(activity);
    }
  }

  private async syncSingleActivity(activity: PendingActivity): Promise<void> {
    try {
      const response = await APIService.createActivity(activity.data);
      
      if (response.success) {
        // Remove from pending list
        this.pendingActivities = this.pendingActivities.filter(a => a.id !== activity.id);
        await this.savePendingActivities();
        
        console.log(`Successfully synced activity ${activity.id}`);
      } else {
        throw new Error(response.message || 'Sync failed');
      }
    } catch (error) {
      console.error(`Failed to sync activity ${activity.id}:`, error);
      
      // Increment retry count
      const activityIndex = this.pendingActivities.findIndex(a => a.id === activity.id);
      if (activityIndex !== -1) {
        this.pendingActivities[activityIndex].retryCount++;
        
        // Remove after 5 failed attempts
        if (this.pendingActivities[activityIndex].retryCount >= 5) {
          console.error(`Removing activity ${activity.id} after 5 failed attempts`);
          this.pendingActivities.splice(activityIndex, 1);
        }
        
        await this.savePendingActivities();
      }
    }
  }

  // Get sync status for UI display
  async getSyncStatus(): Promise<SyncStatus> {
    return {
      lastSyncTime: await this.getLastSyncTime(),
      pendingCount: this.pendingActivities.length,
      isOnline: this.isOnline,
    };
  }

  private async getLastSyncTime(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem('last_sync_time');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  private async setLastSyncTime(time: number): Promise<void> {
    try {
      await AsyncStorage.setItem('last_sync_time', time.toString());
    } catch (error) {
      console.error('Failed to save last sync time:', error);
    }
  }

  // Force sync all data from server
  async fullSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    try {
      // Sync pending activities first
      await this.syncPendingActivities();
      
      // Then pull latest data from server
      const activities = await APIService.getActivities();
      const routePlans = await APIService.getRoutePlans();
      
      // Cache the data locally
      await AsyncStorage.setItem('cached_activities', JSON.stringify(activities.data));
      await AsyncStorage.setItem('cached_route_plans', JSON.stringify(routePlans.data));
      
      await this.setLastSyncTime(Date.now());
      
      console.log('Full sync completed successfully');
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }

  // Get cached data for offline viewing
  async getCachedActivities(): Promise<any[]> {
    try {
      const cached = await AsyncStorage.getItem('cached_activities');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  async getCachedRoutePlans(): Promise<any[]> {
    try {
      const cached = await AsyncStorage.getItem('cached_route_plans');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  // Cleanup method
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export default SyncService;
```

### React Native Sync UI Component
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import SyncService from '../services/SyncService';

interface SyncStatus {
  lastSyncTime: number;
  pendingCount: number;
  isOnline: boolean;
}

const SyncStatusComponent: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: 0,
    pendingCount: 0,
    isOnline: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const syncService = SyncService.getInstance();

  useEffect(() => {
    loadSyncStatus();
    const interval = setInterval(loadSyncStatus, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    const status = await syncService.getSyncStatus();
    setSyncStatus(status);
  };

  const handleForceSync = async () => {
    if (!syncStatus.isOnline) {
      Alert.alert('Offline', 'Please check your internet connection');
      return;
    }

    setIsLoading(true);
    try {
      await syncService.fullSync();
      await loadSyncStatus();
      Alert.alert('Success', 'Data synchronized successfully');
    } catch (error) {
      Alert.alert('Sync Failed', error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSync = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={{
      backgroundColor: syncStatus.isOnline ? '#d4edda' : '#f8d7da',
      padding: 12,
      margin: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: syncStatus.isOnline ? '#c3e6cb' : '#f5c6cb',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontWeight: 'bold', color: syncStatus.isOnline ? '#155724' : '#721c24' }}>
            {syncStatus.isOnline ? '🟢 Online' : '🔴 Offline'}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            Last sync: {formatLastSync(syncStatus.lastSyncTime)}
          </Text>
          {syncStatus.pendingCount > 0 && (
            <Text style={{ fontSize: 12, color: '#856404', marginTop: 2 }}>
              {syncStatus.pendingCount} pending upload{syncStatus.pendingCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={{
            backgroundColor: syncStatus.isOnline ? '#007bff' : '#6c757d',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
            opacity: isLoading ? 0.6 : 1,
          }}
          onPress={handleForceSync}
          disabled={!syncStatus.isOnline || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              SYNC
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SyncStatusComponent;
```

### Flutter Offline Sync Service
```dart
import 'dart:convert';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import 'api_service.dart';

class PendingActivity {
  final String id;
  final Map<String, dynamic> data;
  final int timestamp;
  int retryCount;

  PendingActivity({
    required this.id,
    required this.data,
    required this.timestamp,
    this.retryCount = 0,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'data': data,
    'timestamp': timestamp,
    'retryCount': retryCount,
  };

  factory PendingActivity.fromJson(Map<String, dynamic> json) => PendingActivity(
    id: json['id'],
    data: json['data'],
    timestamp: json['timestamp'],
    retryCount: json['retryCount'] ?? 0,
  );
}

class SyncService {
  static SyncService? _instance;
  static SyncService get instance => _instance ??= SyncService._();
  
  SyncService._();

  final APIService _apiService = APIService();
  final Connectivity _connectivity = Connectivity();
  
  List<PendingActivity> _pendingActivities = [];
  bool _isOnline = false;
  
  Future<void> initialize() async {
    await _loadPendingActivities();
    _startConnectivityListener();
    _startPeriodicSync();
  }

  void _startConnectivityListener() {
    _connectivity.onConnectivityChanged.listen((ConnectivityResult result) {
      _isOnline = result != ConnectivityResult.none;
      if (_isOnline) {
        syncPendingActivities();
      }
    });
  }

  void _startPeriodicSync() {
    // Sync every 5 minutes when online
    Timer.periodic(Duration(minutes: 5), (timer) {
      if (_isOnline) {
        syncPendingActivities();
      }
    });
  }

  Future<void> _loadPendingActivities() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final stored = prefs.getString('pending_activities');
      if (stored != null) {
        final List<dynamic> decoded = jsonDecode(stored);
        _pendingActivities = decoded.map((e) => PendingActivity.fromJson(e)).toList();
      }
    } catch (e) {
      print('Failed to load pending activities: $e');
    }
  }

  Future<void> _savePendingActivities() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = jsonEncode(_pendingActivities.map((e) => e.toJson()).toList());
      await prefs.setString('pending_activities', encoded);
    } catch (e) {
      print('Failed to save pending activities: $e');
    }
  }

  Future<String> createActivityOffline(Map<String, dynamic> data) async {
    final localId = 'local_${DateTime.now().millisecondsSinceEpoch}_${DateTime.now().microsecond}';
    
    final pendingActivity = PendingActivity(
      id: localId,
      data: data,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );

    _pendingActivities.add(pendingActivity);
    await _savePendingActivities();

    // Try immediate sync if online
    if (_isOnline) {
      _syncSingleActivity(pendingActivity);
    }

    return localId;
  }

  Future<void> syncPendingActivities() async {
    if (!_isOnline || _pendingActivities.isEmpty) return;

    final activitiesToSync = List<PendingActivity>.from(_pendingActivities);
    
    for (final activity in activitiesToSync) {
      await _syncSingleActivity(activity);
    }
  }

  Future<void> _syncSingleActivity(PendingActivity activity) async {
    try {
      final response = await _apiService.createActivity(activity.data);
      
      if (response['success']) {
        // Remove from pending list
        _pendingActivities.removeWhere((a) => a.id == activity.id);
        await _savePendingActivities();
        print('Successfully synced activity ${activity.id}');
      } else {
        throw Exception(response['message'] ?? 'Sync failed');
      }
    } catch (e) {
      print('Failed to sync activity ${activity.id}: $e');
      
      // Increment retry count
      final index = _pendingActivities.indexWhere((a) => a.id == activity.id);
      if (index != -1) {
        _pendingActivities[index].retryCount++;
        
        // Remove after 5 failed attempts
        if (_pendingActivities[index].retryCount >= 5) {
          print('Removing activity ${activity.id} after 5 failed attempts');
          _pendingActivities.removeAt(index);
        }
        
        await _savePendingActivities();
      }
    }
  }

  Future<Map<String, dynamic>> getSyncStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final lastSyncTime = prefs.getInt('last_sync_time') ?? 0;
    
    return {
      'lastSyncTime': lastSyncTime,
      'pendingCount': _pendingActivities.length,
      'isOnline': _isOnline,
    };
  }

  Future<void> fullSync() async {
    if (!_isOnline) {
      throw Exception('No internet connection');
    }

    try {
      // Sync pending activities first
      await syncPendingActivities();
      
      // Then pull latest data from server
      final activities = await _apiService.getActivities();
      final routePlans = await _apiService.getRoutePlans();
      
      // Cache the data locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('cached_activities', jsonEncode(activities['data']));
      await prefs.setString('cached_route_plans', jsonEncode(routePlans['data']));
      await prefs.setInt('last_sync_time', DateTime.now().millisecondsSinceEpoch);
      
      print('Full sync completed successfully');
    } catch (e) {
      print('Full sync failed: $e');
      throw e;
    }
  }

  Future<List<dynamic>> getCachedActivities() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString('cached_activities');
      return cached != null ? jsonDecode(cached) : [];
    } catch (e) {
      return [];
    }
  }

  Future<List<dynamic>> getCachedRoutePlans() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString('cached_route_plans');
      return cached != null ? jsonDecode(cached) : [];
    } catch (e) {
      return [];
    }
  }
}
```

### Flutter Sync UI Widget
```dart
import 'package:flutter/material.dart';
import 'sync_service.dart';

class SyncStatusWidget extends StatefulWidget {
  @override
  _SyncStatusWidgetState createState() => _SyncStatusWidgetState();
}

class _SyncStatusWidgetState extends State<SyncStatusWidget> {
  Map<String, dynamic> _syncStatus = {
    'lastSyncTime': 0,
    'pendingCount': 0,
    'isOnline': false,
  };
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadSyncStatus();
    // Update every 30 seconds
    Timer.periodic(Duration(seconds: 30), (timer) {
      if (mounted) _loadSyncStatus();
    });
  }

  Future<void> _loadSyncStatus() async {
    final status = await SyncService.instance.getSyncStatus();
    if (mounted) {
      setState(() {
        _syncStatus = status;
      });
    }
  }

  Future<void> _handleForceSync() async {
    if (!_syncStatus['isOnline']) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please check your internet connection')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      await SyncService.instance.fullSync();
      await _loadSyncStatus();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Data synchronized successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sync failed: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatLastSync(int timestamp) {
    if (timestamp == 0) return 'Never';
    
    final now = DateTime.now().millisecondsSinceEpoch;
    final diff = now - timestamp;
    final minutes = (diff / (1000 * 60)).floor();
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return '$minutes min ago';
    
    final hours = (minutes / 60).floor();
    if (hours < 24) return '$hours hour${hours > 1 ? 's' : ''} ago';
    
    final days = (hours / 24).floor();
    return '$days day${days > 1 ? 's' : ''} ago';
  }

  @override
  Widget build(BuildContext context) {
    final isOnline = _syncStatus['isOnline'] as bool;
    final pendingCount = _syncStatus['pendingCount'] as int;
    final lastSyncTime = _syncStatus['lastSyncTime'] as int;

    return Container(
      margin: EdgeInsets.all(16),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isOnline ? Colors.green.shade50 : Colors.red.shade50,
        border: Border.all(
          color: isOnline ? Colors.green.shade200 : Colors.red.shade200,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      isOnline ? Icons.wifi : Icons.wifi_off,
                      color: isOnline ? Colors.green : Colors.red,
                      size: 16,
                    ),
                    SizedBox(width: 4),
                    Text(
                      isOnline ? 'Online' : 'Offline',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isOnline ? Colors.green.shade700 : Colors.red.shade700,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 2),
                Text(
                  'Last sync: ${_formatLastSync(lastSyncTime)}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
                if (pendingCount > 0) ...[
                  SizedBox(height: 2),
                  Text(
                    '$pendingCount pending upload${pendingCount > 1 ? 's' : ''}',
                    style: TextStyle(fontSize: 12, color: Colors.orange.shade700),
                  ),
                ],
              ],
            ),
          ),
          ElevatedButton(
            onPressed: isOnline && !_isLoading ? _handleForceSync : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: isOnline ? Colors.blue : Colors.grey,
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            ),
            child: _isLoading
                ? SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Text(
                    'SYNC',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
          ),
        ],
      ),
    );
  }
}
```

## Background Sync Worker

### React Native Background Task
```typescript
import BackgroundJob from 'react-native-background-job';
import SyncService from './SyncService';

class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private isRunning = false;

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  startBackgroundSync(): void {
    if (this.isRunning) return;

    BackgroundJob.start({
      jobKey: 'sync_activities',
      period: 30000, // 30 seconds
    });

    BackgroundJob.register({
      jobKey: 'sync_activities',
      job: async () => {
        try {
          const syncService = SyncService.getInstance();
          await syncService.syncPendingActivities();
        } catch (error) {
          console.error('Background sync failed:', error);
        }
      },
    });

    this.isRunning = true;
  }

  stopBackgroundSync(): void {
    if (!this.isRunning) return;

    BackgroundJob.stop({
      jobKey: 'sync_activities',
    });

    this.isRunning = false;
  }
}

export default BackgroundSyncService;
```

### Flutter Background Sync
```dart
import 'package:workmanager/workmanager.dart';
import 'sync_service.dart';

const String syncTaskName = 'sync_activities';

void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    try {
      await SyncService.instance.syncPendingActivities();
      return Future.value(true);
    } catch (e) {
      print('Background sync failed: $e');
      return Future.value(false);
    }
  });
}

class BackgroundSyncService {
  static void initialize() {
    Workmanager().initialize(callbackDispatcher);
  }

  static void startBackgroundSync() {
    Workmanager().registerPeriodicTask(
      'sync_activities_task',
      syncTaskName,
      frequency: Duration(minutes: 15), // Minimum allowed
      constraints: Constraints(
        networkType: NetworkType.connected,
      ),
    );
  }

  static void stopBackgroundSync() {
    Workmanager().cancelByUniqueName('sync_activities_task');
  }
}
```
