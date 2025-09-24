// Complaint tracking page for citizens to view their complaint status

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Search, Clock, User, MapPin, FileText, MessageSquare, Download } from 'lucide-react';
import { Complaint } from '@/types';
import { useComplaintData } from '@/hooks/useComplaintData';
import { toast } from '@/hooks/use-toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'New': return 'status-new';
    case 'In Review': return 'status-in-progress';
    case 'Resolved': return 'status-resolved';
    case 'Rejected': return 'status-rejected';
    default: return 'status-new';
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TrackComplaint = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getComplaintById } = useComplaintData();
  const [trackingId, setTrackingId] = useState(id || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      handleSearch();
    }
  }, [id]);

  const handleSearch = () => {
    if (!trackingId.trim()) {
      toast({
        title: "Missing Tracking ID",
        description: "Please enter a valid complaint tracking ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const foundComplaint = getComplaintById(trackingId.trim());
      
      if (foundComplaint) {
        setComplaint(foundComplaint);
        // Update URL if not already there
        if (window.location.pathname !== `/my/${trackingId}`) {
          window.history.pushState({}, '', `/my/${trackingId}`);
        }
      } else {
        setComplaint(null);
        toast({
          title: "Complaint Not Found",
          description: "No complaint found with this tracking ID. Please check the ID and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching for complaint:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching for the complaint",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAttachment = (attachment: any) => {
    try {
      // Create download link for base64 data
      const link = document.createElement('a');
      link.href = attachment.base64;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Download Error", 
        description: "Failed to download attachment",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Track Complaint</h1>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/submit')}
            >
              Submit New Complaint
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Enter Tracking ID</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Enter your complaint tracking ID (format: CT-YYYYMMDD-XXXX) to view status and details.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Input
                  placeholder="CT-20241124-0001"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="min-w-24"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Complaint Details */}
          {complaint && (
            <div className="space-y-6">
              {/* Status Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Complaint #{complaint.id}</CardTitle>
                    <Badge className={`${getStatusColor(complaint.status)} border`}>
                      {complaint.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{complaint.title}</h3>
                    <p className="text-muted-foreground">{complaint.description}</p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Category</p>
                        <p className="text-sm text-muted-foreground">{complaint.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Priority</p>
                        <p className="text-sm text-muted-foreground">{complaint.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(complaint.createdAt)}
                        </p>
                      </div>
                    </div>
                    {complaint.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{complaint.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {complaint.assignee && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="text-sm">
                        <span className="font-medium">Assigned to:</span> {complaint.assignee}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* History Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Status History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complaint.history.map((entry, index) => (
                      <div key={entry.id} className="flex space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                            {index + 1}
                          </div>
                          {index < complaint.history.length - 1 && (
                            <div className="h-8 w-px bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{entry.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(entry.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">By {entry.by}</p>
                          {entry.note && (
                            <p className="mt-2 text-sm bg-muted/50 rounded p-2">{entry.note}</p>
                          )}
                          {entry.previousStatus && entry.newStatus && (
                            <div className="mt-2 flex items-center space-x-2 text-sm">
                              <Badge className={getStatusColor(entry.previousStatus)} variant="outline">
                                {entry.previousStatus}
                              </Badge>
                              <span>→</span>
                              <Badge className={getStatusColor(entry.newStatus)} variant="outline">
                                {entry.newStatus}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              {complaint.comments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Comments & Updates</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {complaint.comments
                        .filter(comment => !comment.isPrivate) // Only show public comments to citizens
                        .map((comment) => (
                        <div key={comment.id} className="rounded-lg border bg-muted/50 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{comment.by}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(comment.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))}
                      {complaint.comments.filter(c => !c.isPrivate).length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No public comments available for this complaint.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              {complaint.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Attachments</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {complaint.attachments.map((attachment) => (
                        <div 
                          key={attachment.id} 
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{attachment.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Reporter</p>
                      <p className="text-sm text-muted-foreground">{complaint.reporter.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{complaint.reporter.email}</p>
                    </div>
                    {complaint.reporter.phone && (
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{complaint.reporter.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Preferred Contact</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {complaint.reporter.preferredContact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* No Results */}
          {!complaint && trackingId && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Complaint Found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find a complaint with ID "{trackingId}". Please check the tracking ID and try again.
                </p>
                <Button variant="outline" onClick={() => setTrackingId('')}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrackComplaint;