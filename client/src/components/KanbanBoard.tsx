import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LeadCard from "./LeadCard";
import type { Opportunity } from "@shared/schema";

interface KanbanBoardProps {
  opportunities: Opportunity[];
  loading: boolean;
}

const stages = [
  { id: 'new_lead', title: 'New Leads', color: 'bg-blue-500' },
  { id: 'qualification', title: 'Qualification', color: 'bg-yellow-500' },
  { id: 'proposal_sent', title: 'Proposal Sent', color: 'bg-purple-500' },
  { id: 'negotiation', title: 'Negotiation', color: 'bg-orange-500' },
  { id: 'closed_won', title: 'Closed Won', color: 'bg-green-500' },
];

export default function KanbanBoard({ opportunities, loading }: KanbanBoardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateOpportunityMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      return apiRequest('PUT', `/api/opportunities/${id}`, { stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      toast({
        title: "Opportunity updated",
        description: "Opportunity stage has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update opportunity stage.",
        variant: "destructive",
      });
    },
  });

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities?.filter(opp => opp.stage === stage) || [];
  };

  const handleStageChange = (opportunityId: number, newStage: string) => {
    updateOpportunityMutation.mutate({ id: opportunityId, stage: newStage });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2 text-muted-foreground">Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto" data-testid="kanban-board">
      {stages.map((stage) => {
        const stageOpportunities = getOpportunitiesByStage(stage.id);
        
        return (
          <div key={stage.id} className="min-w-[280px]" data-testid={`kanban-column-${stage.id}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground flex items-center">
                <span className={`w-3 h-3 rounded-full ${stage.color} mr-2`}></span>
                {stage.title}
              </h4>
              <span 
                className={`text-xs px-2 py-1 rounded-full ${stage.color}/20`}
                style={{ color: stage.color.replace('bg-', '').replace('-500', '') }}
                data-testid={`text-stage-count-${stage.id}`}
              >
                {stageOpportunities.length}
              </span>
            </div>
            
            <div className="space-y-3" data-testid={`stage-opportunities-${stage.id}`}>
              {stageOpportunities.length > 0 ? (
                stageOpportunities.map((opportunity) => (
                  <LeadCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onStageChange={handleStageChange}
                  />
                ))
              ) : (
                <div className="p-4 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                  <p className="text-sm">No opportunities</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
