import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gavel, Scale, BookOpen, FileText } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gavel className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-serif font-bold">Judicial AI Assistant</h1>
                <p className="text-sm text-slate-400">Professional Legal Case Management</p>
              </div>
            </div>
            <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-serif font-bold mb-6">
            AI-Powered Legal Assistant
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Streamline your judicial workflow with comprehensive AI tools for case management, 
            legal research, and document generation.
          </p>
          <Button onClick={handleSignIn} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Get Started
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-serif font-bold text-center mb-12">
            Comprehensive Legal Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Case Briefer</h4>
                <p className="text-slate-400 text-sm">
                  Generate comprehensive case summaries from legal documents
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Legal Research</h4>
                <p className="text-slate-400 text-sm">
                  Search legal databases and find relevant precedents
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6 text-center">
                <Scale className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Order Drafter</h4>
                <p className="text-slate-400 text-sm">
                  Generate formal court orders and legal documents
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-6 text-center">
                <Gavel className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Daily Docket</h4>
                <p className="text-slate-400 text-sm">
                  Manage court schedules and case proceedings
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8">
                <Gavel className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                <h3 className="text-2xl font-serif font-bold mb-4">
                  Secure Access for Legal Professionals
                </h3>
                <p className="text-slate-400 mb-6">
                  Sign in with your Google account to access the full suite of judicial AI tools.
                </p>
                <Button 
                  onClick={handleSignIn} 
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2024 Judicial AI Assistant. Professional legal case management system.</p>
        </div>
      </footer>
    </div>
  );
}
