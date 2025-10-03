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
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCopyContent = async (content: string, id: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

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
              {/* Ultra-Premium Content Generator */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

                <div className="relative">
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <svg className="w-6 h-6 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold gradient-text" data-testid="text-generate-title">AI Content Generator</h3>
                        <p className="text-muted-foreground font-medium">
                          Create professional content in seconds with advanced AI models
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Agent Selection - Premium Cards */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-4 block flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Select AI Agent
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {[
                          { value: 'blog', icon: '📝', label: 'Blog Agent', desc: 'Long-form articles' },
                          { value: 'newsletter', icon: '📧', label: 'Newsletter', desc: 'Email campaigns' },
                          { value: 'social', icon: '📱', label: 'Social Media', desc: 'Posts & captions' },
                          { value: 'capo', icon: '🎯', label: 'Capo Agent', desc: 'Orchestrator' },
                        ].map((agent) => (
                          <button
                            key={agent.value}
                            onClick={() => setSelectedAgent(agent.value)}
                            className={`group relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 ${
                              selectedAgent === agent.value
                                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20 scale-105'
                                : 'bg-secondary/30 border-border/30 hover:border-primary/30 hover:bg-secondary/50'
                            }`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity ${selectedAgent === agent.value ? 'opacity-100' : 'group-hover:opacity-50'}`}></div>
                            <div className="relative">
                              <div className="text-3xl mb-2">{agent.icon}</div>
                              <div className="font-bold text-foreground text-sm mb-1">{agent.label}</div>
                              <div className="text-xs text-muted-foreground">{agent.desc}</div>
                            </div>
                            {selectedAgent === agent.value && (
                              <div className="absolute top-2 right-2">
                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content Type - Premium Pills */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-4 block flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                        </svg>
                        Content Type <span className="ml-2 text-xs font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { value: '', label: 'Any Type', icon: '✨' },
                          { value: 'blog_article', label: 'Blog Article', icon: '📄' },
                          { value: 'email_newsletter', label: 'Newsletter', icon: '📧' },
                          { value: 'social_post', label: 'Social Post', icon: '📱' },
                          { value: 'marketing_campaign', label: 'Campaign', icon: '🎯' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setContentType(type.value)}
                            className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                              contentType === type.value
                                ? 'bg-primary text-background border-primary shadow-lg shadow-primary/30'
                                : 'bg-secondary/30 text-foreground border-border/30 hover:border-primary/30 hover:bg-secondary/50'
                            }`}
                          >
                            <span className="mr-2">{type.icon}</span>
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prompt Input - Ultra Premium */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-4 block flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Your Content Prompt
                      </label>
                      <div className="relative">
                        <Textarea
                          placeholder="Describe your content in detail... Examples:&#10;• 'Write a 1500-word blog post about dock maintenance with seasonal tips'&#10;• 'Create an engaging Instagram caption for a new dock installation project'&#10;• 'Draft a newsletter about waterfront living trends in North Idaho'"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          rows={7}
                          className="bg-background/60 border-2 border-border/50 focus:border-primary/50 rounded-xl resize-none text-base leading-relaxed p-4 backdrop-blur-sm"
                          data-testid="textarea-prompt"
                        />
                        <div className="absolute bottom-3 right-3 flex items-center space-x-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-secondary/60 rounded-lg backdrop-blur-sm">
                            {prompt.length} characters
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-start space-x-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div className="text-sm text-blue-300">
                          <span className="font-bold">Pro Tips:</span> Be specific about tone, length, target audience. Include "with emojis" for social content. Mention brand voice or style preferences.
                        </div>
                      </div>
                    </div>

                    {/* Generate Button - Ultra Premium */}
                    <button
                      onClick={handleGenerateContent}
                      disabled={generateContentMutation.isPending || !selectedAgent || !prompt.trim()}
                      className={`premium-button w-full text-lg h-16 shadow-2xl ${
                        generateContentMutation.isPending ? 'animate-pulse' : ''
                      }`}
                      data-testid="button-generate-content"
                    >
                      {generateContentMutation.isPending ? (
                        <>
                          <div className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-solid border-current border-r-transparent mr-3"></div>
                          <span className="font-bold">Generating Your Content...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                          <span className="font-bold">Generate AI Content</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Library - Premium Two-Column Layout */}
              <div className="grid grid-cols-12 gap-6">
                {/* Content List Sidebar */}
                <div className="col-span-4">
                  <div className="glass-card p-6 sticky top-24">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-foreground mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        Content Library
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {aiContent?.length || 0} pieces of content
                      </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="space-y-3 mb-4">
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input
                          type="text"
                          placeholder="Search content..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-border/30 rounded-lg text-sm focus:border-primary/50 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={filterAgent}
                          onChange={(e) => setFilterAgent(e.target.value)}
                          className="px-3 py-1.5 bg-secondary/30 border border-border/30 rounded-lg text-xs focus:border-primary/50 focus:outline-none"
                        >
                          <option value="all">All Agents</option>
                          <option value="blog">Blog</option>
                          <option value="newsletter">Newsletter</option>
                          <option value="social">Social</option>
                          <option value="capo">Capo</option>
                        </select>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-1.5 bg-secondary/30 border border-border/30 rounded-lg text-xs focus:border-primary/50 focus:outline-none"
                        >
                          <option value="all">All Status</option>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-2"></div>
                          <p className="text-sm text-muted-foreground">Loading...</p>
                        </div>
                      ) : aiContent?.filter((content: any) => {
                          const matchesSearch = !searchTerm ||
                            content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            content.generatedContent?.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesAgent = filterAgent === 'all' || content.agentType === filterAgent;
                          const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
                          return matchesSearch && matchesAgent && matchesStatus;
                        }).length ? (
                        aiContent.filter((content: any) => {
                          const matchesSearch = !searchTerm ||
                            content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            content.generatedContent?.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesAgent = filterAgent === 'all' || content.agentType === filterAgent;
                          const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
                          return matchesSearch && matchesAgent && matchesStatus;
                        }).map((content: any) => (
                          <button
                            key={content.id}
                            onClick={() => setSelectedContent(content)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                              selectedContent?.id === content.id
                                ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/10'
                                : 'bg-secondary/30 border-border/30 hover:border-primary/30 hover:bg-secondary/50'
                            }`}
                            data-testid={`card-content-${content.id}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-foreground text-sm line-clamp-2 pr-2">
                                {content.title || 'Untitled Content'}
                              </h4>
                              <Badge variant={content.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                                {content.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-mono">
                                {content.agentType}
                              </span>
                              <span>•</span>
                              <span>{content.contentType || 'General'}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(content.createdAt).toLocaleDateString()}
                            </p>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">No content yet</p>
                          <p className="text-xs text-muted-foreground mt-1">Generate content above</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Display Window */}
                <div className="col-span-8">
                  {selectedContent ? (
                    <div className="glass-card p-8 animate-fade-in-scale">
                      {/* Content Header */}
                      <div className="border-b border-border/30 pb-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h2 className="text-3xl font-bold text-foreground mb-3">{selectedContent.title || 'Untitled Content'}</h2>
                            <div className="flex items-center space-x-3">
                              <Badge variant={selectedContent.status === 'published' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                                {selectedContent.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground font-medium">
                                {selectedContent.agentType} Agent
                              </span>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                {selectedContent.contentType || 'General'}
                              </span>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(selectedContent.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyContent(selectedContent.generatedContent || '', selectedContent.id)}
                            className={`premium-button px-6 transition-all ${
                              copiedId === selectedContent.id ? 'bg-green-500 hover:bg-green-600' : ''
                            }`}
                          >
                            {copiedId === selectedContent.id ? (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                                </svg>
                                Copy Content
                              </>
                            )}
                          </button>
                        </div>

                        {/* Metadata */}
                        {selectedContent.prompt && (
                          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                            <h4 className="text-xs font-bold text-primary mb-2 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              ORIGINAL PROMPT
                            </h4>
                            <p className="text-sm text-muted-foreground italic leading-relaxed">{selectedContent.prompt}</p>
                          </div>
                        )}
                      </div>

                      {/* Content Analytics Bar */}
                      {selectedContent.generatedContent && (
                        <div className="grid grid-cols-4 gap-3 mb-6">
                          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              <span className="text-xs font-bold text-primary">WORDS</span>
                            </div>
                            <div className="text-2xl font-black text-primary">
                              {selectedContent.generatedContent.split(/\s+/).filter(Boolean).length.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <span className="text-xs font-bold text-blue-400">READ TIME</span>
                            </div>
                            <div className="text-2xl font-black text-blue-400">
                              {Math.ceil(selectedContent.generatedContent.split(/\s+/).filter(Boolean).length / 200)} min
                            </div>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                              </svg>
                              <span className="text-xs font-bold text-green-400">CHARACTERS</span>
                            </div>
                            <div className="text-2xl font-black text-green-400">
                              {selectedContent.generatedContent.length.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                              </svg>
                              <span className="text-xs font-bold text-purple-400">PARAGRAPHS</span>
                            </div>
                            <div className="text-2xl font-black text-purple-400">
                              {selectedContent.generatedContent.split(/\n\n+/).filter(Boolean).length}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Content Body - Ultra-Premium Display Window */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-background/80 via-background/60 to-primary/5 rounded-2xl p-10 border-2 border-border/40 min-h-[500px] shadow-inner">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

                        {selectedContent.generatedContent ? (
                          <div className="relative prose prose-lg prose-invert max-w-none">
                            <div className="text-foreground leading-loose whitespace-pre-wrap font-serif text-lg selection:bg-primary/30 selection:text-primary-foreground">
                              {selectedContent.generatedContent}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
                              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                            </div>
                            <p className="text-xl font-bold text-muted-foreground mb-2">No Content Available</p>
                            <p className="text-sm text-muted-foreground">This content hasn't been generated yet</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/30">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-muted-foreground font-mono">
                            {selectedContent.model || 'Unknown Model'}
                          </span>
                          {selectedContent.generatedContent && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {selectedContent.generatedContent.length.toLocaleString()} characters
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="glass-button px-5">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                            Edit
                          </button>
                          <button className="glass-button px-5">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                            </svg>
                            Share
                          </button>
                          <button className="premium-button px-5">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            Publish
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card p-20 flex flex-col items-center justify-center text-center min-h-[600px]">
                      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
                        <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Select Content to View</h3>
                      <p className="text-muted-foreground max-w-md">
                        Choose content from your library on the left to view, copy, and reuse it
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
