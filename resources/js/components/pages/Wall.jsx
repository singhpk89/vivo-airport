import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  MessageCircle,
  Clock,
  Pin,
  Eye,
  ThumbsUp,
  ChevronDown,
  Plus,
  Filter,
  Search,
  Bell,
  Users,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

const Wall = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const mockPosts = [
    {
      id: 1,
      type: 'announcement',
      title: 'Q3 Performance Results',
      content: 'Excellent work team! We\'ve exceeded our Q3 targets by 15%. Special recognition goes to our field teams for outstanding performance.',
      author: {
        name: 'Sarah Johnson',
        role: 'Regional Manager',
        avatar: '/api/placeholder/40/40'
      },
      timestamp: '2 hours ago',
      isPinned: true,
      reactions: { likes: 24, hearts: 8 },
      comments: 12,
      views: 156,
      tags: ['performance', 'achievement']
    },
    {
      id: 2,
      type: 'update',
      title: 'New Training Module Available',
      content: 'The updated customer engagement training module is now live. All field promoters are required to complete it by end of month.',
      author: {
        name: 'Mike Chen',
        role: 'Training Coordinator',
        avatar: '/api/placeholder/40/40'
      },
      timestamp: '5 hours ago',
      isPinned: false,
      reactions: { likes: 18, hearts: 3 },
      comments: 7,
      views: 89,
      tags: ['training', 'mandatory']
    },
    {
      id: 3,
      type: 'news',
      title: 'System Maintenance Scheduled',
      content: 'Planned maintenance window this Saturday 2-4 AM. Mobile app will be temporarily unavailable during this time.',
      author: {
        name: 'IT Support',
        role: 'System Administrator',
        avatar: '/api/placeholder/40/40'
      },
      timestamp: '1 day ago',
      isPinned: false,
      reactions: { likes: 12, hearts: 1 },
      comments: 3,
      views: 234,
      tags: ['maintenance', 'system']
    },
    {
      id: 4,
      type: 'celebration',
      title: 'Employee of the Month',
      content: 'Congratulations to Priya Sharma for being selected as Employee of the Month! Her dedication to customer service is exemplary.',
      author: {
        name: 'HR Department',
        role: 'Human Resources',
        avatar: '/api/placeholder/40/40'
      },
      timestamp: '2 days ago',
      isPinned: false,
      reactions: { likes: 45, hearts: 28 },
      comments: 18,
      views: 312,
      tags: ['recognition', 'achievement']
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const getPostTypeColor = (type) => {
    const colors = {
      announcement: 'bg-blue-100 text-blue-800 border-blue-200',
      update: 'bg-orange-100 text-orange-800 border-orange-200',
      news: 'bg-purple-100 text-purple-800 border-purple-200',
      celebration: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatTime = (timestamp) => {
    return timestamp;
  };

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.type === filter;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <MessageSquare className="mr-3 h-8 w-8" />
              Company Wall
            </h1>
            <p className="text-blue-100 mt-2">Stay updated with the latest news and announcements</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{posts.length}</div>
            <div className="text-blue-100 text-sm">Total Posts</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'announcement', 'update', 'news', 'celebration'].map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className={cn(
            "transition-all duration-200 hover:shadow-lg",
            post.isPinned && "ring-2 ring-yellow-200 bg-yellow-50"
          )}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full bg-gray-200"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                      {post.isPinned && (
                        <Pin className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{post.author.role}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{formatTime(post.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getPostTypeColor(post.type)}>
                  {post.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                  <p className="text-gray-700 leading-relaxed">{post.content}</p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{post.reactions.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.reactions.hearts}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-emerald-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{post.views} views</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'No posts match the selected filter'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Wall;
