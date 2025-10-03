import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SocialPost {
  id: number;
  platform: string;
  content: string;
  imageUrl?: string;
  hashtags?: string[];
  scheduledFor: string;
  status: string;
  createdAt: string;
}

export default function SocialMediaScheduler() {
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    platform: '',
    content: '',
    imageUrl: '',
    hashtags: '',
    scheduledFor: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery<SocialPost[]>({
    queryKey: ['/api/social-posts'],
    queryFn: () => fetch('/api/social-posts').then(res => res.json()),
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest('POST', '/api/social-posts', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
      setIsCreateDialogOpen(false);
      setNewPost({ platform: '', content: '', imageUrl: '', hashtags: '', scheduledFor: '' });
      toast({
        title: 'Post scheduled',
        description: 'Your social media post has been scheduled successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to schedule post.',
        variant: 'destructive',
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/social-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
      toast({
        title: 'Post deleted',
        description: 'Social media post has been removed.',
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.platform || !newPost.content || !newPost.scheduledFor) {
      toast({
        title: 'Missing information',
        description: 'Please fill in platform, content, and schedule time.',
        variant: 'destructive',
      });
      return;
    }

    const hashtags = newPost.hashtags
      ? newPost.hashtags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    createPostMutation.mutate({
      ...newPost,
      hashtags,
      scheduledFor: new Date(newPost.scheduledFor).toISOString(),
    });
  };

  // Calendar view helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getPostsForDate = (date: Date) => {
    if (!posts) return [];
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter(post => post.scheduledFor.startsWith(dateStr));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedDate);

  const previousMonth = () => {
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(year, month + 1, 1));
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      linkedin: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
      twitter: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    };
    return colors[platform.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'linkedin':
        return '💼';
      case 'twitter':
        return '🐦';
      default:
        return '📱';
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-glass border-b border-border/50">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="animate-fade-in-scale">
              <h2 className="section-title text-foreground">Social Media Scheduler</h2>
              <p className="text-muted-foreground mt-1">
                Plan and schedule your social media content
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-secondary/30 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === 'calendar'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  List
                </button>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <button className="premium-button">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Schedule Post
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Schedule New Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Platform</label>
                      <Select value={newPost.platform} onValueChange={(value) => setNewPost({ ...newPost, platform: value })}>
                        <SelectTrigger className="bg-secondary/50 border-border/50">
                          <SelectValue placeholder="Select platform..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">📘 Facebook</SelectItem>
                          <SelectItem value="instagram">📷 Instagram</SelectItem>
                          <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                          <SelectItem value="twitter">🐦 Twitter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Content</label>
                      <Textarea
                        placeholder="What's happening? Share your update..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        rows={4}
                        className="bg-secondary/50 border-border/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Hashtags (comma-separated)</label>
                      <Input
                        placeholder="#dock, #waterfront, #construction"
                        value={newPost.hashtags}
                        onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })}
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Image URL (optional)</label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={newPost.imageUrl}
                        onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Schedule For</label>
                      <Input
                        type="datetime-local"
                        value={newPost.scheduledFor}
                        onChange={(e) => setNewPost({ ...newPost, scheduledFor: e.target.value })}
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>

                    <Button
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending}
                      className="w-full premium-button"
                    >
                      {createPostMutation.isPending ? 'Scheduling...' : 'Schedule Post'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {activeView === 'calendar' ? (
            <div className="glass-card p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button onClick={previousMonth} variant="outline" size="sm" className="bg-secondary/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </Button>
                  <Button onClick={() => setSelectedDate(new Date())} variant="outline" size="sm" className="bg-secondary/50">
                    Today
                  </Button>
                  <Button onClick={nextMonth} variant="outline" size="sm" className="bg-secondary/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}

                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);
                  const dayPosts = getPostsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={day}
                      className={`aspect-square border border-border/30 rounded-lg p-2 hover:border-primary/50 transition-colors ${
                        isToday ? 'bg-primary/10 border-primary/50' : 'bg-secondary/20'
                      }`}
                    >
                      <div className="text-sm font-semibold text-foreground mb-1">{day}</div>
                      <div className="space-y-1">
                        {dayPosts.slice(0, 2).map(post => (
                          <div
                            key={post.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getPlatformColor(post.platform)}`}
                          >
                            {getPlatformIcon(post.platform)} {post.content.substring(0, 15)}...
                          </div>
                        ))}
                        {dayPosts.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{dayPosts.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                  <p className="mt-2 text-muted-foreground">Loading posts...</p>
                </div>
              ) : posts && posts.length > 0 ? (
                posts.map(post => (
                  <div key={post.id} className="glass-card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-3xl">{getPlatformIcon(post.platform)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getPlatformColor(post.platform)}>
                              {post.platform}
                            </Badge>
                            <Badge variant="outline">
                              {new Date(post.scheduledFor).toLocaleString()}
                            </Badge>
                          </div>
                          <p className="text-foreground mb-2">{post.content}</p>
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.map((tag, i) => (
                                <span key={i} className="text-xs text-primary">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deletePostMutation.mutate(post.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No scheduled posts</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
