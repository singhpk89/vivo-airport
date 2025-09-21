import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  Camera,
  Images,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/Label';
import { useAuth } from '../../contexts/AuthContext';
import { formatDisplayValue } from '../../utils/textUtils';

// Lazy Loading Image Component
const LazyImage = ({ src, alt, className, onError, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' } // Load images 50px before they enter viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError(e);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`} {...props}>
      {/* Loading placeholder */}
      {(isLoading || !isInView) && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <Images className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

// Loading skeleton component for photo cards
const PhotoCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="relative aspect-square bg-gray-200 animate-pulse" />
    <CardContent className="p-3">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate state for input
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [subDistrictFilter, setSubDistrictFilter] = useState('all');
  const [villageFilter, setVillageFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter UI states
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20, // Increased from 12 for better performance
    total: 0,
    from: 0,
    to: 0,
    total_records: 0
  });
  const { token } = useAuth();

  // Filter options
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  useEffect(() => {
    if (filtersApplied) {
      fetchPhotos();
    }
  }, [searchTerm, pagination.current_page, filtersApplied]);

  useEffect(() => {
    fetchFilterOptions();
    // Initial load
    fetchPhotos();
  }, []);

  // Server-side filtering - only fetch when filters are applied
  useEffect(() => {
    if (filtersApplied) {
      console.log('=== FILTER APPLICATION DEBUG ===');
      console.log('Applied Filters:', {
        statusFilter,
        stateFilter,
        districtFilter,
        subDistrictFilter,
        villageFilter,
        dateFilter,
        startDate,
        endDate
      });
      fetchPhotos();
    }
  }, [statusFilter, stateFilter, districtFilter, subDistrictFilter, villageFilter, dateFilter, startDate, endDate, filtersApplied]);

  // Filter application functions
  const applyFilters = () => {
    console.log('Applying filters...');
    setFiltersApplied(true);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const clearFilters = () => {
    console.log('Clearing filters...');
    setStatusFilter('all');
    setStateFilter('all');
    setDistrictFilter('all');
    setSubDistrictFilter('all');
    setVillageFilter('all');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setFiltersApplied(false);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    // Fetch photos with no filters
    setTimeout(fetchPhotos, 100);
  };

  const hasActiveFilters = () => {
    return statusFilter !== 'all' ||
           stateFilter !== 'all' ||
           districtFilter !== 'all' ||
           subDistrictFilter !== 'all' ||
           villageFilter !== 'all' ||
           dateFilter !== 'all' ||
           startDate ||
           endDate ||
           searchTerm;
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);

      // Construct query parameters
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (stateFilter !== 'all') params.append('state', stateFilter);
      if (districtFilter !== 'all') params.append('district', districtFilter);
      if (subDistrictFilter !== 'all') params.append('sub_district', subDistrictFilter);
      if (villageFilter !== 'all') params.append('village', villageFilter);

      // Date filters
      if (dateFilter !== 'all') {
        const today = new Date();
        let startDateValue = null;

        switch (dateFilter) {
          case 'today':
            startDateValue = today.toISOString().split('T')[0];
            params.append('start_date', startDateValue);
            params.append('end_date', startDateValue);
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            params.append('start_date', weekAgo.toISOString().split('T')[0]);
            params.append('end_date', today.toISOString().split('T')[0]);
            break;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            params.append('start_date', monthAgo.toISOString().split('T')[0]);
            params.append('end_date', today.toISOString().split('T')[0]);
            break;
          case 'custom':
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            break;
        }
      } else if (startDate || endDate) {
        // If no preset filter but custom dates are set
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
      }

      params.append('page', pagination.current_page);
      params.append('per_page', pagination.per_page);

      console.log('Fetching photos with params:', params.toString());

      const response = await fetch(`/api/mobile/activities/photos?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log('Photos fetched successfully:', data);
        setPhotos(data.data);
        setPagination({
          current_page: data.pagination?.current_page || 1,
          last_page: data.pagination?.last_page || 1,
          per_page: data.pagination?.per_page || 20,
          total: data.pagination?.total || 0,
          from: data.pagination?.from || 0,
          to: data.pagination?.to || 0,
          total_records: data.pagination?.total_records || data.pagination?.total || 0
        });
      } else {
        console.error('Failed to fetch photos:', data.message);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch states from route plans
      const statesResponse = await fetch('/api/route-plans/states', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const statesData = await statesResponse.json();
      if (statesData.success) {
        setStates(statesData.data);
      }

      // Fetch districts based on selected state
      let districtsUrl = '/api/route-plans/districts';
      if (stateFilter !== 'all') {
        districtsUrl += `?state=${encodeURIComponent(stateFilter)}`;
      }

      const districtsResponse = await fetch(districtsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const districtsData = await districtsResponse.json();
      if (districtsData.success) {
        setDistricts(districtsData.data);
      }

      // Fetch sub districts based on selected state and district
      let subDistrictsUrl = '/api/route-plans/sub-districts';
      const subDistrictParams = new URLSearchParams();
      if (stateFilter !== 'all') subDistrictParams.append('state', stateFilter);
      if (districtFilter !== 'all') subDistrictParams.append('district', districtFilter);
      if (subDistrictParams.toString()) {
        subDistrictsUrl += `?${subDistrictParams.toString()}`;
      }

      const subDistrictsResponse = await fetch(subDistrictsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const subDistrictsData = await subDistrictsResponse.json();
      if (subDistrictsData.success) {
        setSubDistricts(subDistrictsData.data);
      }

      // Fetch villages based on selected state, district, and sub district
      let villagesUrl = '/api/route-plans/villages';
      const villageParams = new URLSearchParams();
      if (stateFilter !== 'all') villageParams.append('state', stateFilter);
      if (districtFilter !== 'all') villageParams.append('district', districtFilter);
      if (subDistrictFilter !== 'all') villageParams.append('sub_district', subDistrictFilter);
      if (villageParams.toString()) {
        villagesUrl += `?${villageParams.toString()}`;
      }

      const villagesResponse = await fetch(villagesUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const villagesData = await villagesResponse.json();
      if (villagesData.success) {
        setVillages(villagesData.data);
      }

    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Download photo function
  const downloadPhoto = async (photo) => {
    try {
      // Determine which image to download (prefer the main image URL)
      let imageType = 'close_shot_1'; // Default
      if (photo.image_type === 'close_shot_2') imageType = 'close_shot_2';
      else if (photo.image_type === 'long_shot_1') imageType = 'long_shot_1';
      else if (photo.image_type === 'long_shot_2') imageType = 'long_shot_2';

      const response = await fetch(`/api/activities/${photo.id}/download-photo?image_type=${imageType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to download photo');
      }

      // Create a blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `photo_${photo.id}_${imageType}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading photo:', error);
      alert('Failed to download photo. Please try again.');
    }
  };

  // Handle state filter change - reset dependent filters
  const handleStateFilterChange = (value) => {
    setStateFilter(value);
    setDistrictFilter('all');
    setSubDistrictFilter('all');
    setVillageFilter('all');
  };

  // Handle district filter change - reset dependent filters
  const handleDistrictFilterChange = (value) => {
    setDistrictFilter(value);
    setSubDistrictFilter('all');
    setVillageFilter('all');
  };

  // Handle sub district filter change - reset dependent filters
  const handleSubDistrictFilterChange = (value) => {
    setSubDistrictFilter(value);
    setVillageFilter('all');
  };

  // Handle village filter change
  const handleVillageFilterChange = (value) => {
    setVillageFilter(value);
  };

  const handlePageSizeChange = (pageSize) => {
    setPagination(prev => ({
      ...prev,
      per_page: pageSize,
      current_page: 1
    }));
  };

  // Fetch filter options when parent filters change
  useEffect(() => {
    fetchFilterOptions();
  }, [stateFilter, districtFilter, subDistrictFilter]);

  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const getCategoryColor = (imageType) => {
    const colors = {
      'close_shot1': 'bg-blue-100 text-blue-800',
      'close_shot_2': 'bg-green-100 text-green-800',
      'long_shot_1': 'bg-purple-100 text-purple-800',
      'long_shot_2': 'bg-orange-100 text-orange-800'
    };
    return colors[imageType] || 'bg-gray-100 text-gray-800';
  };

  const formatImageType = (imageType) => {
    const labels = {
      'close_shot1': 'Close Shot 1',
      'close_shot_2': 'Close Shot 2',
      'long_shot_1': 'Long Shot 1',
      'long_shot_2': 'Long Shot 2'
    };
    return labels[imageType] || imageType;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 shrink-0 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Photo Gallery</h1>
            <p className="text-sm text-muted-foreground">Activity Recce Photos</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="p-6 h-full flex flex-col">
          <div className="space-y-6 flex-shrink-0">

          {/* Enhanced Search and Filters Section */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {/* Search Row */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search photos by village, state, district, location... (Press Enter)"
                    value={searchInput}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                  {searchInput && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearSearch}
                        className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSearchSubmit}
                        className="h-8 w-8 p-0 hover:bg-primary/10 text-primary rounded-full"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {filtersExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {hasActiveFilters() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Expandable Filter Section */}
              {filtersExpanded && (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="status-filter" className="text-sm font-medium mb-2 block">
                        Status
                      </Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="state-filter" className="text-sm font-medium mb-2 block">
                        State
                      </Label>
                      <Select value={stateFilter} onValueChange={handleStateFilterChange}>
                        <SelectTrigger id="state-filter" className="sentence-case">
                          <SelectValue placeholder="All States" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All States</SelectItem>
                          {states.map((state) => (
                            <SelectItem key={state} value={state} className="sentence-case">
                              {formatDisplayValue(state)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="district-filter" className="text-sm font-medium mb-2 block">
                        District
                      </Label>
                      <Select value={districtFilter} onValueChange={handleDistrictFilterChange}>
                        <SelectTrigger id="district-filter" className="sentence-case">
                          <SelectValue placeholder="All Districts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Districts</SelectItem>
                          {districts.map((district) => (
                            <SelectItem key={district} value={district} className="sentence-case">
                              {formatDisplayValue(district)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sub-district-filter" className="text-sm font-medium mb-2 block">
                        Sub District
                      </Label>
                      <Select value={subDistrictFilter} onValueChange={handleSubDistrictFilterChange}>
                        <SelectTrigger id="sub-district-filter" className="sentence-case">
                          <SelectValue placeholder="All Sub Districts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sub Districts</SelectItem>
                          {subDistricts.map((subDistrict) => (
                            <SelectItem key={subDistrict} value={subDistrict} className="sentence-case">
                              {formatDisplayValue(subDistrict)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="village-filter" className="text-sm font-medium mb-2 block">
                        Village
                      </Label>
                      <Select value={villageFilter} onValueChange={handleVillageFilterChange}>
                        <SelectTrigger id="village-filter" className="sentence-case">
                          <SelectValue placeholder="All Villages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Villages</SelectItem>
                          {villages.map((village) => (
                            <SelectItem key={village} value={village}>
                              {village}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date-filter" className="text-sm font-medium mb-2 block">
                        Date Range
                      </Label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger id="date-filter">
                          <SelectValue placeholder="All Dates" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Dates</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">Last Week</SelectItem>
                          <SelectItem value="month">Last Month</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {dateFilter === 'custom' && (
                      <>
                        <div>
                          <Label htmlFor="start-date" className="text-sm font-medium mb-2 block">
                            Start Date
                          </Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date" className="text-sm font-medium mb-2 block">
                            End Date
                          </Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-end">
                      <Button
                        onClick={applyFilters}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                        size="sm"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {filtersApplied ? 'Update Filter' : 'Apply Filter'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Search Indicator */}
          {searchTerm && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Search className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Active search: "<strong>{searchTerm}</strong>"
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSearch}
                className="ml-auto h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && photos.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: pagination.per_page }).map((_, index) => (
                <PhotoCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              {/* Photos Grid */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <div
                        className="relative aspect-square"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <LazyImage
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/300/300';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={getCategoryColor(photo.image_type)}>
                            {formatImageType(photo.image_type)}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                          <ZoomIn className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-sm space-y-1">
                              <div className="font-medium">{photo.village || 'N/A'}</div>
                              <div className="text-muted-foreground text-xs sentence-case">
                                {formatDisplayValue(photo.state)}, {formatDisplayValue(photo.district)}
                              </div>
                              {photo.village_code && (
                                <div className="text-muted-foreground text-xs">
                                  Code: {photo.village_code}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(photo.visit_date).toLocaleDateString()}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <div>Lat: {photo.latitude}</div>
                            <div>Lng: {photo.longitude}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div
                            className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => setSelectedPhoto(photo)}
                          >
                            <LazyImage
                              src={photo.thumbnail || photo.url}
                              alt={photo.title}
                              className="w-full h-full hover:scale-105 transition-transform"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/100/100';
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{photo.title}</h3>
                                <Badge className={getCategoryColor(photo.image_type)}>
                                  {formatImageType(photo.image_type)}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Location</div>
                                <div className="sentence-case">{formatDisplayValue(photo.village)}, {formatDisplayValue(photo.district)}</div>
                                <div className="text-xs text-muted-foreground sentence-case">{formatDisplayValue(photo.state)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Details</div>
                                <div>Code: {photo.village_code || 'N/A'}</div>
                                <div className="text-xs">
                                  {photo.latitude}, {photo.longitude}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(photo.visit_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* No Photos */}
              {photos.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Images className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No photos found</h3>
                  <p className="text-muted-foreground">
                    No activity photos match your current filters.
                  </p>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Fixed Pagination Footer - Always show when there's data */}
      {(photos.length > 0 || pagination.total > 0) && (
        <div className="flex-shrink-0 border-t border-border bg-card/50 sticky bottom-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {/* Total count display like RoutePlan */}
                <div className="flex items-center gap-2">
                  <span>
                    Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
                  </span>
                  <span className="text-muted-foreground/80">
                    ({pagination.total_records || pagination.total || 0} total photos)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Rows per page */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Rows per page</label>
                  <select
                    value={pagination.per_page}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                    className="h-8 w-[80px] rounded border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={12}>12</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Page info */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                </div>

                {/* Pagination buttons - Only show if more than 1 page */}
                {pagination.last_page > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.current_page === 1}
                      className="h-8 px-3"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.last_page)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="h-8 px-3"
                    >
                      Last
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>
              <div className="w-full md:w-80 p-6 bg-gray-50 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedPhoto.title}</h3>
                  <Badge className={getCategoryColor(selectedPhoto.image_type)}>
                    {formatImageType(selectedPhoto.image_type)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Location</div>
                    <div className="text-sm sentence-case">{formatDisplayValue(selectedPhoto.village)}</div>
                    <div className="text-xs text-gray-500 sentence-case">{formatDisplayValue(selectedPhoto.district)}, {formatDisplayValue(selectedPhoto.state)}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700">Village Code</div>
                    <div className="text-sm">{selectedPhoto.village_code || 'N/A'}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700">Coordinates</div>
                    <div className="text-sm">{selectedPhoto.latitude}, {selectedPhoto.longitude}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700">Visit Date</div>
                    <div className="text-sm">{new Date(selectedPhoto.visit_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => downloadPhoto(selectedPhoto)}>
                    <Download className="h-4 w-4 mr-2" />
                    {formatDisplayValue("Download")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
