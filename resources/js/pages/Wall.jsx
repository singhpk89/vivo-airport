import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Image,
  Video,
  Link as LinkIcon,
  Send,
  Clock,
  Pin,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const Wall = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    setPosts([
      {
        id: 1,
        author: {
          name: 'John Smith',
          role: 'Regional Manager',
          avatar: '/img/avatars/john.jpg'
        },
        content: 'Excited to announce that our Q3 promoter performance has exceeded targets by 25%! Great work team! 🎉',
        timestamp: '2 hours ago',
        likes: 12,
        comments: 3,
        isPinned: true,
        type: 'announcement'
      },
      {
        id: 2,
        author: {
          name: 'Sarah Johnson',
          role: 'Field Supervisor',
          avatar: '/img/avatars/sarah.jpg'
        },
        content: 'New training materials are now available in the resources section. All promoters should complete the updated modules by end of week.',
        timestamp: '4 hours ago',
        likes: 8,
        comments: 5,
        attachments: [
          { type: 'document', name: 'Training_Guide_v2.pdf' }
        ]
      },
      {
        id: 3,
        author: {
          name: 'Mike Chen',
          role: 'Analytics Lead',
          avatar: '/img/avatars/mike.jpg'
        },
        content: 'Weekly performance report shows impressive growth in urban areas. Route optimization is working well!',
        timestamp: '1 day ago',
        likes: 15,
        comments: 2,
        type: 'report'
      }
    ]);
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;

    setIsPosting(true);

    // Simulate API call
    setTimeout(() => {
      const post = {
        id: posts.length + 1,
        author: {
          name: user?.name || 'You',
          role: user?.roles?.[0]?.name || user?.roles?.[0] || 'Admin',
          avatar: '/img/avatars/default.jpg'
        },
        content: newPost,
        timestamp: 'Just now',
        likes: 0,
        comments: 0
      };

      setPosts([post, ...posts]);
      setNewPost('');
      setIsPosting(false);
    }, 1000);
  };

  const PostCard = ({ post }) => (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-6 space-y-4 hover:shadow-md transition-shadow",
      post.isPinned && "border-blue-200 bg-blue-50/30"
    )}>
      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {post.author.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              {post.isPinned && (
                <Pin className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{post.author.role}</span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {post.timestamp}
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <p className="text-gray-800 leading-relaxed">{post.content}</p>

        {/* Attachments */}
        {post.attachments && (
          <div className="space-y-2">
            {post.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <LinkIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{attachment.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Post Type Badge */}
        {post.type && (
          <div className="flex">
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              post.type === 'announcement' && "bg-green-100 text-green-800",
              post.type === 'report' && "bg-blue-100 text-blue-800"
            )}>
              {post.type === 'announcement' && <TrendingUp className="h-3 w-3 mr-1" />}
              {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
            <Heart className="h-4 w-4 mr-2" />
            {post.likes}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
            <MessageCircle className="h-4 w-4 mr-2" />
            {post.comments}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Company Wall</h1>
        </div>
        <p className="text-gray-600">Stay updated with company news, announcements, and team updates.</p>
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening? Share updates, announcements, or insights..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Image className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <LinkIcon className="h-4 w-4 mr-2" />
                Link
              </Button>
            </div>

            <Button
              onClick={handlePost}
              disabled={!newPost.trim() || isPosting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="w-full">
          Load More Posts
        </Button>
      </div>
    </div>
  );
};

export default Wall;
