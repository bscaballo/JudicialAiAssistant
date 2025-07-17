import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Trash2, Upload, Calendar, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { type Case, type Document } from "@shared/schema";
import { format } from "date-fns";

interface CaseDocumentsProps {
  selectedCase: Case | null;
}

export function CaseDocuments({ selectedCase }: CaseDocumentsProps) {
  const { data: documents, isLoading, refetch } = useQuery<Document[]>({
    queryKey: ['/api/documents', selectedCase?.id],
    queryOptions: {
      enabled: !!selectedCase,
    },
    queryFn: async () => {
      if (!selectedCase) return [];
      const response = await fetch(`/api/documents?caseId=${selectedCase.id}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    else return Math.round(bytes / 1048576) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('doc')) return '📝';
    if (fileType.includes('txt')) return '📃';
    return '📎';
  };

  const handleDownload = async (document: Document) => {
    try {
      window.open(document.filePath, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  if (!selectedCase) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Documents
            </CardTitle>
            <CardDescription>
              Please select a case from the sidebar to view its documents
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Documents
            </div>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardTitle>
          <CardDescription>
            Documents for case: {selectedCase.caseName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{getFileIcon(doc.fileType)}</div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{doc.fileName}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileIcon className="h-3 w-3" />
                          {formatFileSize(doc.fileSize)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(doc.uploadedAt!), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {doc.textContent && (
                        <Badge variant="secondary" className="text-xs">
                          Text extracted
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No documents uploaded for this case yet
              </p>
              <Button variant="outline" className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Upload First Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}