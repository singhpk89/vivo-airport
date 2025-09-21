import React, { useState, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Target,
  Route,
  Calendar,
  Clock,
  Users,
  Activity,
  Star,
  Check,
  X,
  Plus,
  ArrowRight,
  Search,
  Filter,
  Upload,
  FileText,
  Download,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TextField } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";

// Mock data for route plans
const mockRoutePlans = [
  {
    id: 1,
    name: 'Mumbai Central Route',
    region: 'West',
    state: 'Maharashtra',
    district: 'Mumbai',
    totalLocations: 25,
    completedLocations: 18,
    status: 'active',
    priority: 'high',
    startDate: '2024-08-01',
    endDate: '2024-08-31',
    assignedTeam: 'Team Alpha',
    estimatedRevenue: '₹2,50,000',
    actualRevenue: '₹1,80,000',
    completionRate: 72,
    description: 'Central Mumbai advertising campaign covering major commercial areas and transit hubs'
  },
  {
    id: 2,
    name: 'Delhi North Route',
    region: 'North',
    state: 'Delhi',
    district: 'North Delhi',
    totalLocations: 20,
    completedLocations: 8,
    status: 'active',
    priority: 'medium',
    startDate: '2024-07-15',
    endDate: '2024-09-15',
    assignedTeam: 'Team Beta',
    estimatedRevenue: '₹1,80,000',
    actualRevenue: '₹72,000',
    completionRate: 40,
    description: 'North Delhi market penetration focusing on educational institutions and residential areas'
  },
  {
    id: 3,
    name: 'Chennai Tech Corridor',
    region: 'South',
    state: 'Tamil Nadu',
    district: 'Chennai',
    totalLocations: 15,
    completedLocations: 15,
    status: 'completed',
    priority: 'high',
    startDate: '2024-06-01',
    endDate: '2024-07-30',
    assignedTeam: 'Team Gamma',
    estimatedRevenue: '₹1,20,000',
    actualRevenue: '₹1,35,000',
    completionRate: 100,
    description: 'Technology corridor campaign targeting IT professionals and tech companies'
  }
];

