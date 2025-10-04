import { useState, useRef, DragEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoImage from "@assets/business logo_edited_1759533993964.avif";

type ViewMode = 'grid' | 'list';

export default function Documents() {
  const [activeTab, setActiveTab] = useState<'all' | 'estimates' | 'drawings' | 'permits' | 'contracts'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      setSelectedDoc(null);
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

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setIsUploadDialogOpen(true);
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

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];

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

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getDocumentIcon = (type: string, mimeType?: string) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType?.includes('word')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
    if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return '📽️';
    return '📁';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      estimate: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      drawing: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      permit: 'bg-green-500/10 text-green-400 border-green-500/30',
      contract: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      general: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    };
    return colors[type] || colors.general;
  };

  const filteredDocuments = documents?.filter((doc: any) => {
    const matchesSearch = !searchTerm ||
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const stats = {
    total: documents?.length || 0,
    estimates: documents?.filter((d: any) => d.type === 'estimate').length || 0,
    drawings: documents?.filter((d: any) => d.type === 'drawing').length || 0,
    permits: documents?.filter((d: any) => d.type === 'permit').length || 0,
    contracts: documents?.filter((d: any) => d.type === 'contract').length || 0,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 relative">
        {/* Logo Watermark */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 ml-64">
          <img
            src={logoImage}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-2xl opacity-[0.02] select-none"
          />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-glass border-b border-border/50 relative">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="animate-fade-in-scale">
              <h1 className="section-title gradient-text">Document Vault</h1>
              <p className="text-muted-foreground mt-2 font-medium">
                Secure document management with drag-and-drop upload, categorization, and instant search
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span className="text-sm text-primary font-medium">{stats.total} Documents</span>
              </div>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <button className="premium-button">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    Upload Document
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold gradient-text">Upload New Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 py-6">
                    {/* Drag and Drop Zone */}
                    <div
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
                        isDragging
                          ? 'border-primary bg-primary/10 scale-105'
                          : selectedFile
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/50 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/30'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="text-center">
                        {selectedFile ? (
                          <>
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-4xl">{getDocumentIcon(documentType, selectedFile.type)}</span>
                            </div>
                            <h4 className="text-lg font-bold text-foreground mb-2">{selectedFile.name}</h4>
                            <p className="text-sm text-muted-foreground mb-1">{formatFileSize(selectedFile.size)}</p>
                            <p className="text-xs text-primary font-medium">Click to change file</p>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                              </svg>
                            </div>
                            <h4 className="text-lg font-bold text-foreground mb-2">
                              {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
                            <p className="text-xs text-muted-foreground">PDF, Images, Word, Excel, PowerPoint supported</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Document Type Selection - Premium Cards */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-3 block flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                        Document Category
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {[
                          { value: 'estimate', icon: '💰', label: 'Estimate' },
                          { value: 'drawing', icon: '📐', label: 'Drawing' },
                          { value: 'permit', icon: '✅', label: 'Permit' },
                          { value: 'contract', icon: '📋', label: 'Contract' },
                          { value: 'general', icon: '📁', label: 'General' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setDocumentType(type.value)}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                              documentType === type.value
                                ? 'bg-primary/10 border-primary shadow-lg scale-105'
                                : 'bg-secondary/30 border-border/30 hover:border-primary/30'
                            }`}
                          >
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <div className="text-xs font-bold">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Project Selection */}
                    <div>
                      <label className="text-sm font-bold text-foreground mb-3 block">
                        Link to Project <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger className="bg-secondary/50 border-border/50 h-12">
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

                    <button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending || !selectedFile || !documentType}
                      className="premium-button w-full h-12 text-base"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Upload Document
                        </>
                      )}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
              <img
                src={logoImage}
                alt="TBDock"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6 relative z-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="glass-card p-5 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📊</span>
                <span className="text-2xl font-black text-primary">{stats.total}</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Total Documents</div>
            </div>
            <div className="glass-card p-5 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💰</span>
                <span className="text-2xl font-black text-blue-400">{stats.estimates}</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Estimates</div>
            </div>
            <div className="glass-card p-5 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📐</span>
                <span className="text-2xl font-black text-purple-400">{stats.drawings}</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Drawings</div>
            </div>
            <div className="glass-card p-5 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">✅</span>
                <span className="text-2xl font-black text-green-400">{stats.permits}</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Permits</div>
            </div>
            <div className="glass-card p-5 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📋</span>
                <span className="text-2xl font-black text-yellow-400">{stats.contracts}</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Contracts</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between space-x-4">
              {/* Category Tabs */}
              <div className="flex items-center space-x-2">
                {[
                  { value: 'all', label: 'All', icon: '📁' },
                  { value: 'estimates', label: 'Estimates', icon: '💰' },
                  { value: 'drawings', label: 'Drawings', icon: '📐' },
                  { value: 'permits', label: 'Permits', icon: '✅' },
                  { value: 'contracts', label: 'Contracts', icon: '📋' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value as any)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      activeTab === tab.value
                        ? 'bg-primary text-background shadow-lg'
                        : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search and View Controls */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-secondary/30 border border-border/30 rounded-lg text-sm focus:border-primary/50 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-1 bg-secondary/30 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-primary text-background' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-primary text-background' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Display */}
          <div className="glass-card p-8">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                <p className="text-muted-foreground font-medium">Loading documents...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredDocuments.map((doc: any) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="group relative overflow-hidden bg-secondary/30 border-2 border-border/30 rounded-xl p-6 hover:border-primary/30 hover:bg-secondary/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                    >
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <span className="text-4xl">{getDocumentIcon(doc.type, doc.mimeType)}</span>
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(doc.type)}`}>
                          {doc.type?.toUpperCase()}
                        </div>
                      </div>

                      <h4 className="font-bold text-foreground text-center mb-2 line-clamp-2 min-h-[3rem]">
                        {doc.name}
                      </h4>

                      <div className="space-y-2 text-xs text-muted-foreground text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                          </svg>
                          <span>{getFileExtension(doc.name)}</span>
                        </div>
                        <div>{formatFileSize(doc.fileSize || 0)}</div>
                        <div className="flex items-center justify-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-4 flex items-center justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.filePath, '_blank');
                          }}
                          className="glass-button px-3 py-1 text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(doc.id);
                          }}
                          className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc: any) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="group flex items-center justify-between p-4 bg-secondary/30 border-2 border-border/30 rounded-xl hover:border-primary/30 hover:bg-secondary/50 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{getDocumentIcon(doc.type, doc.mimeType)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-foreground mb-1 truncate">{doc.name}</h4>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span>{getFileExtension(doc.name)}</span>
                            <span>•</span>
                            <span>{formatFileSize(doc.fileSize || 0)}</span>
                            <span>•</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(doc.type)}`}>
                          {doc.type?.toUpperCase()}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.filePath, '_blank');
                          }}
                          className="glass-button px-4 py-2 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(doc.id);
                          }}
                          className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Documents Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
                </p>
                {!searchTerm && (
                  <button onClick={() => setIsUploadDialogOpen(true)} className="premium-button">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    Upload Your First Document
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Document Preview Modal */}
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="sm:max-w-[700px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold gradient-text">{selectedDoc?.name}</DialogTitle>
            </DialogHeader>
            {selectedDoc && (
              <div className="space-y-6 py-6">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-4xl">{getDocumentIcon(selectedDoc.type, selectedDoc.mimeType)}</span>
                    </div>
                    <div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${getTypeColor(selectedDoc.type)}`}>
                        {selectedDoc.type?.toUpperCase()}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>File: {getFileExtension(selectedDoc.name)}</div>
                        <div>Size: {formatFileSize(selectedDoc.fileSize || 0)}</div>
                        <div>Created: {new Date(selectedDoc.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.open(selectedDoc.filePath, '_blank')}
                    className="premium-button flex-1"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Open Document
                  </button>
                  <button
                    onClick={() => {
                      deleteMutation.mutate(selectedDoc.id);
                      setSelectedDoc(null);
                    }}
                    className="flex-1 px-6 py-3 bg-red-500/10 text-red-400 border-2 border-red-500/30 rounded-xl font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete Document
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
