
const ProfileManagement = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profile Management</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xl font-medium text-gray-700">AU</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Admin User</h2>
            <p className="text-gray-500">admin@example.com</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" defaultValue="Admin User" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" defaultValue="admin@example.com" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Profile</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;
