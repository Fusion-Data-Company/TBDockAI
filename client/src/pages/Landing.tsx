import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">TBDock AI</h1>
                <p className="text-lg text-muted-foreground">Automation Platform</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                AI-Powered CRM & Marketing Automation
              </h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive automation platform for TBDock's waterfront construction business. 
                Manage leads, generate content, and drive growth with intelligent AI agents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              <div className="p-4 bg-secondary rounded-lg">
                <svg className="w-8 h-8 text-primary mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h3 className="font-semibold text-foreground mb-1">Lead Management</h3>
                <p className="text-sm text-muted-foreground">Project-centric CRM with automated scoring</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <svg className="w-8 h-8 text-primary mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <h3 className="font-semibold text-foreground mb-1">AI Content Generation</h3>
                <p className="text-sm text-muted-foreground">Blog, newsletter & social media automation</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <svg className="w-8 h-8 text-primary mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <h3 className="font-semibold text-foreground mb-1">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">KPIs, conversion tracking & insights</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/api/login'} 
                className="w-full py-3 text-lg font-semibold"
                data-testid="button-login"
              >
                Access Platform
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Secure authentication via Replit Identity
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                © 2024 T&B Dock - Professional Waterfront Construction Services
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
