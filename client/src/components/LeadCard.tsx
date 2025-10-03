import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Opportunity } from "@shared/schema";

interface LeadCardProps {
  opportunity: Opportunity;
  onStageChange?: (id: number, newStage: string) => void;
}

export default function LeadCard({ opportunity, onStageChange }: LeadCardProps) {
  const getTemperatureBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return <Badge className="badge-hot">HOT</Badge>;
      case 'high':
        return <Badge className="badge-hot">HOT</Badge>;
      case 'normal':
        return <Badge className="badge-warm">WARM</Badge>;
      case 'low':
        return <Badge className="badge-cold">COLD</Badge>;
      default:
        return <Badge className="badge-warm">WARM</Badge>;
    }
  };

  const formatCurrency = (amount: number | string | null) => {
    if (!amount) return 'Not specified';
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getContactName = () => {
    // In a real implementation, this would join with contacts table
    return 'Contact Name';
  };

  return (
    <Card 
      className="kanban-card bg-secondary border border-border cursor-pointer"
      data-testid={`card-opportunity-${opportunity.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h5 className="font-medium text-foreground text-sm" data-testid={`text-opportunity-name-${opportunity.id}`}>
            {opportunity.name}
          </h5>
          {getTemperatureBadge(opportunity.urgency || 'normal')}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3" data-testid={`text-opportunity-stage-${opportunity.id}`}>
          Stage: {opportunity.stage?.replace('_', ' ') || 'New Lead'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span data-testid={`text-opportunity-contact-${opportunity.id}`}>
            Contact #{opportunity.contactId || 'Unknown'}
          </span>
          <span className="font-medium" data-testid={`text-opportunity-value-${opportunity.id}`}>
            {formatCurrency(opportunity.value)}
          </span>
        </div>
        
        {opportunity.nextActionDate && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span>Next action: {new Date(opportunity.nextActionDate).toLocaleDateString()}</span>
          </div>
        )}
        
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded text-xs ${
            opportunity.probability && opportunity.probability > 75 
              ? 'bg-green-500/20 text-green-400'
              : opportunity.probability && opportunity.probability > 50
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {opportunity.probability || 0}% probability
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
