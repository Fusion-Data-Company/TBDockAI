import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeMetric, setActiveMetric] = useState<'leads' | 'revenue' | 'conversion'>('leads');

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: leadSources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['/api/analytics/lead-sources'],
  });

  const { data: pipelineAnalytics, isLoading: pipelineLoading } = useQuery({
    queryKey: ['/api/analytics/pipeline'],
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/analytics/performance'],
  });

  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
  });

  const { data: aiContent } = useQuery({
    queryKey: ['/api/ai/content'],
    queryFn: () => fetch('/api/ai/content?limit=50').then(res => res.json()),
  });

  // Process pipeline data for visualization
  const pipelineStages = [
    { name: 'New Leads', value: opportunities?.filter((o: any) => o.stage === 'new_lead').length || 0, color: '#3B82F6' },
    { name: 'Qualification', value: opportunities?.filter((o: any) => o.stage === 'qualification').length || 0, color: '#EAB308' },
    { name: 'Proposal Sent', value: opportunities?.filter((o: any) => o.stage === 'proposal_sent').length || 0, color: '#A855F7' },
    { name: 'Negotiation', value: opportunities?.filter((o: any) => o.stage === 'negotiation').length || 0, color: '#F97316' },
    { name: 'Closed Won', value: opportunities?.filter((o: any) => o.stage === 'closed_won').length || 0, color: '#22C55E' },
  ];

  // Monthly trend data (simulated based on current data)
  const monthlyTrends = [
    { month: 'Oct', leads: 89, revenue: 245000, conversions: 28 },
    { month: 'Nov', leads: 102, revenue: 312000, conversions: 35 },
    { month: 'Dec', leads: 127, revenue: 387000, conversions: 44 },
    { month: 'Jan', leads: dashboardStats?.totalLeads || 127, revenue: dashboardStats?.pipelineValue || 387000, conversions: Math.round((dashboardStats?.conversionRate || 34.8) / 100 * (dashboardStats?.totalLeads || 127)) },
  ];

  // Content performance data
  const contentTypeData = [
    { 
      name: 'Blog Posts', 
      count: aiContent?.filter((c: any) => c.contentType === 'blog_article').length || 0,
      engagement: 2840 
    },
    { 
      name: 'Newsletters', 
      count: aiContent?.filter((c: any) => c.contentType === 'email_newsletter').length || 0,
      engagement: 1650 
    },
    { 
      name: 'Social Posts', 
      count: aiContent?.filter((c: any) => c.contentType === 'social_post').length || 0,
      engagement: 3200 
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getMetricValue = (metric: string) => {
    switch (metric) {
      case 'leads':
        return dashboardStats?.totalLeads || 0;
      case 'revenue':
        return formatCurrency(dashboardStats?.pipelineValue || 0);
      case 'conversion':
        return formatPercentage(dashboardStats?.conversionRate || 0);
      default:
        return 0;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                Analytics & Reporting
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive insights into your business performance and marketing ROI
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger className="w-32" data-testid="select-timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="secondary" data-testid="button-export">
                Export Report
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="stat-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-total-leads">
                      {dashboardStats?.totalLeads || 0}
                    </p>
                    <p className="text-sm text-green-400 mt-1">
                      +{dashboardStats?.leadsGrowth || 0}% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pipeline Value</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-pipeline-value">
                      {formatCurrency(dashboardStats?.pipelineValue || 0)}
                    </p>
                    <p className="text-sm text-green-400 mt-1">
                      +{dashboardStats?.valueGrowth || 0}% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-conversion-rate">
                      {formatPercentage(dashboardStats?.conversionRate || 0)}
                    </p>
                    <p className="text-sm text-green-400 mt-1">
                      +{dashboardStats?.conversionGrowth || 0}% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-response-time">
                      {dashboardStats?.avgResponseTime || 2.4}h
                    </p>
                    <p className="text-sm text-green-400 mt-1">
                      {dashboardStats?.responseImprovement > 0 ? '+' : ''}{dashboardStats?.responseImprovement || -32}% faster
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle data-testid="text-trends-title">Performance Trends</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track key metrics over time to identify patterns and opportunities
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={activeMetric === 'leads' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveMetric('leads')}
                    data-testid="button-metric-leads"
                  >
                    Leads
                  </Button>
                  <Button
                    variant={activeMetric === 'revenue' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveMetric('revenue')}
                    data-testid="button-metric-revenue"
                  >
                    Revenue
                  </Button>
                  <Button
                    variant={activeMetric === 'conversion' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveMetric('conversion')}
                    data-testid="button-metric-conversion"
                  >
                    Conversion
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80" data-testid="chart-trends">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 32%, 25%)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                      tickFormatter={(value) => 
                        activeMetric === 'revenue' ? `$${(value / 1000)}K` : 
                        activeMetric === 'conversion' ? `${value}` : value
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(215, 40%, 12%)',
                        border: '1px solid hsl(217, 32%, 25%)',
                        borderRadius: '8px',
                        color: 'hsl(210, 40%, 98%)',
                      }}
                      formatter={(value) => [
                        activeMetric === 'revenue' ? formatCurrency(Number(value)) :
                        activeMetric === 'conversion' ? `${value} conversions` : `${value} leads`,
                        activeMetric === 'leads' ? 'Leads' :
                        activeMetric === 'revenue' ? 'Revenue' : 'Conversions'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey={activeMetric}
                      stroke="hsl(38, 42%, 65%)"
                      fill="hsl(38, 42%, 65%)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lead Sources */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-lead-sources-chart-title">Lead Sources Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Distribution of leads by acquisition channel
                </p>
              </CardHeader>
              <CardContent>
                {sourcesLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                  </div>
                ) : leadSources?.length ? (
                  <div className="h-64" data-testid="chart-lead-sources">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leadSources}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ source, percentage }) => `${source}: ${percentage}%`}
                        >
                          {leadSources.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                'hsl(38, 42%, 65%)',
                                'hsl(159, 100%, 36%)',
                                'hsl(42, 93%, 56%)',
                                'hsl(147, 79%, 42%)',
                                'hsl(341, 75%, 51%)',
                              ][index % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(215, 40%, 12%)',
                            border: '1px solid hsl(217, 32%, 25%)',
                            borderRadius: '8px',
                            color: 'hsl(210, 40%, 98%)',
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">No lead source data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pipeline Stages */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-pipeline-chart-title">Sales Pipeline Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Current opportunities by pipeline stage
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-64" data-testid="chart-pipeline-stages">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineStages}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 32%, 25%)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(215, 20%, 65%)"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="hsl(215, 20%, 65%)"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(215, 40%, 12%)',
                          border: '1px solid hsl(217, 32%, 25%)',
                          borderRadius: '8px',
                          color: 'hsl(210, 40%, 98%)',
                        }}
                        formatter={(value) => [`${value} opportunities`, 'Count']}
                      />
                      <Bar dataKey="value" fill="hsl(38, 42%, 65%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Performance & ROI Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-content-performance-title">AI Content Performance</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Engagement metrics for AI-generated marketing content
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-64" data-testid="chart-content-performance">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contentTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 32%, 25%)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(215, 20%, 65%)"
                        fontSize={12}
                      />
                      <YAxis 
                        yAxisId="left"
                        stroke="hsl(215, 20%, 65%)"
                        fontSize={12}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        stroke="hsl(215, 20%, 65%)"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(215, 40%, 12%)',
                          border: '1px solid hsl(217, 32%, 25%)',
                          borderRadius: '8px',
                          color: 'hsl(210, 40%, 98%)',
                        }}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="count" 
                        fill="hsl(38, 42%, 65%)" 
                        name="Content Count"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="engagement" 
                        fill="hsl(159, 100%, 36%)" 
                        name="Engagement"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ROI & Profitability */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-roi-title">Project ROI Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Profitability metrics and return on investment
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Project Value</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-avg-project-value">
                        {formatCurrency(pipelineAnalytics?.avgDealSize || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Close Rate</p>
                      <p className="text-2xl font-bold text-green-400" data-testid="text-close-rate-percentage">
                        {pipelineAnalytics?.closeRate || 0}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Steel Truss Docks</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">85% margin</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Dock Repairs</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div className="h-full bg-green-400 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">92% margin</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Full Rebuilds</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">78% margin</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Accessories</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div className="h-full bg-purple-400 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">95% margin</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Marketing Attribution */}
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-attribution-title">Marketing Attribution & Campaign ROI</CardTitle>
              <p className="text-sm text-muted-foreground">
                Performance metrics for marketing channels and AI-generated campaigns
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">AI Blog Content</h4>
                    <Badge className="bg-green-500/20 text-green-400">High ROI</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Articles Published</span>
                      <span className="text-foreground" data-testid="text-blog-count">
                        {aiContent?.filter((c: any) => c.contentType === 'blog_article').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Page Views</span>
                      <span className="text-foreground">1,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Leads Generated</span>
                      <span className="text-green-400">34</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost per Lead</span>
                      <span className="text-green-400">$12.50</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">Email Campaigns</h4>
                    <Badge className="bg-blue-500/20 text-blue-400">Medium ROI</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Campaigns Sent</span>
                      <span className="text-foreground" data-testid="text-email-count">
                        {aiContent?.filter((c: any) => c.contentType === 'email_newsletter').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open Rate</span>
                      <span className="text-foreground">42.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Click Rate</span>
                      <span className="text-blue-400">8.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversions</span>
                      <span className="text-blue-400">12</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground">Social Media</h4>
                    <Badge className="bg-purple-500/20 text-purple-400">Growing</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posts Published</span>
                      <span className="text-foreground" data-testid="text-social-count">
                        {aiContent?.filter((c: any) => c.contentType === 'social_post').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Reach</span>
                      <span className="text-foreground">12.4K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="text-purple-400">3.2K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profile Visits</span>
                      <span className="text-purple-400">487</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
