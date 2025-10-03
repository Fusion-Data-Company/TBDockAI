import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AgentConfigCardProps {
  agentType: 'capo' | 'blog' | 'newsletter' | 'social' | 'voice';
  title: string;
  description: string;
  model: string;
  systemPrompt: string;
  isActive: boolean;
  onEdit?: () => void;
}

const agentIcons = {
  capo: (
    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
    </svg>
  ),
  blog: (
    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
    </svg>
  ),
  newsletter: (
    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
    </svg>
  ),
  social: (
    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
    </svg>
  ),
  voice: (
    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
    </svg>
  ),
};

export default function AgentConfigCard({
  agentType,
  title,
  description,
  model,
  systemPrompt,
  isActive,
  onEdit,
}: AgentConfigCardProps) {
  return (
    <Card className="agent-card" data-testid={`card-agent-${agentType}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              {agentIcons[agentType]}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground" data-testid={`text-agent-title-${agentType}`}>
                {title}
              </h4>
              <p className="text-sm text-muted-foreground" data-testid={`text-agent-description-${agentType}`}>
                {description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              data-testid={`button-edit-agent-${agentType}`}
            >
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Model Selection</label>
          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              Model: <span className="text-foreground font-mono" data-testid={`text-agent-model-${agentType}`}>
                {model}
              </span>
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">System Prompt</label>
          <div className="bg-background border border-border rounded-lg p-4 text-sm text-muted-foreground font-mono leading-relaxed max-h-96 overflow-y-auto scrollbar-thin">
            <div className="whitespace-pre-wrap" data-testid={`text-agent-prompt-${agentType}`}>
              {systemPrompt.length > 500 
                ? `${systemPrompt.substring(0, 500)}...`
                : systemPrompt
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
