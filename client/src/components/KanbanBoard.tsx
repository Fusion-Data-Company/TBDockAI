import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Opportunity {
  id: number;
  name: string;
  value: string;
  stage: string;
  contactId?: number;
  probability?: number;
  expectedCloseDate?: string;
  createdAt: string;
  contact?: {
    firstName: string;
    lastName: string;
  };
}

interface KanbanBoardProps {
  opportunities: Opportunity[];
  loading: boolean;
}

const STAGES = [
  {
    id: 'new_lead',
    label: 'New Leads',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: '🎯'
  },
  {
    id: 'qualification',
    label: 'Qualification',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    icon: '🔍'
  },
  {
    id: 'proposal_sent',
    label: 'Proposal',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    icon: '📄'
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    icon: '🤝'
  },
  {
    id: 'closed_won',
    label: 'Closed Won',
    color: 'bg-green-500',
    lightColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    icon: '✅'
  },
];

export default function KanbanBoard({ opportunities, loading }: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<Opportunity | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const { toast } = useToast();

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: string }) =>
      apiRequest('PATCH', `/api/opportunities/${id}`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/pipeline'] });
      toast({
        title: 'Stage updated',
        description: 'Opportunity moved successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update stage',
        variant: 'destructive',
      });
    },
  });

  const handleDragStart = (e: React.DragEvent, opportunity: Opportunity) => {
    setDraggedCard(opportunity);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedCard && draggedCard.stage !== newStage) {
      updateStageMutation.mutate({ id: draggedCard.id, stage: newStage });
    }
    setDraggedCard(null);
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stage === stageId);
  };

  const getStageValue = (stageId: string) => {
    const stageOpps = getOpportunitiesByStage(stageId);
    return stageOpps.reduce((sum, opp) => sum + parseFloat(opp.value || '0'), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Progress Bar */}
      <div className="relative h-3 bg-secondary/30 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          {STAGES.map((stage, idx) => {
            const stageOpps = getOpportunitiesByStage(stage.id);
            const percentage = opportunities.length > 0
              ? (stageOpps.length / opportunities.length) * 100
              : 0;

            return (
              <div
                key={stage.id}
                className={`${stage.color} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageOpps = getOpportunitiesByStage(stage.id);
          const stageValue = getStageValue(stage.id);
          const isDragOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80"
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className={`glass-card p-4 mb-3 ${isDragOver ? `${stage.lightColor} ${stage.borderColor} border-2` : ''} transition-all duration-200`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{stage.icon}</span>
                    <h3 className="font-bold text-foreground text-lg">{stage.label}</h3>
                  </div>
                  <Badge variant="secondary" className={`${stage.lightColor} ${stage.textColor} border-0`}>
                    {stageOpps.length}
                  </Badge>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold ${stage.textColor}`}>
                    {formatCurrency(stageValue)}
                  </span>
                  <span className="text-xs text-muted-foreground">total value</span>
                </div>
              </div>

              {/* Cards Container */}
              <div className={`space-y-3 min-h-[400px] p-2 rounded-xl ${isDragOver ? `${stage.lightColor}` : ''} transition-colors duration-200`}>
                {stageOpps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className={`w-16 h-16 ${stage.lightColor} rounded-full flex items-center justify-center mb-3`}>
                      <svg className={`w-8 h-8 ${stage.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">No opportunities yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Drag cards here</p>
                  </div>
                ) : (
                  stageOpps.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opportunity)}
                      className={`group glass-card p-4 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all duration-200 border ${stage.borderColor} hover:shadow-lg ${
                        draggedCard?.id === opportunity.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground pr-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {opportunity.name}
                        </h4>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-secondary/50 rounded">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                          </svg>
                        </button>
                      </div>

                      {/* Card Value */}
                      <div className="mb-3">
                        <div className={`inline-flex items-center px-3 py-1.5 ${stage.lightColor} ${stage.borderColor} border rounded-lg`}>
                          <svg className={`w-4 h-4 ${stage.textColor} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className={`font-bold ${stage.textColor} text-lg`}>
                            {formatCurrency(opportunity.value)}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      {opportunity.contact && (
                        <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                          <span className="truncate">
                            {opportunity.contact.firstName} {opportunity.contact.lastName}
                          </span>
                        </div>
                      )}

                      {/* Probability & Date */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        {opportunity.probability !== undefined && (
                          <div className="flex items-center space-x-1">
                            <div className="w-16 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${stage.color}`}
                                style={{ width: `${opportunity.probability}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{opportunity.probability}%</span>
                          </div>
                        )}
                        {opportunity.expectedCloseDate && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {!opportunity.probability && !opportunity.expectedCloseDate && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{new Date(opportunity.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Hover Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-3 flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 pt-4 border-t border-border/30">
        <span className="text-sm text-muted-foreground">💡 Tip: Drag cards between columns to update stage</span>
      </div>
    </div>
  );
}