const RoutePlanDialog = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const fileInputRef = useRef(null);

  // Filter route plans based on search and filters
  const filteredPlans = mockRoutePlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || plan.region === regionFilter;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (allowedTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setImportStep(2);
      } else {
        alert('Please select a valid Excel (.xlsx, .xls) or CSV file');
      }
    }
  };

  const startImport = () => {
    setImportStatus('uploading');
    setImportProgress(0);
    
    // Simulate file upload and processing
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setImportStatus('completed');
          setImportStep(3);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const resetImport = () => {
    setImportStep(1);
    setSelectedFile(null);
    setImportProgress(0);
    setImportStatus('idle');
    setShowImportDialog(false);
  };

  const getStatusBadge = (status) => {
    const configs = {
      active: { 
        variant: 'default', 
        className: 'bg-success-container text-success hover:bg-success-container/80',
        icon: CheckCircle
      },
      completed: { 
        variant: 'default', 
        className: 'bg-primary-container text-primary hover:bg-primary-container/80',
        icon: Check
      },
      pending: { 
        variant: 'default', 
        className: 'bg-warning-container text-warning hover:bg-warning-container/80',
        icon: Clock
      },
      cancelled: { 
        variant: 'default', 
        className: 'bg-error-container text-error hover:bg-error-container/80',
        icon: XCircle
      }
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const configs = {
      high: { className: 'bg-error-container text-error', icon: AlertCircle },
      medium: { className: 'bg-warning-container text-warning', icon: Info },
      low: { className: 'bg-surface-variant text-on-surface-variant', icon: CheckCircle }
    };

    const config = configs[priority] || configs.medium;
    const Icon = config.icon;

    return (
      <Badge variant="default" className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setActiveTab('details');
  };

  const resetView = () => {
    setSelectedPlan(null);
    setActiveTab('overview');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-surface border border-outline-variant">
        <DialogHeader className="bg-surface-container border-b border-outline-variant p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
                <Route className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-headline-small font-semibold text-on-surface">
                  {selectedPlan ? selectedPlan.name : 'Route Plan Management'}
                </DialogTitle>
                <DialogDescription className="text-body-medium text-on-surface-variant">
                  {selectedPlan 
                    ? `${selectedPlan.region} Region • ${selectedPlan.state}, ${selectedPlan.district}`
                    : 'Manage and monitor advertising route plans across all regions'
                  }
                </DialogDescription>
              </div>
            </div>
            {selectedPlan && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetView}
                className="border-outline hover:bg-surface-variant"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Overview
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="bg-surface-container border-b border-outline-variant px-6">
              <TabsList className="bg-transparent h-auto p-0 space-x-0">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-primary-container data-[state=active]:text-primary px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="data-[state=active]:bg-primary-container data-[state=active]:text-primary px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                  disabled={!selectedPlan}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Plan Details
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-primary-container data-[state=active]:text-primary px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <TextField
                      placeholder="Search route plans..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      startIcon={<Search className="w-4 h-4" />}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="North">North</SelectItem>
                        <SelectItem value="South">South</SelectItem>
                        <SelectItem value="East">East</SelectItem>
                        <SelectItem value="West">West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Route Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      variant="outlined" 
                      className="group hover:shadow-elevation-2 transition-all duration-200 cursor-pointer border-outline-variant hover:border-primary"
                      onClick={() => handlePlanSelect(plan)}
                    >
                      <div className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-title-medium font-semibold text-on-surface group-hover:text-primary transition-colors">
                              {plan.name}
                            </h3>
                            <p className="text-body-small text-on-surface-variant mt-1">
                              {plan.state}, {plan.district}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(plan.status)}
                            {getPriorityBadge(plan.priority)}
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-body-small">
                            <span className="text-on-surface-variant">Progress</span>
                            <span className="text-on-surface font-medium">{plan.completionRate}%</span>
                          </div>
                          <div className="w-full bg-surface-variant rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${plan.completionRate}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-body-small text-on-surface-variant">
                            <span>{plan.completedLocations} / {plan.totalLocations} locations</span>
                            <span>{plan.assignedTeam}</span>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant">
                          <div className="text-center">
                            <p className="text-title-small font-semibold text-on-surface">{plan.estimatedRevenue}</p>
                            <p className="text-body-small text-on-surface-variant">Estimated</p>
                          </div>
                          <div className="text-center">
                            <p className="text-title-small font-semibold text-on-surface">{plan.actualRevenue}</p>
                            <p className="text-body-small text-on-surface-variant">Actual</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredPlans.length === 0 && (
                  <div className="text-center py-12">
                    <Route className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                    <h3 className="text-title-medium font-semibold text-on-surface mb-2">No route plans found</h3>
                    <p className="text-body-medium text-on-surface-variant">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-0 space-y-6">
                {selectedPlan && (
                  <>
                    {/* Plan Overview */}
                    <Card variant="outlined" className="border-outline-variant">
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-body-small text-on-surface-variant">Duration</Label>
                              <p className="text-body-large text-on-surface">{selectedPlan.startDate} to {selectedPlan.endDate}</p>
                            </div>
                            <div>
                              <Label className="text-body-small text-on-surface-variant">Assigned Team</Label>
                              <p className="text-body-large text-on-surface">{selectedPlan.assignedTeam}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-body-small text-on-surface-variant">Total Locations</Label>
                              <p className="text-body-large text-on-surface">{selectedPlan.totalLocations}</p>
                            </div>
                            <div>
                              <Label className="text-body-small text-on-surface-variant">Completion Rate</Label>
                              <p className="text-body-large text-on-surface">{selectedPlan.completionRate}%</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-body-small text-on-surface-variant">Estimated Revenue</Label>
                              <p className="text-body-large text-on-surface">{selectedPlan.estimatedRevenue}</p>
                            </div>
                            <div>
                              <Label className="text-body-small text-on-surface-variant">Actual Revenue</Label>
                              <p className="text-body-large text-on-surface">{selectedPlan.actualRevenue}</p>
                            </div>
                          </div>
                        </div>
                        <Separator className="my-6" />
                        <div>
                          <Label className="text-body-small text-on-surface-variant">Description</Label>
                          <p className="text-body-medium text-on-surface mt-2">{selectedPlan.description}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Locations List */}
                    <Card variant="outlined" className="border-outline-variant">
                      <div className="p-6">
                        <h3 className="text-title-large font-semibold text-on-surface mb-4">Locations</h3>
                        <div className="space-y-3">
                          {selectedPlan.locations.map((location) => (
                            <div key={location.id} className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="text-body-medium font-medium text-on-surface">{location.name}</p>
                                  <p className="text-body-small text-on-surface-variant">{location.type}</p>
                                </div>
                              </div>
                              {getStatusBadge(location.status)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <Card variant="outlined" className="border-outline-variant">
                  <div className="p-6 text-center">
                    <Activity className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                    <h3 className="text-title-medium font-semibold text-on-surface mb-2">Analytics Dashboard</h3>
                    <p className="text-body-medium text-on-surface-variant">
                      Detailed analytics and reporting features coming soon
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="bg-surface-container border-t border-outline-variant p-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              <Button variant="tonal" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Plan
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
            <Button onClick={onClose} variant="filled">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoutePlanDialog;
