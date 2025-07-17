import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, FileText, Trash2, Calendar, Plus } from 'lucide-react';
import { useDrafts } from '@/hooks/useDrafts';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface DraftManagerProps {
  toolType: string;
  currentFormData: Record<string, any>;
  currentOutput?: Record<string, any>;
  onLoadDraft: (draft: { formData: Record<string, any>; partialOutput?: Record<string, any> }) => void;
  caseId?: number;
}

export function DraftManager({ 
  toolType, 
  currentFormData, 
  currentOutput, 
  onLoadDraft,
  caseId 
}: DraftManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const { 
    drafts, 
    isDraftsLoading,
    createDraft,
    updateDraft,
    deleteDraft,
    isCreating,
    isDeleting 
  } = useDrafts(toolType);

  const handleSaveDraft = async () => {
    if (!draftTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your draft",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      createDraft({
        toolType,
        title: draftTitle.trim(),
        formData: currentFormData,
        partialOutput: currentOutput,
        caseId,
      });
      
      setDraftTitle('');
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Draft saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDraft = (draft: any) => {
    onLoadDraft({
      formData: draft.formData,
      partialOutput: draft.partialOutput,
    });
    setIsOpen(false);
    toast({
      title: "Success",
      description: "Draft loaded successfully",
    });
  };

  const handleDeleteDraft = (draftId: number) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      deleteDraft(draftId);
      toast({
        title: "Success",
        description: "Draft deleted successfully",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'in-progress':
        return 'bg-yellow-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700">
          <FileText className="h-4 w-4 mr-2" />
          Manage Drafts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Manage Drafts</DialogTitle>
          <DialogDescription className="text-slate-400">
            Save your current work or load a previously saved draft
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Save Current Work */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Save className="h-5 w-5" />
                Save Current Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="draftTitle" className="text-slate-300">Draft Title</Label>
                <Input
                  id="draftTitle"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your draft..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button 
                onClick={handleSaveDraft}
                disabled={isSaving || isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving || isCreating ? 'Saving...' : 'Save Draft'}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Drafts */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Saved Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDraftsLoading ? (
                <div className="text-slate-400">Loading drafts...</div>
              ) : drafts.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  No drafts saved yet. Save your current work to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {drafts.map((draft) => (
                    <div key={draft.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-medium">{draft.title}</h3>
                          <Badge className={getStatusColor(draft.status || 'draft')}>
                            {draft.status || 'draft'}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoadDraft(draft)}
                          className="bg-slate-600 border-slate-500 hover:bg-slate-500"
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDraft(draft.id)}
                          disabled={isDeleting}
                          className="bg-red-600 border-red-500 hover:bg-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}