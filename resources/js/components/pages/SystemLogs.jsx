
const SystemLogs = () => {
  const logs = [
    { timestamp: '2024-01-15 10:30:25', level: 'INFO', message: 'User login successful: john@example.com' },
    { timestamp: '2024-01-15 10:25:12', level: 'WARNING', message: 'Failed login attempt from IP: 192.168.1.100' },
    { timestamp: '2024-01-15 10:20:45', level: 'ERROR', message: 'Database connection timeout' },
    { timestamp: '2024-01-15 10:15:30', level: 'INFO', message: 'System backup completed successfully' },
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case 'INFO': return 'text-blue-600 bg-blue-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">System Logs</h1>
      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200">
          {logs.map((log, index) => (
            <div key={index} className="p-4">
              <div className="flex items-start space-x-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded ${getLevelColor(log.level)}`}>
                  {log.level}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
