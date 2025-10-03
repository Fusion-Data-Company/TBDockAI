import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Marketing() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'content' | 'automation'>('campaigns');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: '',
    subject: '',
    content: '',
    targetAudience: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/marketing/campaigns'],
  });

  const { data: aiContent, isLoading: contentLoading } = useQuery({
    queryKey: ['/api/ai/content'],
    queryFn: () => fetch('/api/ai/content?limit=20').then(res => res.json()),
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return apiRequest('POST', '/api/marketing/campaigns', campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
      setIsDialogOpen(false);
      setNewCampaign({ name: '', type: '', subject: '', content: '', targetAudience: '' });
      toast({
        title: "Campaign created",
        description: "Marketing campaign has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign.",
        variant: "destructive",
      });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async (data: { agentType: string; prompt: string; contentType?: string }) => {
      return apiRequest('POST', '/api/ai/generate-content', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/content'] });
      toast({
        title: "Content generated",
        description: "AI content has been generated successfully.",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.type) {
      toast({
        title: "Missing information",
        description: "Please fill in campaign name and type.",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate({
      ...newCampaign,
      status: 'draft',
      generatedByAI: false,
    });
  };

  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400">COMPLETED</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-400">SCHEDULED</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400">DRAFT</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{status?.toUpperCase()}</Badge>;
    }
  };

  const getContentStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-400">PUBLISHED</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-500/20 text-blue-400">REVIEWED</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400">DRAFT</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{status?.toUpperCase()}</Badge>;
    }
  };

  const quickPrompts = [
    "Create a spring dock maintenance newsletter highlighting seasonal services and tips",
    "Write a Facebook post about our steel truss dock construction with before/after photos",
    "Generate a blog article about choosing the right materials for North Idaho lake docks",
    "Create an email campaign promoting our emergency dock repair services for storm season",
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                Marketing & Content
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage campaigns, AI-generated content, and marketing automation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-campaign">
                    + New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Marketing Campaign</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Campaign Name</label>
                        <Input
                          placeholder="Spring Dock Season Campaign"
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                          data-testid="input-campaign-name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Campaign Type</label>
                        <Select 
                          value={newCampaign.type} 
                          onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value })}
                        >
                          <SelectTrigger data-testid="select-campaign-type">
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email Campaign</SelectItem>
                            <SelectItem value="sms">SMS Campaign</SelectItem>
                            <SelectItem value="social">Social Media Campaign</SelectItem>
                            <SelectItem value="blog">Blog Series</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject Line</label>
                      <Input
                        placeholder="Get Your Dock Ready for Summer!"
                        value={newCampaign.subject}
                        onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                        data-testid="input-campaign-subject"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Target Audience</label>
                      <Input
                        placeholder="Hot leads, Past customers, Newsletter subscribers"
                        value={newCampaign.targetAudience}
                        onChange={(e) => setNewCampaign({ ...newCampaign, targetAudience: e.target.value })}
                        data-testid="input-campaign-audience"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content</label>
                      <Textarea
                        placeholder="Campaign content or description..."
                        value={newCampaign.content}
                        onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                        rows={4}
                        data-testid="textarea-campaign-content"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateCampaign}
                        disabled={createCampaignMutation.isPending}
                        data-testid="button-create-campaign"
                      >
                        {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Marketing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-active-campaigns">
                      {campaigns?.filter((c: any) => c.status === 'scheduled' || c.status === 'sent').length || 0}
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Content Generated</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-ai-content-count">
                      {aiContent?.length || 0}
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Open Rate</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-open-rate">
                      42.3%
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Social Engagement</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-social-engagement">
                      3.2K
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex space-x-8">
              <button
                className={`tab-button ${activeTab === 'campaigns' ? 'active' : ''}`}
                onClick={() => setActiveTab('campaigns')}
                data-testid="button-tab-campaigns"
              >
                Marketing Campaigns
              </button>
              <button
                className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveTab('content')}
                data-testid="button-tab-content"
              >
                AI Content Library
              </button>
              <button
                className={`tab-button ${activeTab === 'automation' ? 'active' : ''}`}
                onClick={() => setActiveTab('automation')}
                data-testid="button-tab-automation"
              >
                Quick Generation
              </button>
            </div>
          </div>

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-campaigns-title">
                  Marketing Campaigns ({campaigns?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-2 text-muted-foreground">Loading campaigns...</p>
                  </div>
                ) : campaigns?.length ? (
                  <div className="space-y-4">
                    {campaigns.map((campaign: any) => (
                      <div 
                        key={campaign.id} 
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-muted transition-colors"
                        data-testid={`card-campaign-${campaign.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground" data-testid={`text-campaign-name-${campaign.id}`}>
                              {campaign.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Type: {campaign.type}</span>
                              {campaign.targetAudience && (
                                <span>Audience: {campaign.targetAudience}</span>
                              )}
                              <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                            </div>
                            {campaign.subject && (
                              <p className="text-sm text-muted-foreground mt-1" data-testid={`text-campaign-subject-${campaign.id}`}>
                                "{campaign.subject}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {campaign.generatedByAI && (
                            <Badge variant="outline" className="text-primary border-primary/50">
                              AI Generated
                            </Badge>
                          )}
                          {getCampaignStatusBadge(campaign.status || 'draft')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                    </svg>
                    <p className="text-muted-foreground" data-testid="text-no-campaigns">No marketing campaigns yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Create your first campaign to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-content-title">
                  AI Content Library ({aiContent?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-2 text-muted-foreground">Loading content...</p>
                  </div>
                ) : aiContent?.length ? (
                  <div className="space-y-6">
                    {aiContent.map((content: any) => (
                      <Card key={content.id} className="bg-secondary" data-testid={`card-content-${content.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg" data-testid={`text-content-title-${content.id}`}>
                                {content.title || 'Untitled Content'}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {content.agentType} Agent • {content.contentType || 'General'} • {content.model}
                              </p>
                            </div>
                            {getContentStatusBadge(content.status || 'draft')}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {content.generatedContent ? (
                            <div className="space-y-4">
                              <div className="p-4 bg-card border border-border rounded-lg max-h-96 overflow-y-auto">
                                <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                                  {content.generatedContent}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                                <span>Created: {new Date(content.createdAt).toLocaleDateString()}</span>
                                {content.publishedAt && (
                                  <span>Published: {new Date(content.publishedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <p className="text-muted-foreground italic">No content generated yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-muted-foreground" data-testid="text-no-content">No AI content generated yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Use the AI Agents tab to generate your first content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Generation Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-quick-gen-title">Quick Content Generation</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Use these pre-made prompts to quickly generate marketing content
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickPrompts.map((prompt, index) => (
                      <div 
                        key={index} 
                        className="p-4 bg-secondary rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => {
                          const agentType = prompt.includes('newsletter') ? 'newsletter' :
                                           prompt.includes('Facebook') ? 'social' :
                                           prompt.includes('blog') ? 'blog' :
                                           prompt.includes('email') ? 'newsletter' : 'blog';
                          
                          generateContentMutation.mutate({
                            agentType,
                            prompt,
                            contentType: agentType === 'social' ? 'social_post' : 
                                        agentType === 'newsletter' ? 'email_newsletter' : 'blog_article'
                          });
                        }}
                        data-testid={`card-quick-prompt-${index}`}
                      >
                        <p className="text-sm text-foreground" data-testid={`text-prompt-${index}`}>
                          {prompt}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-xs">
                            {prompt.includes('newsletter') ? 'Newsletter' :
                             prompt.includes('Facebook') ? 'Social Media' :
                             prompt.includes('blog') ? 'Blog' : 'Email'}
                          </Badge>
                          <Button size="sm" variant="ghost" disabled={generateContentMutation.isPending}>
                            {generateContentMutation.isPending ? 'Generating...' : 'Generate'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
