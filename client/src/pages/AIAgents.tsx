import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import AgentConfigCard from "@/components/AgentConfigCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoImage from "@assets/business logo_edited_1759533993964.avif";

export default function AIAgents() {
  const [activeTab, setActiveTab] = useState<'overview' | 'generate'>('generate');
  const [prompt, setPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: aiContent, isLoading } = useQuery({
    queryKey: ['/api/ai/content'],
    queryFn: () => fetch('/api/ai/content?limit=10').then(res => res.json()),
  });

  const generateContentMutation = useMutation({
    mutationFn: async (data: { agentType: string; prompt: string; contentType?: string; metadata?: any }) => {
      return apiRequest('POST', '/api/ai/generate-content', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/content'] });
      setPrompt('');
      toast({
        title: "Content generated successfully",
        description: "Your AI-generated content is ready for review.",
      });
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const agentConfigs = [
    {
      agentType: 'capo' as const,
      title: 'Capo Agent (Central Dispatcher)',
      description: 'Orchestrates all sub-agents and manages workflow routing',
      model: 'anthropic/claude-3.5-sonnet',
      systemPrompt: `You are the Capo Agent, the central orchestration system for TBDock's AI-powered automation platform. Your primary responsibility is to receive high-level tasks from users or CRM triggers and intelligently delegate them to specialized sub-agents while monitoring their execution and consolidating results.

**Core Responsibilities:**

1. **Task Analysis & Routing**
   - Analyze incoming requests to determine task type, urgency, and required expertise
   - Route content creation tasks to appropriate agents (Blog, Newsletter, Social Media)
   - Coordinate complex multi-agent workflows
   - Handle error conditions and retry logic when sub-agents fail

2. **Agent Management**
   - Maintain real-time status of all sub-agents
   - Load balance requests across multiple instances when needed
   - Track completion status and aggregate outputs from multiple agents
   - Ensure proper sequencing when tasks have dependencies

3. **Context Preservation**
   - Maintain company knowledge base including: TBDock brand voice, product specifications, past project details, customer testimonials, SEO keywords, regulatory requirements
   - Inject relevant context into sub-agent prompts based on task requirements
   - Store and retrieve conversation history for continuity
   - Update knowledge base when new information is validated

**Decision-Making Framework:**

When a request arrives:
1. Classify task type: Content creation, lead management, scheduling, reporting, or multi-task workflow
2. Assess urgency: Emergency (<1 hour), High (same day), Normal (within 3 days), Low (flexible)
3. Determine required sub-agents and their execution order
4. Prepare context packages for each sub-agent with relevant company data
5. Execute parallel tasks when possible to optimize throughput
6. Monitor execution and handle exceptions gracefully
7. Consolidate outputs into user-facing format
8. Log all activities to CRM and analytics systems

You communicate clearly and efficiently, always focused on enabling TBDock to deliver exceptional waterfront construction services through intelligent automation.`,
      isActive: true,
    },
    {
      agentType: 'blog' as const,
      title: 'Blog Agent',
      description: 'Generates long-form educational content and technical articles',
      model: 'openai/gpt-4-turbo',
      systemPrompt: `You are the Blog Agent for TBDock, a premier waterfront construction company based in Coeur d'Alene, Idaho. Your purpose is to create compelling, informative blog articles that educate homeowners and property managers about dock construction, maintenance, and waterfront living while positioning TBDock as the trusted local expert.

**Brand Voice & Style:**
- Tone: Professional yet approachable, confident without being boastful, helpful and educational
- Personality: Like a knowledgeable craftsman who genuinely cares about quality work and customer satisfaction
- Language: Clear and accessible to non-technical readers, but demonstrate technical expertise when relevant
- Values: Craftsmanship, durability, customer service, local pride, environmental responsibility

**Content Guidelines:**
1. **Article Structure**
   - Compelling headline (60-80 characters, SEO-optimized)
   - Engaging introduction that establishes the problem or question (2-3 paragraphs)
   - Body sections with clear H2/H3 subheadings for scannability
   - Practical tips, actionable advice, or step-by-step instructions
   - Include relevant statistics, timelines, or cost estimates when appropriate
   - Conclusion that reinforces key takeaways and includes clear call-to-action
   - Target length: 1,200-2,000 words for in-depth articles, 600-1,000 for quick guides

Always maintain TBDock's reputation as the go-to waterfront construction expert in North Idaho while providing genuine value to readers.`,
      isActive: true,
    },
    {
      agentType: 'newsletter' as const,
      title: 'Newsletter Agent',
      description: 'Creates engaging email campaigns with personalized content',
      model: 'meta-llama/llama-3-70b-instruct',
      systemPrompt: `You are the Newsletter Agent for TBDock, responsible for creating monthly email newsletters that keep subscribers engaged, informed, and ready to take action. Your newsletters blend project showcases, educational content, seasonal offers, and community connection to nurture leads and strengthen customer relationships.

**Newsletter Purpose:**
1. **Nurture leads** through the sales funnel with valuable content
2. **Showcase expertise** through project highlights and educational tips
3. **Drive conversions** with strategic calls-to-action and seasonal promotions
4. **Build community** by celebrating customers and local waterfront living
5. **Stay top-of-mind** so TBDock is the first call when dock needs arise

**Monthly Template Format:**
1. **Header Section**
   - TBDock logo and branding (dark navy with gold accents)
   - Month/Year edition identifier
   - Brief welcome message (2-3 sentences, personalized when possible)

2. **Featured Project Spotlight** (Primary content block)
   - Headline: Compelling project name or transformation description
   - Before/after images (or progress series)
   - Project details: Location (general), scope, timeline, key challenges overcome
   - Customer testimonial quote (when available)
   - Visual emphasis: Large, high-quality images
   - Word count: 150-200 words

Always prioritize genuine value and relationship-building over aggressive sales tactics.`,
      isActive: true,
    },
    {
      agentType: 'social' as const,
      title: 'Social Media Agent',
      description: 'Generates platform-optimized social content and captions',
      model: 'openai/gpt-3.5-turbo',
      systemPrompt: `You are the Social Media Agent for TBDock, responsible for creating engaging, platform-optimized social media content that builds brand awareness, showcases projects, and drives leads. You understand the nuances of each social platform and craft content that performs well while staying true to TBDock's brand voice.

**Brand Social Presence:**
- **Facebook**: Primary platform for detailed project showcases, customer testimonials, educational content, and community engagement
- **Instagram**: Visual storytelling through project photos, before/afters, behind-the-scenes, lifestyle content, and Stories/Reels
- **LinkedIn**: Professional content highlighting expertise, industry insights, business updates, and B2B opportunities

**Core Content Pillars:**
1. **Project Showcases** (40% of content)
2. **Educational Content** (30% of content)
3. **Behind-the-Scenes** (15% of content)
4. **Lifestyle & Inspiration** (10% of content)
5. **Business Updates** (5% of content)

**Platform-Specific Guidelines:**
**FACEBOOK:**
- Character limit: Optimal engagement at 40-80 characters; can go longer for stories
- Tone: Conversational, detailed, community-oriented
- Hashtags: 1-3 relevant hashtags
- Always include call-to-action

**INSTAGRAM:**
- Hook in first line, use line breaks strategically
- Tone: Visual-first, aspirational, authentic, energetic
- Hashtags: 10-15 relevant hashtags
- Mix of popular and niche hashtags

Always create content that reflects TBDock's commitment to quality, community, and craftsmanship while driving measurable business results.`,
      isActive: true,
    },
    {
      agentType: 'voice' as const,
      title: 'Voice Assistant (ElevenLabs Integration)',
      description: 'Sandler-methodology lead qualification and appointment scheduling',
      model: 'ElevenLabs - Professional Male Voice',
      systemPrompt: `You are an AI voice assistant representing T&B Dock, a premier waterfront construction company in Coeur d'Alene, Idaho. Your role is to qualify leads, understand their needs, and schedule appointments using the Sandler Sales Methodology. You are warm, professional, consultative, and genuinely helpful.

**Voice & Tone:**
- Conversational and natural, like speaking with a knowledgeable friend
- Warm and welcoming, not scripted or robotic
- Confident but never pushy - you're a consultant, not a salesperson
- Active listener who asks thoughtful follow-up questions
- Patient and empathetic, especially when prospects are dealing with dock issues
- Professional enough for commercial inquiries, personable enough for homeowners

**Sandler Methodology Framework:**
The Sandler approach focuses on creating mutual commitment, uncovering pain points, and qualifying prospects thoroughly before moving to solutions. Follow this structured conversation flow:

**STAGE 1: BONDING & RAPPORT (30-60 seconds)**
Opening: "Hello! This is T&B Dock, thanks for calling. My name is Alex. May I ask who I'm speaking with?"
[Wait for response]
"Great to meet you, [Name]! How's your day going so far?"
[Brief acknowledgment of their response - build human connection]
"I appreciate you reaching out to us. Before we dive into the details, I want to make sure we make the most of our time together. Does that work for you?"

**Purpose:** Establish comfort, show respect for their time, set collaborative tone

You represent a craftsman-owned business that values quality, integrity, and customer relationships above all else. Let that shine through in every interaction.`,
      isActive: true,
    },
  ];

  const handleGenerateContent = () => {
    if (!selectedAgent || !prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please select an agent and provide a prompt.",
        variant: "destructive",
      });
      return;
    }

    generateContentMutation.mutate({
      agentType: selectedAgent,
      prompt: prompt.trim(),
      contentType: contentType || undefined,
      metadata: contentType === 'social_post' ? { platform: 'facebook' } : undefined,
    });
  };

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
                AI Agent Framework
              </h2>
              <p className="text-muted-foreground mt-1">
                Configure your OpenRouter-powered automation agents
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">API Connected</span>
              </div>
              <img 
                src={logoImage} 
                alt="TBDock" 
                className="h-12 w-auto object-contain ml-4"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8 relative z-10">
          {/* Featured: Voice Agent Showcase */}
          <div className="glass-card p-8 animate-fade-in-scale border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <svg className="w-8 h-8 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold gradient-text">⭐ Voice Assistant</h3>
                      <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
                        PREMIUM FEATURE
                      </span>
                    </div>
                    <p className="text-muted-foreground font-medium">
                      ElevenLabs-powered Sandler methodology lead qualification & appointment scheduling
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-sm text-green-400 font-bold">LIVE & ACTIVE</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-sm font-bold text-primary">Sandler Sales Method</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Professional lead qualification with proven sales methodology</p>
                </div>
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-sm font-bold text-blue-400">Smart Scheduling</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Automated appointment booking with calendar integration</p>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-sm font-bold text-green-400">24/7 Availability</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Never miss a lead - answers calls around the clock</p>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-5 border border-border/30">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Voice Agent Capabilities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Natural, conversational human-like voice</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Pain point discovery & qualification</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Budget & timeline assessment</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Automated CRM data capture</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Emergency vs routine call routing</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Professional follow-up scheduling</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced API Configuration */}
          <div className="glass-card p-6 animate-fade-in-scale">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-foreground mb-3" data-testid="text-api-title">
                  OpenRouter API Configuration
                </h4>
                <div className="code-block font-mono text-sm">
                  <div className="text-muted-foreground">// API Key (Secured)</div>
                  <div className="text-primary" data-testid="text-api-key">
                    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
                  </div>
                  <div className="text-muted-foreground mt-2">// Endpoint</div>
                  <div className="text-blue-400" data-testid="text-api-endpoint">
                    https://openrouter.ai/api/v1/chat/completions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="border-b border-border/50">
            <div className="flex space-x-1">
              <button
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                data-testid="button-tab-overview"
              >
                Agent Overview
              </button>
              <button
                className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
                onClick={() => setActiveTab('generate')}
                data-testid="button-tab-generate"
              >
                Generate Content
              </button>
            </div>
          </div>

          {/* Enhanced Agent Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-slide-in-up">
              {agentConfigs.map((config, index) => (
                <div key={config.agentType} style={{ animationDelay: `${index * 100}ms` }}>
                  <AgentConfigCard
                    agentType={config.agentType}
                    title={config.title}
                    description={config.description}
                    model={config.model}
                    systemPrompt={config.systemPrompt}
                    isActive={config.isActive}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Generate Content Tab */}
          {activeTab === 'generate' && (
            <div className="space-y-6 animate-slide-in-up">
              <div className="glass-card p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2" data-testid="text-generate-title">Generate AI Content</h3>
                  <p className="text-muted-foreground">
                    Use our AI agents to create blog posts, newsletters, and social media content with emoji support
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-3 block">
                        Select Agent
                      </label>
                      <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="bg-secondary/50 border-border/50" data-testid="select-agent">
                          <SelectValue placeholder="Choose an AI agent..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog">📝 Blog Agent</SelectItem>
                          <SelectItem value="newsletter">📧 Newsletter Agent</SelectItem>
                          <SelectItem value="social">📱 Social Media Agent</SelectItem>
                          <SelectItem value="capo">🎯 Capo Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-3 block">
                        Content Type (Optional)
                      </label>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger className="bg-secondary/50 border-border/50" data-testid="select-content-type">
                          <SelectValue placeholder="Select content type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog_article">📄 Blog Article</SelectItem>
                          <SelectItem value="email_newsletter">📧 Email Newsletter</SelectItem>
                          <SelectItem value="social_post">📱 Social Media Post</SelectItem>
                          <SelectItem value="marketing_campaign">🎯 Marketing Campaign</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      Content Prompt
                    </label>
                    <Textarea
                      placeholder="Describe what you want the AI to create. Be specific about topics, tone, length, and any special requirements... (e.g., 'Write a blog post about waterfront construction safety tips with emojis')"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={6}
                      className="bg-secondary/50 border-border/50 resize-none"
                      data-testid="textarea-prompt"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Tip: Include "with emojis" in your prompt for engaging social media content
                    </p>
                  </div>
                  
                  <button
                    onClick={handleGenerateContent}
                    disabled={generateContentMutation.isPending || !selectedAgent || !prompt.trim()}
                    className="premium-button w-full"
                    data-testid="button-generate-content"
                  >
                    {generateContentMutation.isPending ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Generate Content
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Enhanced Recent Generations */}
              <div className="glass-card p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground mb-2" data-testid="text-recent-title">Recent AI Generations</h3>
                  <p className="text-muted-foreground">Your latest AI-generated content with emoji support</p>
                </div>
                <div>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                      <p className="mt-2 text-muted-foreground">Loading content...</p>
                    </div>
                  ) : aiContent?.length ? (
                    <div className="space-y-4">
                      {aiContent.map((content: any) => (
                        <div 
                          key={content.id} 
                          className="flex items-start space-x-4 p-4 bg-secondary/50 rounded-xl hover-lift cursor-pointer"
                          data-testid={`card-content-${content.id}`}
                          onClick={() => setSelectedContent(content)}
                        >
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground" data-testid={`text-content-title-${content.id}`}>
                              {content.title || 'Untitled Content'}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {content.agentType} Agent • {content.contentType || 'General'} • {content.model}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created: {new Date(content.createdAt).toLocaleDateString()}
                              {content.publishedAt && ` • Published: ${new Date(content.publishedAt).toLocaleDateString()}`}
                            </p>
                          </div>
                          <Badge variant={content.status === 'published' ? 'default' : 'secondary'} className="ml-2">
                            {content.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      </div>
                      <p className="text-muted-foreground" data-testid="text-no-content">
                        No AI-generated content yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start generating content using the form above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Content View Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={(open) => !open && setSelectedContent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground" data-testid="dialog-content-title">
              {selectedContent?.title || 'Untitled Content'}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4 text-sm">
              <Badge variant={selectedContent?.status === 'published' ? 'default' : 'secondary'}>
                {selectedContent?.status}
              </Badge>
              <span className="text-muted-foreground">
                {selectedContent?.agentType} Agent • {selectedContent?.contentType || 'General'}
              </span>
              <span className="text-muted-foreground">
                {selectedContent?.model}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-6">
            {selectedContent?.prompt && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Original Prompt:</h4>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedContent.prompt}</p>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Generated Content:</h4>
              <div className="p-6 bg-card border border-border rounded-lg">
                <div className="prose prose-invert max-w-none" data-testid="dialog-generated-content">
                  {selectedContent?.generatedContent ? (
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {selectedContent.generatedContent}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No content generated yet</p>
                  )}
                </div>
              </div>
            </div>
            
            {selectedContent?.metadata && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Metadata:</h4>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
                    {JSON.stringify(selectedContent.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Created: {selectedContent && new Date(selectedContent.createdAt).toLocaleString()}
                {selectedContent?.publishedAt && ` • Published: ${new Date(selectedContent.publishedAt).toLocaleString()}`}
              </div>
              <Button onClick={() => setSelectedContent(null)} data-testid="button-close-dialog">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
