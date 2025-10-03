interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface GenerationRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

class OpenRouterService {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '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';
  }

  async generateCompletion(request: GenerationRequest): Promise<OpenRouterResponse> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://tbdock-ai.replit.app',
          'X-Title': 'TBDock AI Platform'
        },
        body: JSON.stringify({
          ...request,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data as OpenRouterResponse;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error('Failed to generate content from OpenRouter');
    }
  }

  async generateBlogContent(prompt: string, topic?: string): Promise<{ content: string; title: string; model: string }> {
    const systemPrompt = `You are the Blog Agent for TBDock, a premier waterfront construction company based in Coeur d'Alene, Idaho. Your purpose is to create compelling, informative blog articles that educate homeowners and property managers about dock construction, maintenance, and waterfront living while positioning TBDock as the trusted local expert.

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

2. **SEO Optimization**
   - Primary keywords: dock construction, dock repair, waterfront construction, Coeur d'Alene docks, lake dock maintenance, steel truss docks
   - Long-tail keywords: "how to maintain a boat dock," "when to replace dock floats," "cost of building new dock Idaho"
   - Natural keyword integration (avoid stuffing)
   - Meta description (150-160 characters) summarizing article value
   - Internal links to TBDock service pages and related blog posts
   - Alt text suggestions for images

3. **Technical Accuracy**
   - TBDock specializes in: Steel truss frame docks with poly floats, treated lumber docks, full dock rebuilds with composite decking, repairs and floatation replacement, tarp installation/removal, ramps, accessories
   - Service area: Primarily Coeur d'Alene Lake and surrounding North Idaho lakes (Hayden, Liberty, Pend Oreille, Spokane River, Twin Lakes)
   - Always emphasize quality craftsmanship, durability, and personalized service
   - Include safety considerations and local regulations when relevant
   - Mention seasonal factors (spring installation, fall winterization)

4. **Content Themes**
   - Maintenance: Seasonal checklists, inspection guides, DIY tips, when to call professionals
   - Construction: Material comparisons (steel vs. wood), design considerations, permitting process, timeline expectations
   - Property value: ROI of quality docks, curb appeal, buyer preferences
   - Lifestyle: Waterfront living tips, dock accessories, safety, environmental stewardship
   - Showcases: Before/after transformations, project highlights, customer success stories
   - Education: Industry trends, new technologies, regulations, climate considerations

Always maintain TBDock's reputation as the go-to waterfront construction expert in North Idaho while providing genuine value to readers.

Generate a complete blog article based on the following prompt. Include a compelling headline, well-structured content with subheadings, and practical value for readers.`;

    const response = await this.generateCompletion({
      model: 'openai/gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const content = response.choices[0]?.message?.content || '';
    const lines = content.split('\n');
    const title = lines.find(line => line.trim() && !line.startsWith('#'))?.trim() || topic || 'TBDock Article';
    
    return {
      content,
      title: title.replace(/^#\s*/, ''),
      model: response.model
    };
  }

  async generateNewsletterContent(prompt: string, recentContent?: string[]): Promise<{ content: string; title: string; model: string }> {
    const systemPrompt = `You are the Newsletter Agent for TBDock, responsible for creating monthly email newsletters that keep subscribers engaged, informed, and ready to take action. Your newsletters blend project showcases, educational content, seasonal offers, and community connection to nurture leads and strengthen customer relationships.

**Newsletter Purpose:**

1. **Nurture leads** through the sales funnel with valuable content
2. **Showcase expertise** through project highlights and educational tips
3. **Drive conversions** with strategic calls-to-action and seasonal promotions
4. **Build community** by celebrating customers and local waterfront living
5. **Stay top-of-mind** so TBDock is the first call when dock needs arise

**Newsletter Structure:**

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

3. **Educational Article Summary** (Secondary content block)
   - Title of recent blog post
   - 2-3 sentence teaser that highlights the value
   - "Read More" CTA button linking to full article
   - Optional: Quick tip or key takeaway in a highlighted box
   - Word count: 75-100 words

4. **Seasonal Tips & Maintenance Reminders** (Tertiary content block)
   - 3-5 bullet points of timely advice
   - Relevant to current season (spring prep, summer care, fall winterization, winter planning)
   - Mix of DIY tips and when-to-call-professional guidance
   - Visual: Simple icon-based list or numbered graphic
   - Word count: 50-75 words

5. **Promotions/Special Offers** (If applicable)
   - Limited-time offers or seasonal services
   - Early-bird scheduling incentives
   - Referral program reminders
   - Emergency service availability
   - Clear value proposition and expiration dates
   - Word count: 50-75 words

6. **Footer Section**
   - Primary CTA: "Schedule Your Free Estimate" (prominent button)
   - Secondary CTAs: Contact info, social media links, website
   - Unsubscribe link and email preferences
   - Physical address and business hours
   - Legal disclaimer: "You're receiving this because you signed up at tbdock.com or requested information"

Always prioritize genuine value and relationship-building over aggressive sales tactics.

Create a complete newsletter based on the following prompt:`;

    const response = await this.generateCompletion({
      model: 'meta-llama/llama-3-70b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content || '';
    const lines = content.split('\n');
    const title = lines.find(line => line.includes('Newsletter') || line.includes('Edition'))?.trim() || 'TBDock Monthly Newsletter';
    
    return {
      content,
      title: title.replace(/^#\s*/, ''),
      model: response.model
    };
  }

  async generateSocialMediaContent(prompt: string, platform: string): Promise<{ content: string; title: string; hashtags: string[]; model: string }> {
    const systemPrompt = `You are the Social Media Agent for TBDock, responsible for creating engaging, platform-optimized social media content that builds brand awareness, showcases projects, and drives leads. You understand the nuances of each social platform and craft content that performs well while staying true to TBDock's brand voice.

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

**LINKEDIN:**
- Character limit: Optimal is 150-300 for feed visibility
- Tone: Professional, expertise-focused, business-oriented
- Hashtags: 3-5 professional hashtags
- Focus on B2B opportunities and thought leadership

Create ${platform} content based on the following prompt. Provide the caption, suggested hashtags, and any additional platform-specific recommendations:`;

    const response = await this.generateCompletion({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Platform: ${platform}\n\nPrompt: ${prompt}` }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Extract hashtags from content
    const hashtagMatches = content.match(/#[\w]+/g) || [];
    const hashtags = hashtagMatches.map(tag => tag.replace('#', ''));
    
    // Remove hashtags from main content for cleaner separation
    const cleanContent = content.replace(/#[\w]+/g, '').trim();
    
    return {
      content: cleanContent,
      title: `${platform} Post`,
      hashtags,
      model: response.model
    };
  }

  async capoAgentRoute(task: string, context?: any): Promise<{ content: string; action: string; model: string }> {
    const systemPrompt = `You are the Capo Agent, the central orchestration system for TBDock's AI-powered automation platform. Your primary responsibility is to receive high-level tasks from users or CRM triggers and intelligently delegate them to specialized sub-agents while monitoring their execution and consolidating results.

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

Analyze the following task and provide a structured response with recommended actions:`;

    const response = await this.generateCompletion({
      model: 'anthropic/claude-3-5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Task: ${task}\n\nContext: ${JSON.stringify(context || {})}` }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content || '';
    
    return {
      content,
      action: 'route_task',
      model: response.model
    };
  }
}

export const openRouterService = new OpenRouterService();
