import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import logoImage from "@assets/business logo_edited_1759533993964.avif";

interface SocialPost {
  id: number;
  platform: string;
  content: string;
  imageUrl?: string;
  hashtags?: string[];
  scheduledFor: string | null;
  status: string;
  createdAt: string;
}

export default function SocialMediaScheduler() {
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('list');
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

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      facebook: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      linkedin: 'bg-blue-600/10 text-blue-300 border-blue-600/30',
      twitter: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    };
    return colors[platform?.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      default: return '📱';
    }
  };

  const sortedPosts = posts?.sort((a, b) => {
    const dateA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0;
    const dateB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0;
    return dateA - dateB;
  }) || [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 relative">
        {/* Logo Watermark */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 ml-64">
          <img
            src={logoImage}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-2xl opacity-[0.02] select-none"
          />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-glass border-b border-border/50 relative">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="animate-fade-in-scale">
              <h1 className="section-title gradient-text">Social Media Scheduler</h1>
              <p className="text-muted-foreground mt-2 font-medium">
                Plan, schedule, and manage your social media content across all platforms
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-primary font-medium">{sortedPosts.length} Scheduled</span>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <button className="premium-button">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Schedule Post
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold gradient-text">Schedule New Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 py-6">
                    {/* Platform Selection - Premium Cards */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-3 block flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Select Platform
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { value: 'facebook', icon: '📘', label: 'Facebook' },
                          { value: 'instagram', icon: '📷', label: 'Instagram' },
                          { value: 'linkedin', icon: '💼', label: 'LinkedIn' },
                          { value: 'twitter', icon: '🐦', label: 'Twitter' },
                        ].map((platform) => (
                          <button
                            key={platform.value}
                            onClick={() => setNewPost({ ...newPost, platform: platform.value })}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              newPost.platform === platform.value
                                ? 'bg-primary/10 border-primary shadow-lg scale-105'
                                : 'bg-secondary/30 border-border/30 hover:border-primary/30'
                            }`}
                          >
                            <div className="text-3xl mb-2">{platform.icon}</div>
                            <div className="text-xs font-bold">{platform.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-3 block">Post Content</label>
                      <Textarea
                        placeholder="What's your message? Share updates, insights, or promotions..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        rows={5}
                        className="bg-secondary/50 border-border/50 resize-none text-base"
                      />
                      <div className="mt-2 text-xs text-muted-foreground">{newPost.content.length} characters</div>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-3 block">Hashtags</label>
                      <Input
                        placeholder="dock, waterfront, construction"
                        value={newPost.hashtags}
                        onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })}
                        className="bg-secondary/50 border-border/50"
                      />
                      <div className="mt-2 text-xs text-muted-foreground">Separate with commas (no # needed)</div>
                    </div>

                    {/* Schedule Time */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-3 block">Schedule For</label>
                      <Input
                        type="datetime-local"
                        value={newPost.scheduledFor}
                        onChange={(e) => setNewPost({ ...newPost, scheduledFor: e.target.value })}
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-3 block">Image URL <span className="text-xs font-normal text-muted-foreground">(Optional)</span></label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={newPost.imageUrl}
                        onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>

                    <button
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending}
                      className="premium-button w-full h-12 text-base"
                    >
                      {createPostMutation.isPending ? (
                        <>
                          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          Schedule Post
                        </>
                      )}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
              <img
                src={logoImage}
                alt="TBDock"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6 relative z-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📘</span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Facebook</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {sortedPosts.filter(p => p.platform === 'facebook').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Instagram</div>
                  <div className="text-2xl font-bold text-pink-400">
                    {sortedPosts.filter(p => p.platform === 'instagram').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">LinkedIn</div>
                  <div className="text-2xl font-bold text-blue-300">
                    {sortedPosts.filter(p => p.platform === 'linkedin').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🐦</span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Twitter</div>
                  <div className="text-2xl font-bold text-sky-400">
                    {sortedPosts.filter(p => p.platform === 'twitter').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="glass-card p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Scheduled Posts</h3>
              <p className="text-muted-foreground">All your upcoming social media posts in chronological order</p>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                <p className="text-muted-foreground font-medium">Loading posts...</p>
              </div>
            ) : sortedPosts.length > 0 ? (
              <div className="space-y-4">
                {sortedPosts.map(post => (
                  <div key={post.id} className="group relative overflow-hidden bg-secondary/30 border-2 border-border/30 rounded-xl p-6 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl">{getPlatformIcon(post.platform)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge className={`${getPlatformColor(post.platform)} border px-3 py-1 font-bold`}>
                              {post.platform?.toUpperCase()}
                            </Badge>
                            {post.scheduledFor && (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span className="font-medium">{new Date(post.scheduledFor).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-foreground leading-relaxed mb-3">{post.content}</p>
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.hashtags.map((tag, i) => (
                                <span key={i} className="text-sm text-primary font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {post.imageUrl && (
                            <div className="mt-3 text-xs text-muted-foreground flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              Image attached
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deletePostMutation.mutate(post.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Scheduled Posts</h3>
                <p className="text-muted-foreground mb-6">Start scheduling your social media content to see it here</p>
                <button onClick={() => setIsCreateDialogOpen(true)} className="premium-button">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Schedule Your First Post
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
