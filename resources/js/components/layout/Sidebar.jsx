import React, { Fragment, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  ShoppingBag,
  ClipboardList,
  BarChart3,
  FileText,
  Settings,
  UserCircle,
  Bell,
  Folder,
  Search,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Key,
  UserCheck,
  LogOut,
  MapPin,
  Route,
  Activity,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Building2,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  Images,
  BrainCircuit
} from 'lucide-react';
import { cn } from "../../lib/utils";
import { Button } from '../ui/Button';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

// Define navigation items with better organization and dividers
const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    permission: 'dashboard.view',
    menuKey: 'dashboard'
  },
//   {
//     type: 'divider',
//     id: 'reports-divider',
//     label: 'Reports & Analytics'
//   },
//   {
//     title: 'Reports',
//     icon: FileText,
//     items: [
//       {
//         title: 'All Activity',
//         url: '/reports/all-activity',
//         icon: Activity,
//         permission: 'activity_recces.view',
//         menuKey: 'activity_recces'
//       },
//       {
//         title: 'Pending Activity',
//         url: '/reports/pending-activity',
//         icon: Clock,
//         permission: 'activity_recces.view',
//         menuKey: 'activity_recces'
//       },
//       {
//         title: 'Approved Activity',
//         url: '/reports/approved-activity',
//         icon: CheckCircle,
//         permission: 'activity_recces.view',
//         menuKey: 'activity_recces'
//       },
//       {
//         title: 'Rejected Activity',
//         url: '/reports/rejected-activity',
//         icon: XCircle,
//         permission: 'activity_recces.view',
//         menuKey: 'activity_recces'
//       },
//       {
//         title: 'Route Plan',
//         url: '/reports/route-plan',
//         icon: Route,
//         permission: 'route_plans.view',
//         menuKey: 'route_plans'
//       }
//     ]
//   },
//   {
//     title: 'Photos',
//     icon: Camera,
//     items: [
//       {
//         title: 'Photo Gallery',
//         url: '/photos/gallery',
//         icon: Images,
//         permission: 'photos.view',
//         menuKey: 'photos'
//       }
//     ]
//   },
  {
    type: 'divider',
    id: 'activity-divider',
    label: 'Activity Management'
  },
  {
    title: 'Activity Management',
    icon: Activity,
    items: [
      {
        title: 'Promoters',
        url: '/acl/promoters',
        icon: UserCheck,
        permission: 'promoters.view',
        menuKey: 'promoters'
      },
      {
        title: 'Promoter Activity',
        url: '/admin/promoter-activity',
        icon: Activity,
        permission: 'users.view',
        menuKey: 'promoter-activity'
      },
      {
        title: 'User Feedback',
        url: '/admin/feedback',
        icon: MessageSquare,
        // permission: 'feedback.view',
        menuKey: 'feedback'
      }
    ]
  },
  {
    type: 'divider',
    id: 'management-divider',
    label: 'User Management'
  },
  {
    title: 'User Management',
    icon: Users,
    items: [
      {
        title: 'Users',
        url: '/users',
        icon: Users,
        permission: 'users.view',
        menuKey: 'users'
      },
      {
        title: 'User States',
        url: '/acl/user-states',
        icon: MapPin,
        permission: 'users.view',
        menuKey: 'user-states'
      },
      {
        title: 'Roles',
        url: '/roles',
        icon: Shield,
        permission: 'roles.view',
        menuKey: 'roles'
      },
      {
        title: 'Permissions',
        url: '/permissions',
        icon: Key,
        permission: 'permissions.view',
        menuKey: 'permissions'
      }
    ]
  },
  {
    type: 'divider',
    id: 'settings-divider',
    label: 'Settings'
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    permission: 'settings.view',
    menuKey: 'settings'
  }
];

const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed } = useSidebar();
  const { isMenuAccessible, user, logout, isSuperAdmin } = useAuth();
  const { settings } = useSettings();
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [hoveredGroup, setHoveredGroup] = useState(null);

  // Auto-expand group that contains the current active page
  React.useEffect(() => {
    const activeGroup = navigationItems.find(item =>
      item.items && item.items.some(subItem => location.pathname === subItem.url)
    );
    if (activeGroup) {
      setExpandedGroup(activeGroup.title);
    }
  }, [location.pathname]);

  // Filter navigation items based on user permissions
  const accessibleItems = navigationItems.map(item => {
    // Keep dividers as-is
    if (item.type === 'divider') {
      return item;
    }

    if (item.items) {
      // For groups, filter sub-items
      const accessibleSubItems = item.items.filter(subItem => {
        if (!subItem.permission) return true;
        return isMenuAccessible(subItem.menuKey);
      });

      // Only show group if it has accessible sub-items
      return accessibleSubItems.length > 0 ? { ...item, items: accessibleSubItems } : null;
    } else {
      // For single items, check permission
      if (!item.permission) return item;

      // Special check for settings - only super admin can access
      if (item.menuKey === 'settings') {
        return isSuperAdmin() && isMenuAccessible(item.menuKey) ? item : null;
      }

      return isMenuAccessible(item.menuKey) ? item : null;
    }
  }).filter(Boolean);

  const toggleGroup = (groupTitle) => {
    setExpandedGroup(prev => prev === groupTitle ? null : groupTitle);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex items-center flex-1 justify-center mr-8">
            <img
              src={settings.admin_logo ? `/uploads/logo/${settings.admin_logo}` : "/img/logo.png"}
              alt={settings.app_name || "Admin Panel"}
              className="h-10 w-auto object-contain max-w-[160px]"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 text-gray-600 hover:bg-white/70 hover:text-blue-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent
          items={accessibleItems}
          location={location}
          user={user}
          logout={logout}
          isCollapsed={false}
          expandedGroup={expandedGroup}
          toggleGroup={toggleGroup}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
        />
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:transition-all lg:duration-300 lg:shadow-lg",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed ? "justify-center w-full" : "flex-1 justify-center mr-8"
          )}>
            <img
              src={settings.admin_logo ? `/uploads/logo/${settings.admin_logo}` : "/img/logo.png"}
              alt={settings.app_name || "Admin Panel"}
              className={cn(
                "w-auto object-contain transition-all duration-300",
                isCollapsed ? "h-8 max-w-[32px]" : "h-10 max-w-[160px]"
              )}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-gray-600 hover:bg-white/70 hover:text-blue-700"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <SidebarContent
          items={accessibleItems}
          location={location}
          user={user}
          logout={logout}
          isCollapsed={isCollapsed}
          expandedGroup={expandedGroup}
          toggleGroup={toggleGroup}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
        />
      </div>
    </>
  );
};

