import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    MessageSquare,
    Plus,
    Eye,
    Star,
    Clock,
    CheckCircle,
    AlertCircle,
    Search,
    Filter,
    Download,
    RefreshCw,
    User,
    Calendar,
    Tag,
    TrendingUp,
    BarChart3,
    Mail,
    Phone,
    FileText,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    ChevronRight,
    Archive,
    Trash2,
    Settings,
    Smartphone
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/Label';

const FeedbackManagement = ({ onViewFeedback, onCreateVivoExperience }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsOpen, setStatsOpen] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [dateRange, setDateRange] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // View mode
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Sort
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchFeedbacks = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/feedbacks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFeedbacks(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleCreateVivoExperience = useCallback(() => {
        if (onCreateVivoExperience) {
            onCreateVivoExperience();
        }
    }, [onCreateVivoExperience]);

    const handleViewFeedback = useCallback((feedback) => {
        if (onViewFeedback) {
            onViewFeedback(feedback);
        }
    }, [onViewFeedback]);

    // Filter and search feedbacks
    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter(feedback => {
            const matchesSearch = search === '' ||
                feedback.subject?.toLowerCase().includes(search.toLowerCase()) ||
                feedback.message?.toLowerCase().includes(search.toLowerCase()) ||
                feedback.user?.name?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || feedback.category === categoryFilter;
            const matchesRating = ratingFilter === 'all' || feedback.rating?.toString() === ratingFilter;
            const matchesPriority = priorityFilter === 'all' || feedback.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesCategory && matchesRating && matchesPriority;
        });
    }, [feedbacks, search, statusFilter, categoryFilter, ratingFilter, priorityFilter]);

    // Sort feedbacks
    const sortedFeedbacks = useMemo(() => {
        return [...filteredFeedbacks].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'created_at') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }, [filteredFeedbacks, sortBy, sortOrder]);

    // Paginate feedbacks
    const totalPages = Math.ceil(sortedFeedbacks.length / itemsPerPage);
    const paginatedFeedbacks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedFeedbacks.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedFeedbacks, currentPage, itemsPerPage]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'in_progress': return 'bg-blue-500';
            case 'resolved': return 'bg-green-500';
            case 'closed': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderStarRating = (rating) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            pages.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                    className="mx-1"
                >
                    {i}
                </Button>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {pages}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading feedbacks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-blue-600" />
                        User Feedback Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        View and analyze user feedback and suggestions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setStatsOpen(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </Button>
                    <Button
                        onClick={handleCreateVivoExperience}
                        className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    >
                        <Smartphone className="h-4 w-4" />
                        Vivo Experience
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                            <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {feedbacks.filter(f => f.status === 'pending').length}
                            </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-green-600">
                                {feedbacks.filter(f => f.status === 'resolved').length}
                            </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {feedbacks.length > 0 ?
                                    (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
                                    : '0.0'
                                }
                            </p>
                        </div>
                        <Star className="h-8 w-8 text-purple-600" />
                    </div>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search feedback..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                        <Button
                            variant="outline"
                            onClick={fetchFeedbacks}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>

                    {filtersOpen && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
                            <div>
                                <Label>Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="bug">Bug Report</SelectItem>
                                        <SelectItem value="feature">Feature Request</SelectItem>
                                        <SelectItem value="support">Support</SelectItem>
                                        <SelectItem value="complaint">Complaint</SelectItem>
                                        <SelectItem value="suggestion">Suggestion</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Rating</Label>
                                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Ratings" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ratings</SelectItem>
                                        <SelectItem value="5">5 Stars</SelectItem>
                                        <SelectItem value="4">4 Stars</SelectItem>
                                        <SelectItem value="3">3 Stars</SelectItem>
                                        <SelectItem value="2">2 Stars</SelectItem>
                                        <SelectItem value="1">1 Star</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Priorities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Sort By</Label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at">Date Created</SelectItem>
                                        <SelectItem value="rating">Rating</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="priority">Priority</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Feedback List */}
            <Card className="p-6">
                {paginatedFeedbacks.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                        <p className="text-gray-600 mb-4">
                            {search || statusFilter !== 'all' || categoryFilter !== 'all' || ratingFilter !== 'all' || priorityFilter !== 'all'
                                ? "Try adjusting your filters"
                                : "No feedback has been submitted yet"}
                        </p>
                        <Button onClick={handleCreateVivoExperience} className="bg-purple-600 hover:bg-purple-700">
                            <Smartphone className="h-4 w-4 mr-2" />
                            Create Vivo Experience
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paginatedFeedbacks.map((feedback) => (
                            <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">{feedback.subject}</h3>
                                            <Badge className={`${getStatusColor(feedback.status)} text-white`}>
                                                {feedback.status}
                                            </Badge>
                                            <Badge className={getPriorityColor(feedback.priority)}>
                                                {feedback.priority}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {feedback.user?.name || 'Anonymous'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Tag className="h-4 w-4" />
                                                {feedback.category}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(feedback.created_at).toLocaleDateString()}
                                            </div>
                                            {feedback.rating && (
                                                <div className="flex items-center gap-1">
                                                    {renderStarRating(feedback.rating)}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-sm line-clamp-2">{feedback.message}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewFeedback(feedback)}
                                            className="flex items-center gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedFeedbacks.length)} of {sortedFeedbacks.length} feedbacks
                        </p>
                        {renderPagination()}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default FeedbackManagement;
