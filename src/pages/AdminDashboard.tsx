import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Settings, 
  BarChart3, 
  Eye, 
  Shield, 
  FileText 
} from 'lucide-react';
import { ComplaintFilters, PaginationOptions, ComplaintStatus, ComplaintCategory, Priority } from '@/types';
import { useComplaintData } from '@/hooks/useComplaintData';
import { toast } from '@/hooks/use-toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'New': return 'status-badge-new';
    case 'In Review': return 'status-badge-in-review';
    case 'Resolved': return 'status-badge-resolved';
    case 'Rejected': return 'status-badge-rejected';
    default: return 'status-badge-new';
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getFilteredComplaints, data, updateComplaintStatus } = useComplaintData();
  
  const [filters, setFilters] = useState<ComplaintFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { complaints, total } = useMemo(() => {
    const searchFilters = {
      ...filters,
      searchQuery: searchQuery.trim() || undefined
    };
    return getFilteredComplaints(searchFilters, pagination);
  }, [filters, searchQuery, pagination, data]);

  const summaryStats = useMemo(() => {
    if (!data) return { total: 0, new: 0, inReview: 0, resolved: 0, rejected: 0 };
    
    const all = data.complaints;
    return {
      total: all.length,
      new: all.filter(c => c.status === 'New').length,
      inReview: all.filter(c => c.status === 'In Review').length,
      resolved: all.filter(c => c.status === 'Resolved').length,
      rejected: all.filter(c => c.status === 'Rejected').length
    };
  }, [data]);

  const handleStatusUpdate = async (complaintId: string, newStatus: ComplaintStatus) => {
    const success = updateComplaintStatus(complaintId, newStatus, `Status updated via admin dashboard`);
    if (success) {
      setSelectedComplaints([]);
    }
  };

  const handleBulkStatusUpdate = (newStatus: ComplaintStatus) => {
    if (selectedComplaints.length === 0) {
      toast({
        title: "No Complaints Selected",
        description: "Please select one or more complaints to update",
        variant: "destructive"
      });
      return;
    }

    let successCount = 0;
    selectedComplaints.forEach(id => {
      const success = updateComplaintStatus(id, newStatus, `Bulk status update via admin dashboard`);
      if (success) successCount++;
    });

    toast({
      title: "Bulk Update Complete",
      description: `Updated ${successCount} of ${selectedComplaints.length} complaints to ${newStatus}`
    });

    setSelectedComplaints([]);
  };

  const handleExportSelected = () => {
    if (selectedComplaints.length === 0) {
      toast({
        title: "No Complaints Selected",
        description: "Please select one or more complaints to export",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedData = complaints.filter(c => selectedComplaints.includes(c.id));
      const csvContent = generateCSV(selectedData);
      downloadCSV(csvContent, `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Export Successful",
        description: `Exported ${selectedData.length} complaints to CSV`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export complaints. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateCSV = (complaints: any[]) => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Reporter', 'Created', 'Updated', 'Assignee'];
    const rows = complaints.map(c => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      `"${c.reporter.name}"`,
      new Date(c.createdAt).toISOString(),
      new Date(c.updatedAt).toISOString(),
      c.assignee || 'Unassigned'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedComplaints(complaints.map(c => c.id));
    } else {
      setSelectedComplaints([]);
    }
  };

  const handleSelectComplaint = (complaintId: string, checked: boolean) => {
    if (checked) {
      setSelectedComplaints(prev => [...prev, complaintId]);
    } else {
      setSelectedComplaints(prev => prev.filter(id => id !== complaintId));
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    navigate("/");
  };

  const totalPages = Math.ceil(total / pagination.limit);

  return (
    <div className="min-h-screen bg-slate-100">
      <header 
        className="bg-cover bg-center text-white shadow-lg"
        style={{ backgroundImage: `url('/assets/logo.jpeg')` }}
      >
        <div className="bg-black bg-opacity-60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="/assets/logo.jpg" 
                  alt="Maharashtra Police Logo" 
                  className="h-14 w-14"
                />
                <div>
                  <h1 className="text-xl font-bold tracking-wider">सांगली पोलीस स्टेशन</h1>
                  <p className="text-sm text-slate-200">Complaint Management Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={() => navigate('/analytics')} className="bg-teal-500 text-white hover:bg-teal-600">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button size="sm" onClick={() => navigate('/settings')} className="bg-teal-500 text-white hover:bg-teal-600">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button size="sm" onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
          <Card className="border-l-4 border-blue-700">
            <CardContent className="p-4">
                <p className="text-3xl font-bold">{summaryStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Complaints</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-yellow-500">
            <CardContent className="p-4">
                <p className="text-3xl font-bold">{summaryStats.new}</p>
                <p className="text-sm text-muted-foreground">New</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-sky-500">
            <CardContent className="p-4">
                <p className="text-3xl font-bold">{summaryStats.inReview}</p>
                <p className="text-sm text-muted-foreground">In Review</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-green-600">
            <CardContent className="p-4">
                <p className="text-3xl font-bold">{summaryStats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-red-600">
            <CardContent className="p-4">
                <p className="text-3xl font-bold">{summaryStats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters + Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters & Actions</span>
              </span>
              {selectedComplaints.length > 0 && (
                <Badge variant="secondary">
                  {selectedComplaints.length} selected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, title, reporter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select 
                value={filters.status?.[0] || "all"} 
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  status: value === "all" ? undefined : [value as ComplaintStatus]
                }))}
              >
                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={filters.category?.[0] || "all"} 
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  category: value === "all" ? undefined : [value as ComplaintCategory]
                }))}
              >
                <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Sanitation">Sanitation</SelectItem>
                  <SelectItem value="Roads & Infrastructure">Roads & Infrastructure</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Public Safety">Public Safety</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={filters.priority?.[0] || "all"} 
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  priority: value === "all" ? undefined : [value as Priority]
                }))}
              >
                <SelectTrigger><SelectValue placeholder="All Priorities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedComplaints.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button size="sm" onClick={() => handleBulkStatusUpdate('In Review')}>Set to In Review</Button>
                <Button size="sm" onClick={() => handleBulkStatusUpdate('Resolved')}>Mark Resolved</Button>
                <Button size="sm" onClick={() => handleBulkStatusUpdate('Rejected')}>Mark Rejected</Button>
                <Button variant="outline" size="sm" onClick={handleExportSelected}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-800" />
              <span>Complaints List ({total} total)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedComplaints.length === complaints.length && complaints.length > 0} 
                        onCheckedChange={handleSelectAll} 
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date lodged</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} className="hover:bg-slate-50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedComplaints.includes(complaint.id)} 
                          onCheckedChange={(checked) => handleSelectComplaint(complaint.id, checked as boolean)} 
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{complaint.id.substring(0, 8)}...</TableCell>
                      <TableCell className="max-w-xs font-medium">
                        <div className="truncate" title={complaint.title}>{complaint.title}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{complaint.category}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={complaint.priority === 'Critical' ? 'destructive' : complaint.priority === 'High' ? 'secondary' : 'outline'}>
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={complaint.status} onValueChange={(value) => handleStatusUpdate(complaint.id, value as ComplaintStatus)}>
                          <SelectTrigger className="w-36 border-none shadow-none focus:ring-0">
                            <SelectValue>
                              <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="In Review">In Review</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{complaint.reporter.name}</TableCell>
                      <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/complaint/${complaint.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {complaints.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Complaints Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "No complaints match your search" : "No complaints available"}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, total)} of {total} complaints
                </p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={pagination.page === totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
