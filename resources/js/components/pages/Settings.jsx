import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Settings as SettingsIcon, Upload, User, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const Settings = () => {
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState({
    app_name: 'GIC Admin Panel',
    admin_logo: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Helper function to handle authentication failures
  const handleAuthFailure = (message = 'Authentication required. Please log in again.') => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    showMessage('error', message);

    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        handleAuthFailure('No authentication token found. Please log in.');
        return;
      }

      console.log('Loading settings with token:', token.substring(0, 20) + '...');

      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Settings API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);

          // Set logo preview if exists
          if (data.data.admin_logo) {
            setLogoPreview(`/uploads/logo/${data.data.admin_logo}`);
          }
        }
      } else if (response.status === 401) {
        handleAuthFailure('Authentication expired. Please log in again.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showMessage('error', errorData.message || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Failed to load settings - network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        handleAuthFailure('No authentication token found. Please log in.');
        return;
      }

      console.log('Saving settings with token:', token.substring(0, 20) + '...');

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const formData = new FormData();

      // Add app name
      formData.append('app_name', settings.app_name);

      // Add logo file if selected
      if (logoFile) {
        formData.append('admin_logo', logoFile);
      }

      console.log('Form data entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('Save settings API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showMessage('success', data.message || 'Settings saved successfully');
          setLogoFile(null); // Clear the file input
          loadSettings(); // Reload settings to get updated data
          refreshSettings(); // Refresh global settings context
        } else {
          showMessage('error', data.message || 'Failed to save settings');
        }
      } else if (response.status === 401) {
        handleAuthFailure('Authentication expired. Please log in again.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save settings error response:', errorData);
        showMessage('error', errorData.message || `Failed to save settings (${response.status})`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Failed to save settings - network error');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings and preferences.
          </p>
        </div>
        <Badge variant="outline">
          <SettingsIcon className="mr-1 h-3 w-3" />
          System Configuration
        </Badge>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-md flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ?
            <CheckCircle className="h-5 w-5" /> :
            <AlertCircle className="h-5 w-5" />
          }
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-6">
        {/* Admin Logo Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Admin Logo</CardTitle>
            </div>
            <CardDescription>
              Upload and manage the admin panel logo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Current Logo Preview */}
              {logoPreview && (
                <div className="space-y-2">
                  <Label>Current Logo</Label>
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <img
                      src={logoPreview}
                      alt="Admin Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo">Upload New Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended size: 200x200px. Supported formats: JPG, PNG, SVG
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Application Settings</CardTitle>
            </div>
            <CardDescription>
              Configure basic application information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app_name">Application Name</Label>
              <Input
                id="app_name"
                value={settings.app_name}
                onChange={(e) => handleInputChange('app_name', e.target.value)}
                placeholder="Enter application name"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