const SidebarContent = ({ items, location, user, logout, isCollapsed, expandedGroup, toggleGroup, hoveredGroup, setHoveredGroup }) => {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {items.map((item, index) => {
          // Handle dividers with labels
          if (item.type === 'divider') {
            return (
              <div key={item.id} className={cn(
                "py-4",
                index === 0 ? "pt-0" : "",
                index === items.length - 1 ? "pb-0" : ""
              )}>
                {!isCollapsed && item.label && (
                  <div className="px-3 mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </h3>
                  </div>
                )}
                <hr className={cn(
                  "border-gray-200",
                  isCollapsed ? "mx-2" : "mx-3"
                )} />
              </div>
            );
          }

          if (item.items) {
            // Group with sub-items
            const isExpanded = expandedGroup === item.title;
            const isHovered = hoveredGroup === item.title;
            const hasActiveItem = item.items.some(subItem => location.pathname === subItem.url);
            const shouldShowSubItems = isExpanded || isHovered || isCollapsed;

            return (
              <div
                key={item.title}
                className="space-y-2 relative"
                onMouseEnter={() => !isCollapsed && setHoveredGroup(item.title)}
                onMouseLeave={() => !isCollapsed && setHoveredGroup(null)}
              >
                {/* Group header */}
                <button
                  onClick={() => !isCollapsed && toggleGroup(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium rounded-xl transition-all duration-200 group",
                    isCollapsed ? "justify-center" : "",
                    hasActiveItem
                      ? "text-blue-700 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 shadow-sm border border-blue-100"
                      : "text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm"
                  )}
                  disabled={isCollapsed}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className="flex items-center">
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      hasActiveItem ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600",
                      !isCollapsed && "mr-3"
                    )} />
                    {!isCollapsed && <span className="font-medium">{item.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform text-gray-400 group-hover:text-blue-600",
                      isExpanded ? "rotate-180" : ""
                    )} />
                  )}
                </button>

                {/* Sub-items */}
                {shouldShowSubItems && (
                  <div className={cn(
                    "space-y-1 transition-all duration-200",
                    !isCollapsed && "ml-2 pl-4 border-l-2 border-gray-100",
                    // For collapsed mode, show as a tooltip-like dropdown
                    isCollapsed && "absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-48 z-50"
                  )}>
                    {item.items.map((subItem) => {
                      const isActive = location.pathname === subItem.url;
                      return (
                        <Link
                          key={subItem.title}
                          to={subItem.url}
                          className={cn(
                            "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                            isCollapsed ? "justify-start" : "justify-start",
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02] border border-blue-600"
                              : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-sm hover:scale-[1.01]"
                          )}
                        >
                          <subItem.icon className={cn(
                            "h-4 w-4 flex-shrink-0 transition-colors",
                            isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600",
                            "mr-3"
                          )} />
                          <span>{subItem.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
            // Single item
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                  isCollapsed ? "justify-center" : "justify-start",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-[1.02] border border-emerald-600"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 hover:shadow-sm hover:scale-[1.01]"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-gray-500 group-hover:text-emerald-600",
                  !isCollapsed && "mr-3"
                )} />
                {!isCollapsed && <span className="font-medium">{item.title}</span>}
              </Link>
            );
          }
        })}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50/50">
        {user && (
          <div className={cn(
            "mb-4 p-4 rounded-xl bg-gradient-to-br from-white via-blue-50 to-indigo-50 border border-blue-100 shadow-sm",
            isCollapsed ? "text-center" : "text-left"
          )}>
            {!isCollapsed ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
                {user.roles && user.roles.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                    {(user.roles[0].name || user.roles[0]).replace('_', ' ')}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto">
                <UserCircle className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 hover:shadow-sm hover:scale-[1.01] group",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className={cn("h-4 w-4 transition-colors group-hover:text-red-700", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
