import { openRouterService } from './openRouter';

interface ContentGenerationResult {
  content: string;
  title?: string;
  metadata?: any;
  model: string;
}

class AgentService {
  async generateContent(
    agentType: string, 
    prompt: string, 
    contentType?: string, 
    metadata?: any
  ): Promise<ContentGenerationResult> {
    switch (agentType) {
      case 'blog':
        const blogResult = await openRouterService.generateBlogContent(prompt, metadata?.topic);
        return {
          content: blogResult.content,
          title: blogResult.title,
          model: blogResult.model,
          metadata: {
            contentType: 'blog_article',
            wordCount: blogResult.content.split(' ').length,
            ...metadata
          }
        };

      case 'newsletter':
        const newsletterResult = await openRouterService.generateNewsletterContent(prompt, metadata?.recentContent);
        return {
          content: newsletterResult.content,
          title: newsletterResult.title,
          model: newsletterResult.model,
          metadata: {
            contentType: 'email_newsletter',
            ...metadata
          }
        };

      case 'social':
        const platform = metadata?.platform || 'facebook';
        const socialResult = await openRouterService.generateSocialMediaContent(prompt, platform);
        return {
          content: socialResult.content,
          title: socialResult.title,
          model: socialResult.model,
          metadata: {
            contentType: 'social_post',
            platform,
            hashtags: socialResult.hashtags,
            ...metadata
          }
        };

      case 'capo':
        const capoResult = await openRouterService.capoAgentRoute(prompt, metadata);
        return {
          content: capoResult.content,
          title: 'Capo Agent Response',
          model: capoResult.model,
          metadata: {
            contentType: 'agent_response',
            action: capoResult.action,
            ...metadata
          }
        };

      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  async generateMarketingCampaign(campaignType: string, targetAudience: string, goals: string[]): Promise<ContentGenerationResult> {
    const prompt = `Create a ${campaignType} marketing campaign for TBDock targeting ${targetAudience}. Goals: ${goals.join(', ')}. Include subject line, main content, and call-to-action.`;
    
    const result = await openRouterService.generateNewsletterContent(prompt);
    
    return {
      content: result.content,
      title: `${campaignType} Campaign`,
      model: result.model,
      metadata: {
        contentType: 'marketing_campaign',
        campaignType,
        targetAudience,
        goals
      }
    };
  }

  async generateBlogSeries(topic: string, numberOfArticles: number): Promise<ContentGenerationResult[]> {
    const seriesPrompt = `Generate ${numberOfArticles} blog article topics related to "${topic}" for TBDock's waterfront construction business. Each topic should be valuable to homeowners and property managers interested in dock construction and maintenance.`;
    
    const topicsResult = await openRouterService.capoAgentRoute(seriesPrompt);
    const topics = topicsResult.content.split('\n').filter(line => line.trim()).slice(0, numberOfArticles);
    
    const articles: ContentGenerationResult[] = [];
    
    for (const topic of topics) {
      const cleanTopic = topic.replace(/^\d+\.\s*/, '').trim();
      const articleResult = await openRouterService.generateBlogContent(
        `Write a comprehensive article about: ${cleanTopic}`,
        cleanTopic
      );
      
      articles.push({
        content: articleResult.content,
        title: articleResult.title,
        model: articleResult.model,
        metadata: {
          contentType: 'blog_article',
          series: topic,
          seriesPosition: articles.length + 1,
          wordCount: articleResult.content.split(' ').length
        }
      });
    }
    
    return articles;
  }

  async generateSeasonalContent(season: string): Promise<{ blog: ContentGenerationResult; newsletter: ContentGenerationResult; social: ContentGenerationResult[] }> {
    // Generate blog content
    const blogPrompt = `Create a comprehensive ${season} maintenance and preparation guide for dock owners in North Idaho. Focus on seasonal challenges, preventive measures, and when to call professionals.`;
    const blogResult = await this.generateContent('blog', blogPrompt, 'blog_article', { topic: `${season} Dock Care` });

    // Generate newsletter content
    const newsletterPrompt = `Create a ${season} newsletter highlighting seasonal dock services, maintenance tips, and current project showcases. Include a special seasonal promotion.`;
    const newsletterResult = await this.generateContent('newsletter', newsletterPrompt, 'email_newsletter', { season });

    // Generate social media content for multiple platforms
    const socialPrompts = [
      { platform: 'facebook', prompt: `Create an engaging Facebook post about ${season} dock preparation with practical tips for homeowners.` },
      { platform: 'instagram', prompt: `Write an Instagram caption for a before/after dock transformation photo, emphasizing ${season} readiness.` },
      { platform: 'linkedin', prompt: `Create a professional LinkedIn post about the importance of ${season} dock maintenance for property value.` }
    ];

    const socialResults = await Promise.all(
      socialPrompts.map(({ platform, prompt }) => 
        this.generateContent('social', prompt, 'social_post', { platform, season })
      )
    );

    return {
      blog: blogResult,
      newsletter: newsletterResult,
      social: socialResults
    };
  }
}

export const agentService = new AgentService();
