// Page for citizens to track the status of their submitted complaint

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, FileText, Clock, AlertTriangle, Download, MessageSquare, User, MapPin } from 'lucide-react';
import { Complaint, Attachment } from '@/types';
import { useComplaintData } from '@/hooks/useComplaintData'; 
import { toast } from '@/hooks/use-toast';

// Helper to format date and time
const formatDateTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'In Review': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

const TrackComplaint = () => {
  const navigate = useNavigate();
  const { id: urlId } = useParams<{ id: string }>();
  const { getComplaintById } = useComplaintData();

  const [searchId, setSearchId] = useState(urlId || '');
  const [complaint, setComplaint] = useState<Complaint | null | undefined>(undefined);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(() => {
    if (!searchId.trim()) {
      toast({
        title: "Tracking ID Required",
        description: "Please enter a complaint ID to search.",
        variant: "destructive",
      });
      return;
    }
    const foundComplaint = getComplaintById(searchId.trim());
    setComplaint(foundComplaint);
    setSearched(true);
    if (!foundComplaint) {
        toast({
            title: "Complaint Not Found",
            description: `No complaint found with ID "${searchId.trim()}".`,
            variant: "destructive",
        });
    }
  }, [searchId, getComplaintById]);

  useEffect(() => {
    if (urlId) {
      handleSearch();
    }
  }, [urlId, handleSearch]);

  const handleClear = () => {
    setSearchId('');
    setComplaint(undefined);
    setSearched(false);
    navigate('/track');
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    try {
      const link = document.createElement('a');
      link.href = attachment.base64;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download the attachment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-xl font-semibold">Track Complaint</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/submit')}>
              <FileText className="h-4 w-4 mr-2" />
              Submit New Complaint
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Search className="h-5 w-5 mr-2" />Enter Tracking ID</CardTitle>
              <p className="text-sm text-muted-foreground">Enter your complaint ID to view its status and details.</p>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input placeholder="e.g., CT-20250925-1234" value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </CardContent>
          </Card>

          {searched && (
            complaint ? (
              <div className="space-y-6 animate-in fade-in-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Complaint Details</CardTitle>
                        <p className="text-sm font-mono text-muted-foreground pt-1">{complaint.id}</p>
                      </div>
                      <Badge className={`text-base ${getStatusColor(complaint.status)}`}>{complaint.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h3 className="font-semibold text-lg">{complaint.title}</h3>
                    <p className="text-muted-foreground">{complaint.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div><p className="text-sm font-semibold">Category:</p><p>{complaint.category}</p></div>
                      <div><p className="text-sm font-semibold">Priority:</p><p>{complaint.priority}</p></div>
                      <div><p className="text-sm font-semibold">Date Lodged:</p><p>{formatDateTime(complaint.createdAt)}</p></div>
                      <div><p className="text-sm font-semibold">Last Updated:</p><p>{formatDateTime(complaint.updatedAt)}</p></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center"><Clock className="h-5 w-5 mr-2" />Status History</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {complaint.history.map((entry) => (
                                <div key={entry.id} className="flex items-start space-x-3">
                                    <div className="pt-1"><Clock className="h-4 w-4 text-gray-500" /></div>
                                    <div>
                                        <p className="font-semibold">{entry.action} by {entry.by}</p>
                                        <p className="text-sm text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
                                        {entry.note && <p className="text-sm italic mt-1 p-2 bg-slate-100 rounded">"{entry.note}"</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
                <div className="text-center">
                  <Button variant="outline" onClick={handleClear}>Clear Search</Button>
                </div>
              </div>
            ) : (
              <Card className="text-center py-12 animate-in fade-in-0">
                <CardHeader>
                  <div className="mx-auto bg-red-100 rounded-full h-16 w-16 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="mt-4">No Complaint Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">We couldn't find a complaint with ID "{searchId}".<br/>Please check the tracking ID and try again.</p>
                  <Button variant="outline" onClick={handleClear} className="mt-6">Clear Search</Button>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default TrackComplaint;