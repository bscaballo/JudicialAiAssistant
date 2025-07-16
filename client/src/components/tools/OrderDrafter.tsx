import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Download, Wand2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function OrderDrafter() {
  const [orderType, setOrderType] = useState("");
  const [caseDetails, setCaseDetails] = useState({
    caseName: "",
    caseNumber: "",
    court: "Division II District Court",
  });
  const [rulingDetails, setRulingDetails] = useState("");
  const [generatedOrder, setGeneratedOrder] = useState<any>(null);
  const { toast } = useToast();

  const generateOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/orders/generate", {
        orderType,
        caseDetails,
        rulingDetails,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedOrder(data);
      toast({
        title: "Success",
        description: "Order generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate order",
        variant: "destructive",
      });
    },
  });

  const handleGenerateOrder = () => {
    if (!orderType) {
      toast({
        title: "Error",
        description: "Please select an order type",
        variant: "destructive",
      });
      return;
    }

    if (!caseDetails.caseName || !caseDetails.caseNumber) {
      toast({
        title: "Error",
        description: "Please fill in case name and case number",
        variant: "destructive",
      });
      return;
    }

    if (!rulingDetails.trim()) {
      toast({
        title: "Error",
        description: "Please provide ruling details",
        variant: "destructive",
      });
      return;
    }

    generateOrderMutation.mutate();
  };

  const handleExportPDF = () => {
    toast({
      title: "Info",
      description: "PDF export functionality will be implemented",
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Info",
      description: "Draft save functionality will be implemented",
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-2">Order Drafter</h2>
        <p className="text-slate-400">Generate formal court orders and legal documents</p>
      </div>

      {/* Order Type Selection */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Order Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={orderType} onValueChange={setOrderType}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 p-4 bg-slate-700 rounded-lg">
                <RadioGroupItem value="motion" id="motion" />
                <Label htmlFor="motion" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Motion Order</p>
                    <p className="text-sm text-slate-400">Grant/deny motions</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 bg-slate-700 rounded-lg">
                <RadioGroupItem value="preliminary" id="preliminary" />
                <Label htmlFor="preliminary" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Preliminary Order</p>
                    <p className="text-sm text-slate-400">Temporary relief</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 bg-slate-700 rounded-lg">
                <RadioGroupItem value="final" id="final" />
                <Label htmlFor="final" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Final Order</p>
                    <p className="text-sm text-slate-400">Case resolution</p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="caseStyle">Case Style</Label>
            <Input
              id="caseStyle"
              value={caseDetails.caseName}
              onChange={(e) => setCaseDetails(prev => ({ ...prev, caseName: e.target.value }))}
              placeholder="Plaintiff v. Defendant"
              className="bg-slate-700 border-slate-600"
            />
          </div>
          <div>
            <Label htmlFor="caseNumber">Case Number</Label>
            <Input
              id="caseNumber"
              value={caseDetails.caseNumber}
              onChange={(e) => setCaseDetails(prev => ({ ...prev, caseNumber: e.target.value }))}
              placeholder="CV-2024-0001"
              className="bg-slate-700 border-slate-600"
            />
          </div>
          <div>
            <Label htmlFor="court">Court</Label>
            <Input
              id="court"
              value={caseDetails.court}
              onChange={(e) => setCaseDetails(prev => ({ ...prev, court: e.target.value }))}
              className="bg-slate-700 border-slate-600"
            />
          </div>
          <div>
            <Label htmlFor="rulingDetails">Ruling Details</Label>
            <Textarea
              id="rulingDetails"
              value={rulingDetails}
              onChange={(e) => setRulingDetails(e.target.value)}
              placeholder="Describe the court's ruling and reasoning..."
              className="bg-slate-700 border-slate-600 min-h-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleGenerateOrder}
          disabled={generateOrderMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generateOrderMutation.isPending ? (
            <LoadingSpinner className="h-4 w-4 mr-2" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Generate Order
        </Button>
        <Button 
          onClick={handleSaveDraft}
          variant="outline" 
          className="bg-slate-700 hover:bg-slate-600"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
      </div>

      {/* Generated Order Preview */}
      {generatedOrder && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Order
              </CardTitle>
              <Button 
                onClick={handleExportPDF}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-6 text-sm leading-relaxed">
              <div className="font-serif whitespace-pre-wrap">
                {generatedOrder.content}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
