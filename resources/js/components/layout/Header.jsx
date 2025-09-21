import { Menu, Bell, User, Search, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { setSidebarOpen } = useSidebar();
  const { user } = useAuth();

  const clearBrowserCache = () => {
    // Clear browser cache using multiple methods
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Force reload from server
    window.location.reload(true);
  };

  return (
    <div className="relative z-10 flex h-16 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 shadow-sm shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="px-3 border-r border-gray-200 text-gray-600 hover:bg-white/70 hover:text-blue-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex-1 flex">
          <div className="w-full flex">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 h-8"
                placeholder="Search..."
                type="search"
              />
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={clearBrowserCache}
            title="Clear Browser Cache"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-blue-700 hover:bg-white/70"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="default"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-700 hover:bg-white/70"
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
