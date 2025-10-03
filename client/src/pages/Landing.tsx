import logoImage from "@assets/business logo_edited_1759533993964.avif";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Logo Watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={logoImage}
          alt=""
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] max-w-3xl opacity-[0.015] select-none animate-pulse-glow"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-6xl space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-8 animate-fade-in-scale">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-glow"></div>
                <img
                  src={logoImage}
                  alt="TBDock Logo"
                  className="relative w-28 h-28 object-contain hover-lift"
                />
              </div>
              <div className="text-left">
                <h1 className="hero-title gradient-text">
                  TBDock AI
                </h1>
                <p className="text-xl text-muted-foreground font-medium mt-2">
                  Enterprise Automation Platform
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                AI-Powered CRM & Marketing Automation
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Transform your waterfront construction business with intelligent automation.
                Manage leads, generate content, and accelerate growth with enterprise-grade AI agents.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center space-x-4 pt-4">
              <button
                onClick={() => window.location.href = '/api/login'}
                className="premium-button text-lg px-10 py-4"
                data-testid="button-login"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Access Platform
              </button>

              <button className="glass-button text-lg px-10 py-4">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in-up">
            <div className="glass-card hover-lift p-8 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Smart Lead Management
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Project-centric CRM with AI-powered lead scoring, duplicate detection, and automated nurture sequences
              </p>
            </div>

            <div className="glass-card hover-lift p-8 group">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                AI Content Engine
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate blog articles, newsletters, and social media content with advanced LLM models and brand voice
              </p>
            </div>

            <div className="glass-card hover-lift p-8 group">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Enterprise Analytics
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time KPIs, conversion tracking, pipeline analytics, and actionable business insights
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="glass-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold gradient-text mb-2">98%</p>
                <p className="text-sm text-muted-foreground font-medium">Lead Capture Rate</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-400 mb-2">3.2x</p>
                <p className="text-sm text-muted-foreground font-medium">Faster Response Time</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-green-400 mb-2">$2.4M</p>
                <p className="text-sm text-muted-foreground font-medium">Pipeline Managed</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-purple-400 mb-2">24/7</p>
                <p className="text-sm text-muted-foreground font-medium">AI Automation</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4 pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground font-medium">
              🔒 Secure authentication via Replit Identity
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 T&B Dock - Professional Waterfront Construction Services
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
