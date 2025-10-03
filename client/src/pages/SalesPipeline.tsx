import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function SalesPipeline() {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['/api/opportunities'],
  });

  const { data: pipelineAnalytics } = useQuery({
    queryKey: ['/api/analytics/pipeline'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
                Sales Pipeline
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your sales opportunities and track progress through each stage
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" data-testid="button-filter">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Filter
              </Button>
              <Button data-testid="button-new-opportunity">
                + New Opportunity
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Pipeline Stats */}
          {pipelineAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-total-pipeline">
                        {formatCurrency(pipelineAnalytics.totalValue || 0)}
                      </p>
                    </div>
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Opportunities</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-active-opportunities">
                        {pipelineAnalytics.activeCount || 0}
                      </p>
                    </div>
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Deal Size</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-avg-deal">
                        {formatCurrency(pipelineAnalytics.avgDealSize || 0)}
                      </p>
                    </div>
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Close Rate</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-close-rate">
                        {pipelineAnalytics.closeRate || 0}%
                      </p>
                    </div>
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Kanban Board */}
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-kanban-title">Pipeline Board</CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag and drop opportunities between stages to update their progress
              </p>
            </CardHeader>
            <CardContent>
              <KanbanBoard opportunities={opportunities || []} loading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
