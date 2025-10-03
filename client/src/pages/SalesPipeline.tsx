import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOpportunitySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { z } from "zod";

export default function SalesPipeline() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['/api/opportunities'],
  });

  const { data: pipelineAnalytics } = useQuery({
    queryKey: ['/api/analytics/pipeline'],
  });
  
  const { data: contacts } = useQuery({
    queryKey: ['/api/contacts'],
  });
  
  const opportunityForm = useForm<z.infer<typeof insertOpportunitySchema>>({
    resolver: zodResolver(insertOpportunitySchema),
    defaultValues: {
      name: "",
      value: "0",
      stage: "new_lead",
      contactId: null,
    },
  });
  
  const createOpportunityMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertOpportunitySchema>) => 
      apiRequest('POST', '/api/opportunities', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/pipeline'] });
      setIsDialogOpen(false);
      opportunityForm.reset();
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create opportunity",
        variant: "destructive",
      });
    },
  });
  
  const handleCreateOpportunity = (data: z.infer<typeof insertOpportunitySchema>) => {
    createOpportunityMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-glass border-b border-border/50">
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <h1 className="section-title gradient-text">
                Sales Pipeline
              </h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Manage your sales opportunities and track progress through each stage
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="glass-button h-11 px-5">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Filter Pipeline
              </button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="premium-button h-11" data-testid="button-new-opportunity">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    New Opportunity
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Opportunity</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...opportunityForm}>
                    <form onSubmit={opportunityForm.handleSubmit(handleCreateOpportunity)} className="space-y-4">
                      <FormField
                        control={opportunityForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Private Dock Installation" data-testid="input-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={opportunityForm.control}
                          name="value"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value ($) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                  placeholder="45000" 
                                  data-testid="input-value" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={opportunityForm.control}
                          name="stage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stage</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "new_lead"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-stage">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="new_lead">New Lead</SelectItem>
                                  <SelectItem value="qualification">Qualification</SelectItem>
                                  <SelectItem value="proposal">Proposal Sent</SelectItem>
                                  <SelectItem value="negotiation">Negotiation</SelectItem>
                                  <SelectItem value="closed_won">Closed Won</SelectItem>
                                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={opportunityForm.control}
                        name="contactId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                              value={field.value ? String(field.value) : undefined}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-contact">
                                  <SelectValue placeholder="Select a contact (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contacts?.map((contact: any) => (
                                  <SelectItem key={contact.id} value={String(contact.id)}>
                                    {contact.firstName} {contact.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createOpportunityMutation.isPending}
                          data-testid="button-submit"
                        >
                          {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Pipeline Stats */}
          {pipelineAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card hover-lift stat-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    TOTAL
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Total Pipeline Value</p>
                  <p className="text-3xl font-bold text-primary gradient-text" data-testid="text-total-pipeline">
                    {formatCurrency(pipelineAnalytics.totalValue || 0)}
                  </p>
                </div>
              </div>

              <div className="glass-card hover-lift stat-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full">
                    ACTIVE
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Active Opportunities</p>
                  <p className="text-3xl font-bold text-blue-400" data-testid="text-active-opportunities">
                    {pipelineAnalytics.activeCount || 0}
                  </p>
                </div>
              </div>

              <div className="glass-card hover-lift stat-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full">
                    AVG
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Avg. Deal Size</p>
                  <p className="text-3xl font-bold text-green-400" data-testid="text-avg-deal">
                    {formatCurrency(pipelineAnalytics.avgDealSize || 0)}
                  </p>
                </div>
              </div>

              <div className="glass-card hover-lift stat-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full">
                    WIN%
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Close Rate</p>
                  <p className="text-3xl font-bold text-purple-400" data-testid="text-close-rate">
                    {pipelineAnalytics.closeRate || 0}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Kanban Board */}
          <div className="glass-card p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2" data-testid="text-kanban-title">
                Pipeline Board
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Drag and drop opportunities between stages to update their progress
              </p>
            </div>
            <KanbanBoard opportunities={opportunities || []} loading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
