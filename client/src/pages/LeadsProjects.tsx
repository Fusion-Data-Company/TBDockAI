import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSchema, insertProjectSchema, type Contact, type Project, type InsertContact, type InsertProject } from "@shared/schema";

export default function LeadsProjects() {
  const [activeTab, setActiveTab] = useState<'leads' | 'projects'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [newContactDialogOpen, setNewContactDialogOpen] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const contactForm = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      leadScore: 0,
      leadTemperature: "cold",
      notes: "",
    },
  });

  const projectForm = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      projectType: "",
      status: "planning",
      priority: "normal",
    },
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/contacts'],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      return apiRequest('POST', '/api/contacts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setNewContactDialogOpen(false);
      contactForm.reset();
      toast({
        title: "Contact created",
        description: "Contact has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create contact.",
        variant: "destructive",
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      return apiRequest('POST', '/api/projects', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setNewProjectDialogOpen(false);
      projectForm.reset();
      toast({
        title: "Project created",
        description: "Project has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Contact> }) => {
      return apiRequest('PUT', `/api/contacts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update contact.",
        variant: "destructive",
      });
    },
  });

  const filteredContacts = contacts?.filter((contact: Contact) => {
    const matchesSearch = `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || contact.leadTemperature === filterBy;
    
    return matchesSearch && matchesFilter;
  });

  const filteredProjects = projects?.filter((project: Project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.lakeArea?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || project.status === filterBy;
    
    return matchesSearch && matchesFilter;
  });

  const getLeadTemperatureBadge = (temp: string) => {
    switch (temp) {
      case 'hot': return <Badge className="badge-hot">HOT</Badge>;
      case 'warm': return <Badge className="badge-warm">WARM</Badge>;
      case 'cold': return <Badge className="badge-cold">COLD</Badge>;
      default: return <Badge className="badge-cold">COLD</Badge>;
    }
  };

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/20 text-green-400">COMPLETED</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500/20 text-blue-400">IN PROGRESS</Badge>;
      case 'planning': return <Badge className="bg-yellow-500/20 text-yellow-400">PLANNING</Badge>;
      case 'cancelled': return <Badge className="bg-red-500/20 text-red-400">CANCELLED</Badge>;
      default: return <Badge className="bg-gray-500/20 text-gray-400">{status?.toUpperCase()}</Badge>;
    }
  };

  const updateLeadTemperature = (contactId: number, newTemp: string) => {
    updateContactMutation.mutate({
      id: contactId,
      data: { leadTemperature: newTemp }
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                Leads & Projects
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your contacts, leads, and project portfolio
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={newContactDialogOpen} onOpenChange={setNewContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-contact">
                    + New Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Contact</DialogTitle>
                  </DialogHeader>
                  <Form {...contactForm}>
                    <form onSubmit={contactForm.handleSubmit((data) => createContactMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={contactForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={contactForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-company" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={contactForm.control}
                          name="leadScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lead Score</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  value={field.value || ""} 
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                  data-testid="input-lead-score" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactForm.control}
                          name="leadTemperature"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lead Temperature</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "cold"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-lead-temperature">
                                    <SelectValue placeholder="Select temperature" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hot">Hot</SelectItem>
                                  <SelectItem value="warm">Warm</SelectItem>
                                  <SelectItem value="cold">Cold</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={contactForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} data-testid="input-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setNewContactDialogOpen(false)}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createContactMutation.isPending}
                          data-testid="button-submit"
                        >
                          {createContactMutation.isPending ? "Creating..." : "Create Contact"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" data-testid="button-new-project">
                    + New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <Form {...projectForm}>
                    <form onSubmit={projectForm.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={projectForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-project-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={projectForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} data-testid="input-project-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={projectForm.control}
                          name="projectType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Type</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., new_dock, rebuild" data-testid="input-project-type" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={projectForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "planning"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-project-status">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="planning">Planning</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setNewProjectDialogOpen(false)}
                          data-testid="button-cancel-project"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createProjectMutation.isPending}
                          data-testid="button-submit-project"
                        >
                          {createProjectMutation.isPending ? "Creating..." : "Create Project"}
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
        <div className="p-8 space-y-6">
          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex space-x-8">
              <button
                className={`tab-button ${activeTab === 'leads' ? 'active' : ''}`}
                onClick={() => setActiveTab('leads')}
                data-testid="button-tab-leads"
              >
                Leads & Contacts
              </button>
              <button
                className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
                data-testid="button-tab-projects"
              >
                Projects
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder={activeTab === 'leads' ? "Search contacts..." : "Search projects..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
                data-testid="input-search"
              />
            </div>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48" data-testid="select-filter">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {activeTab}</SelectItem>
                {activeTab === 'leads' ? (
                  <>
                    <SelectItem value="hot">Hot Leads</SelectItem>
                    <SelectItem value="warm">Warm Leads</SelectItem>
                    <SelectItem value="cold">Cold Leads</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-leads-title">
                  Contacts & Leads ({filteredContacts?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-muted-foreground">Loading contacts...</p>
                  </div>
                ) : filteredContacts?.length ? (
                  <div className="space-y-4">
                    {filteredContacts.map((contact: Contact) => (
                      <div 
                        key={contact.id} 
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-muted transition-colors"
                        data-testid={`card-contact-${contact.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">
                            {contact.firstName?.[0]}{contact.lastName?.[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground" data-testid={`text-contact-name-${contact.id}`}>
                              {contact.firstName} {contact.lastName}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {contact.email && (
                                <span data-testid={`text-contact-email-${contact.id}`}>{contact.email}</span>
                              )}
                              {contact.phone && (
                                <span data-testid={`text-contact-phone-${contact.id}`}>{contact.phone}</span>
                              )}
                              {contact.company && (
                                <span data-testid={`text-contact-company-${contact.id}`}>{contact.company}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                              <span>Lead Score: {contact.leadScore}</span>
                              <span>•</span>
                              <span>Source: {contact.leadSource || 'Unknown'}</span>
                              {contact.city && (
                                <>
                                  <span>•</span>
                                  <span>{contact.city}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select 
                            value={contact.leadTemperature || 'cold'} 
                            onValueChange={(value) => updateLeadTemperature(contact.id, value)}
                          >
                            <SelectTrigger className="w-24 h-8" data-testid={`select-temperature-${contact.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hot">HOT</SelectItem>
                              <SelectItem value="warm">WARM</SelectItem>
                              <SelectItem value="cold">COLD</SelectItem>
                            </SelectContent>
                          </Select>
                          {getLeadTemperatureBadge(contact.leadTemperature || 'cold')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <p className="text-muted-foreground" data-testid="text-no-contacts">No contacts found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm || filterBy !== 'all' ? 'Try adjusting your filters' : 'Add your first contact to get started'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-projects-title">
                  Projects ({filteredProjects?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-muted-foreground">Loading projects...</p>
                  </div>
                ) : filteredProjects?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project: Project) => (
                      <Card key={project.id} className="bg-secondary" data-testid={`card-project-${project.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg" data-testid={`text-project-name-${project.id}`}>
                                {project.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1" data-testid={`text-project-type-${project.id}`}>
                                {project.projectType?.replace('_', ' ') || 'General Project'}
                              </p>
                            </div>
                            {getProjectStatusBadge(project.status || 'planning')}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mb-3" data-testid={`text-project-description-${project.id}`}>
                              {project.description.length > 100 
                                ? `${project.description.substring(0, 100)}...` 
                                : project.description
                              }
                            </p>
                          )}
                          <div className="space-y-2 text-xs text-muted-foreground">
                            {project.location && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span data-testid={`text-project-location-${project.id}`}>
                                  {project.location}
                                  {project.lakeArea && ` • ${project.lakeArea} Lake`}
                                </span>
                              </div>
                            )}
                            {project.estimatedValue && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span data-testid={`text-project-value-${project.id}`}>
                                  ${Number(project.estimatedValue).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {project.estimatedStartDate && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span data-testid={`text-project-start-${project.id}`}>
                                  Start: {new Date(project.estimatedStartDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <p className="text-muted-foreground" data-testid="text-no-projects">No projects found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm || filterBy !== 'all' ? 'Try adjusting your filters' : 'Create your first project to get started'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
