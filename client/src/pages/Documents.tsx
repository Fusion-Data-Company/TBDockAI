import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Documents() {
  const [activeTab, setActiveTab] = useState<'all' | 'estimates' | 'drawings' | 'permits' | 'contracts'>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [projectId, setProjectId] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents', activeTab],
    queryFn: () => {
      const params = activeTab !== 'all' ? `?type=${activeTab}` : '';
      return fetch(`/api/documents${params}`).then(res => res.json());
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { fileName: string; fileData: string; mimeType: string; documentType: string; projectId?: number }) => {
      return apiRequest('POST', '/api/documents/upload', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentType('');
      setProjectId('');
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Document deleted",
        description: "Document has been removed.",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Missing information",
        description: "Please select a file and document type.",
        variant: "destructive",
      });
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1]; // Remove data:...;base64, prefix

      uploadMutation.mutate({
        fileName: selectedFile.name,
        fileData: base64Data,
        mimeType: selectedFile.type,
        documentType,
        projectId: projectId ? parseInt(projectId) : undefined,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getDocumentIcon = (type: string, mimeType?: string) => {
    if (mimeType?.startsWith('image/')) {
      return (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      );
    }
    if (mimeType === 'application/pdf') {
      return (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      estimate: 'bg-blue-500/20 text-blue-400',
      drawing: 'bg-purple-500/20 text-purple-400',
      permit: 'bg-green-500/20 text-green-400',
      contract: 'bg-yellow-500/20 text-yellow-400',
      general: 'bg-gray-500/20 text-gray-400',
    };
    return <Badge className={colors[type] || colors.general}>{type.toUpperCase()}</Badge>;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-glass border-b border-border/50">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="animate-fade-in-scale">
              <h2 className="section-title text-foreground">Document Management</h2>
              <p className="text-muted-foreground mt-1">
                Upload and manage project documents, estimates, and permits
              </p>
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <button className="premium-button">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  Upload Document
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Upload New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Select File
                    </label>
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      className="bg-secondary/50 border-border/50"
                    />
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Document Type
                    </label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger className="bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="estimate">Estimate</SelectItem>
                        <SelectItem value="drawing">Drawing</SelectItem>
                        <SelectItem value="permit">Permit</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Project (Optional)
                    </label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger className="bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Select project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map((project: any) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending || !selectedFile || !documentType}
                    className="w-full premium-button"
                  >
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Tabs */}
          <div className="border-b border-border/50">
            <div className="flex space-x-1">
              {['all', 'estimates', 'drawings', 'permits', 'contracts'].map((tab) => (
                <button
                  key={tab}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab as any)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          <div className="glass-card p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-2 text-muted-foreground">Loading documents...</p>
              </div>
            ) : documents?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="bg-secondary/50 rounded-xl p-4 hover-lift"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(doc.type, doc.mimeType)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">
                            {doc.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(doc.fileSize || 0)}
                          </p>
                        </div>
                      </div>
                      {getTypeBadge(doc.type)}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(doc.filePath, '_blank')}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(doc.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <p className="text-muted-foreground">No documents found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your first document to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
