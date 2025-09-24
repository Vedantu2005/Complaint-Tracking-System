// Admin dashboard for managing complaints

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Search, Filter, Download, Settings, BarChart3, Eye, Plus, FileText } from 'lucide-react';
import { ComplaintFilters, PaginationOptions, ComplaintStatus, ComplaintCategory, Priority } from '@/types';
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
    month: 'short',
    day: 'numeric',
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

  // Get filtered and paginated complaints
  const { complaints, total } = useMemo(() => {
    const searchFilters = {
      ...filters,
      searchQuery: searchQuery.trim() || undefined
    };
    return getFilteredComplaints(searchFilters, pagination);
  }, [filters, searchQuery, pagination, data]);

  // Calculate summary statistics
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
      setSelectedComplaints([]); // Clear selection after update
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

  const totalPages = Math.ceil(total / pagination.limit);

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
                <FileText className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/analytics')}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{summaryStats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{summaryStats.new}</p>
                <p className="text-sm text-muted-foreground">New</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{summaryStats.inReview}</p>
                <p className="text-sm text-muted-foreground">In Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{summaryStats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{summaryStats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
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
            {/* Search and Filters */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
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
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Sanitation">Sanitation</SelectItem>
                  <SelectItem value="Roads & Infrastructure">Roads & Infrastructure</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Public Safety">Public Safety</SelectItem>
                  <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                  <SelectItem value="Housing">Housing</SelectItem>
                  <SelectItem value="Noise">Noise</SelectItem>
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
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedComplaints.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('In Review')}
                  className="flex items-center space-x-2"
                >
                  <span>Set to In Review</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('Resolved')}
                  className="flex items-center space-x-2"
                >
                  <span>Mark Resolved</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('Rejected')}
                  className="flex items-center space-x-2"
                >
                  <span>Mark Rejected</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelected}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Complaints ({total} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedComplaints.includes(complaint.id)}
                          onCheckedChange={(checked) => handleSelectComplaint(complaint.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={complaint.title}>
                          {complaint.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{complaint.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={complaint.priority === 'Critical' ? 'destructive' : 'secondary'}
                        >
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={complaint.status}
                          onValueChange={(value) => handleStatusUpdate(complaint.id, value as ComplaintStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <Badge className={`${getStatusColor(complaint.status)} border-0`}>
                                {complaint.status}
                              </Badge>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/${complaint.id}`)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
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
                    {searchQuery || Object.keys(filters).length > 0 
                      ? "No complaints match your current filters. Try adjusting your search criteria."
                      : "No complaints have been submitted yet."
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, total)} of {total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                    disabled={pagination.page >= totalPages}
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