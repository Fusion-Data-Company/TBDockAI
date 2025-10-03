import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import KanbanBoard from "@/components/KanbanBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoImage from "@assets/business logo_edited_1759533993964.avif";

export default function Dashboard() {
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/opportunities'],
  });

  const { data: recentContacts } = useQuery({
    queryKey: ['/api/contacts'],
  });

  const { data: leadSources } = useQuery({
    queryKey: ['/api/analytics/lead-sources'],
  });

  const { data: aiContent } = useQuery({
    queryKey: ['/api/ai/content'],
    queryFn: () => fetch('/api/ai/content?limit=5').then(res => res.json()),
  });

  const stats = dashboardStats || {
    totalLeads: 0,
    pipelineValue: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    leadsGrowth: 0,
    valueGrowth: 0,
    conversionGrowth: 0,
    responseImprovement: 0
  };

  const getLeadTemperatureBadge = (temp: string) => {
    switch (temp) {
      case 'hot': return <Badge className="badge-hot">HOT</Badge>;
      case 'warm': return <Badge className="badge-warm">WARM</Badge>;
      case 'cold': return <Badge className="badge-cold">COLD</Badge>;
      default: return <Badge className="badge-cold">COLD</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const formatTime = (hours: number) => `${hours.toFixed(1)}h`;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 relative">
        {/* Logo Watermark Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 ml-64">
          <img 
            src={logoImage} 
            alt="" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-2xl opacity-[0.02] select-none"
          />
        </div>

        {/* Enhanced Header */}
        <header className="sticky top-0 z-50 backdrop-blur-glass border-b border-border/50 relative">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="animate-fade-in-scale">
              <h2 className="section-title text-foreground" data-testid="text-page-title">
                Automation Dashboard
              </h2>
              <p className="text-muted-foreground mt-1">
                Welcome back, Tyler. Here's what's happening with your projects.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="glass-button p-3" data-testid="button-notifications">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </button>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </div>
              <button className="premium-button" data-testid="button-new-lead">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New Lead
              </button>
              <img 
                src={logoImage} 
                alt="TBDock" 
                className="h-12 w-auto object-contain ml-4"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 relative z-10">
          {/* Enhanced KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Leads"
              value={stats.totalLeads.toString()}
              change={`+${stats.leadsGrowth}% this month`}
              isPositive={stats.leadsGrowth > 0}
              icon="users"
              progress={68}
            />
            <StatCard
              title="Pipeline Value"
              value={formatCurrency(stats.pipelineValue)}
              change={`+${stats.valueGrowth}% this month`}
              isPositive={stats.valueGrowth > 0}
              icon="dollar"
              progress={82}
            />
            <StatCard
              title="Conversion Rate"
              value={formatPercentage(stats.conversionRate)}
              change={`+${stats.conversionGrowth}% this month`}
              isPositive={stats.conversionGrowth > 0}
              icon="trending"
              progress={35}
            />
            <StatCard
              title="Avg Response Time"
              value={formatTime(stats.avgResponseTime)}
              change={`${stats.responseImprovement > 0 ? '+' : ''}${stats.responseImprovement}% faster`}
              isPositive={stats.responseImprovement > 0}
              icon="clock"
              progress={45}
            />
          </div>

          {/* Enhanced Sales Pipeline */}
          <div className="glass-card p-6 animate-slide-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground" data-testid="text-pipeline-title">Sales Pipeline</h3>
                <p className="text-muted-foreground mt-1">
                  Drag and drop to update lead status
                </p>
              </div>
              <button className="glass-button" data-testid="button-filter-pipeline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Filter
              </button>
            </div>
            <KanbanBoard opportunities={opportunities || []} loading={opportunitiesLoading} />
          </div>

          {/* Enhanced Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="glass-card p-6 animate-fade-in-scale">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground" data-testid="text-recent-leads-title">Recent Leads</h3>
                <button className="text-primary hover:text-primary/80 transition-colors text-sm font-medium" data-testid="link-view-all-leads">
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {recentContacts?.slice(0, 4).map((contact: any, index: number) => (
                  <div 
                    key={contact.id} 
                    className="flex items-start justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary/80 transition-all duration-300 cursor-pointer hover-lift"
                    data-testid={`card-lead-${contact.id}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">
                        {contact.firstName?.[0]}{contact.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground" data-testid={`text-lead-name-${contact.id}`}>
                          {contact.firstName} {contact.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-lead-notes-${contact.id}`}>
                          {contact.notes || 'No notes available'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {contact.leadSource} • {contact.city || 'Location not specified'}
                        </p>
                      </div>
                    </div>
                    {getLeadTemperatureBadge(contact.leadTemperature)}
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Sources */}
            <div className="glass-card p-6 animate-fade-in-scale">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground" data-testid="text-lead-sources-title">Lead Sources</h3>
                <button className="text-primary hover:text-primary/80 transition-colors text-sm font-medium" data-testid="link-view-report">
                  View Report →
                </button>
              </div>
              <div className="space-y-4">
                {leadSources?.map((source: any) => (
                  <div key={source.source}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground capitalize" data-testid={`text-source-${source.source}`}>
                        {source.source.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium text-primary" data-testid={`text-percentage-${source.source}`}>
                        {source.percentage}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )) || (
                  // Fallback data structure
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">Website Form</span>
                        <span className="text-sm font-medium text-primary">42%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">Referrals</span>
                        <span className="text-sm font-medium text-green-400">28%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: '28%', 
                            background: 'linear-gradient(90deg, #22c55e, #16a34a)' 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">Social Media</span>
                        <span className="text-sm font-medium text-blue-400">18%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: '18%', 
                            background: 'linear-gradient(90deg, #3b82f6, #2563eb)' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Leads This Month</span>
                    <span className="text-xl font-bold text-foreground" data-testid="text-total-leads">
                      {stats.totalLeads}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Marketing Performance */}
          <div className="glass-card p-6 animate-slide-in-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground" data-testid="text-marketing-title">Marketing Performance</h3>
                <p className="text-muted-foreground mt-1">
                  AI-generated content and engagement metrics
                </p>
              </div>
              <button className="glass-button" data-testid="button-marketing-timeframe">
                Last 30 Days
              </button>
            </div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-secondary/50 rounded-xl p-6 hover-lift">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Blog Posts Published</span>
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1" data-testid="text-blog-posts-count">
                    {aiContent?.filter((c: any) => c.contentType === 'blog_article').length || 0}
                  </p>
                  <p className="text-xs text-green-400 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                    +2 from last month
                  </p>
                </div>

                <div className="bg-secondary/50 rounded-xl p-6 hover-lift">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Email Campaigns Sent</span>
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1" data-testid="text-email-campaigns-count">
                    {aiContent?.filter((c: any) => c.contentType === 'email_newsletter').length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">42% open rate</p>
                </div>

                <div className="bg-secondary/50 rounded-xl p-6 hover-lift">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Social Posts</span>
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1" data-testid="text-social-posts-count">
                    {aiContent?.filter((c: any) => c.contentType === 'social_post').length || 0}
                  </p>
                  <p className="text-xs text-green-400 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                    3.2K engagement
                  </p>
                </div>
              </div>

              {/* Recent Content */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4">Recent AI-Generated Content</h4>
                <div className="space-y-3">
                  {aiContent?.slice(0, 3).map((content: any, index: number) => (
                    <div key={content.id} className="flex items-start space-x-3 p-4 bg-secondary/50 rounded-xl hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground" data-testid={`text-content-title-${content.id}`}>
                          {content.title || 'Untitled Content'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {content.contentType} • {content.agentType} Agent • {content.status}
                        </p>
                      </div>
                      <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                        {content.status}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No AI-generated content yet. Start creating with the AI Agents tab.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
