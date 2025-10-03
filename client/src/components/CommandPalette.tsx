import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category: 'navigation' | 'action' | 'search' | 'create';
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [location, navigate] = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: contacts } = useQuery({ queryKey: ['/api/contacts'] });
  const { data: opportunities } = useQuery({ queryKey: ['/api/opportunities'] });
  const { data: projects } = useQuery({ queryKey: ['/api/projects'] });

  // Keyboard shortcut to open (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearch('');
        setSelectedIndex(0);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Navigation commands
  const navigationCommands: Command[] = [
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'View your automation dashboard',
      category: 'navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      ),
      action: () => { navigate('/'); setIsOpen(false); },
    },
    {
      id: 'nav-leads',
      label: 'Leads & Projects',
      description: 'Manage your contacts and projects',
      category: 'navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      action: () => { navigate('/leads-projects'); setIsOpen(false); },
    },
    {
      id: 'nav-pipeline',
      label: 'Sales Pipeline',
      description: 'Track opportunities through stages',
      category: 'navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
      action: () => { navigate('/sales-pipeline'); setIsOpen(false); },
    },
    {
      id: 'nav-ai-agents',
      label: 'AI Agents',
      description: 'Configure AI content generation',
      category: 'navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      ),
      action: () => { navigate('/ai-agents'); setIsOpen(false); },
    },
    {
      id: 'nav-marketing',
      label: 'Marketing',
      description: 'Campaigns and content management',
      category: 'navigation',
      action: () => { navigate('/marketing'); setIsOpen(false); },
    },
    {
      id: 'nav-analytics',
      label: 'Analytics',
      description: 'View performance metrics',
      category: 'navigation',
      action: () => { navigate('/analytics'); setIsOpen(false); },
    },
    {
      id: 'nav-documents',
      label: 'Documents',
      description: 'Manage project documents',
      category: 'navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      ),
      action: () => { navigate('/documents'); setIsOpen(false); },
    },
  ];

  // Action commands
  const actionCommands: Command[] = [
    {
      id: 'action-score-leads',
      label: 'Score All Leads',
      description: 'Run lead scoring algorithm on all contacts',
      category: 'action',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      action: () => {
        fetch('/api/leads/score-all', { method: 'POST' }).then(() => {
          setIsOpen(false);
          window.location.reload();
        });
      },
    },
  ];

  // Create commands
  const createCommands: Command[] = [
    {
      id: 'create-lead',
      label: 'New Lead',
      description: 'Create a new contact/lead',
      shortcut: '⌘N',
      category: 'create',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
        </svg>
      ),
      action: () => { navigate('/leads-projects'); setIsOpen(false); },
    },
    {
      id: 'create-opportunity',
      label: 'New Opportunity',
      description: 'Create a sales opportunity',
      category: 'create',
      action: () => { navigate('/sales-pipeline'); setIsOpen(false); },
    },
    {
      id: 'create-content',
      label: 'Generate AI Content',
      description: 'Create blog post, newsletter, or social post',
      category: 'create',
      action: () => { navigate('/ai-agents'); setIsOpen(false); },
    },
  ];

  // Search commands (dynamically generated from data)
  const searchCommands: Command[] = useMemo(() => {
    const commands: Command[] = [];

    // Add contact search results
    if (contacts && Array.isArray(contacts)) {
      contacts.slice(0, 5).forEach((contact: any) => {
        commands.push({
          id: `contact-${contact.id}`,
          label: `${contact.firstName} ${contact.lastName}`,
          description: contact.email || contact.phone || 'Contact',
          category: 'search',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          ),
          action: () => { navigate('/leads-projects'); setIsOpen(false); },
        });
      });
    }

    return commands;
  }, [contacts, navigate]);

  // Combine all commands
  const allCommands = [
    ...navigationCommands,
    ...createCommands,
    ...actionCommands,
    ...searchCommands,
  ];

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return allCommands;

    const searchLower = search.toLowerCase();
    return allCommands.filter(
      cmd =>
        cmd.label.toLowerCase().includes(searchLower) ||
        cmd.description?.toLowerCase().includes(searchLower)
    );
  }, [search, allCommands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {
      navigation: [],
      create: [],
      action: [],
      search: [],
    };

    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filteredCommands[selectedIndex]?.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      navigation: 'Navigation',
      create: 'Create New',
      action: 'Actions',
      search: 'Search Results',
    };
    return labels[category] || category;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-card border-border/50 p-0 max-w-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="border-0 bg-transparent text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <Badge variant="outline" className="text-xs">
              ESC
            </Badge>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin p-2">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No commands found</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => {
              if (commands.length === 0) return null;

              return (
                <div key={category} className="mb-4">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {getCategoryLabel(category)}
                  </p>
                  <div className="space-y-1">
                    {commands.map((cmd, idx) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'hover:bg-secondary/50 text-foreground'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {cmd.icon && (
                              <div className={isSelected ? 'text-primary' : 'text-muted-foreground'}>
                                {cmd.icon}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{cmd.label}</p>
                              {cmd.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {cmd.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {cmd.shortcut && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {cmd.shortcut}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 bg-secondary/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Badge variant="outline" className="mr-1 text-xs">↑↓</Badge>
                Navigate
              </span>
              <span className="flex items-center">
                <Badge variant="outline" className="mr-1 text-xs">↵</Badge>
                Select
              </span>
            </div>
            <span className="flex items-center">
              <Badge variant="outline" className="mr-1 text-xs">⌘K</Badge>
              Toggle
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
