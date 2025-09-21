import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NotificationCenter = () => {
  const notifications = [
    { id: 1, title: 'New user registered', message: 'John Doe has created a new account', time: '2 hours ago', read: false },
    { id: 2, title: 'Order completed', message: 'Order #1234 has been completed', time: '4 hours ago', read: true },
    { id: 3, title: 'Low stock alert', message: 'Product "Yoga Mat" is running low', time: '6 hours ago', read: false },
    { id: 4, title: 'Payment received', message: 'Payment of $299.99 received', time: '8 hours ago', read: true },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Notification Center</h1>
      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div key={notification.id} className={`p-4 ${!notification.read ? 'bg-blue-50' : ''}`}>
              <div className="flex items-start space-x-3">
                <BellIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-green-600 hover:text-green-900">
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
