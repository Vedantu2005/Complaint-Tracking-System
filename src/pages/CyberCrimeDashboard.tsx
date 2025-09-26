// CyberCrimeDashboard.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Download, Settings, BarChart3, Eye, Shield, FileText } from 'lucide-react';
import { ComplaintFilters, PaginationOptions, ComplaintStatus, ComplaintCategory, Priority } from '@/types';
import { useComplaintData } from '@/hooks/useComplaintData';
import { toast } from '@/hooks/use-toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-700';
    case 'In Review': return 'bg-sky-100 text-sky-700';
    case 'Resolved': return 'bg-green-100 text-green-700';
    case 'Rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

const CyberCrimeDashboard = () => {
  const navigate = useNavigate();
  const { getFilteredComplaints, data, updateComplaintStatus } = useComplaintData() || {
    getFilteredComplaints: () => ({ complaints: [], total: 0 }),
    data: { complaints: [] },
    updateComplaintStatus: () => false
  };

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
    const cyberFilters: ComplaintFilters = {
      ...filters,
      category: ['Cyber Crime' as ComplaintCategory],
      searchQuery: searchQuery.trim() || undefined
    };
    if (typeof getFilteredComplaints !== 'function') return { complaints: [], total: 0 };
    return getFilteredComplaints(cyberFilters, pagination);
  }, [filters, searchQuery, pagination, data, getFilteredComplaints]);

  const summaryStats = useMemo(() => {
    if (!data || !data.complaints) return { total: 0, new: 0, inReview: 0, resolved: 0, rejected: 0 };
    const cyberComplaints = data.complaints.filter(c => c.category === 'Cyber Crime');
    return {
      total: cyberComplaints.length,
      new: cyberComplaints.filter(c => c.status === 'New').length,
      inReview: cyberComplaints.filter(c => c.status === 'In Review').length,
      resolved: cyberComplaints.filter(c => c.status === 'Resolved').length,
      rejected: cyberComplaints.filter(c => c.status === 'Rejected').length
    };
  }, [data]);

  const handleStatusUpdate = (complaintId: string, newStatus: ComplaintStatus) => {
    const success = updateComplaintStatus(complaintId, newStatus, `Status updated via Cyber Crime dashboard`);
    if (success) setSelectedComplaints([]);
  };

  const handleBulkStatusUpdate = (newStatus: ComplaintStatus) => {
    if (selectedComplaints.length === 0) {
      toast({ title: 'No Complaints Selected', description: 'Please select complaints to update', variant: 'destructive' });
      return;
    }
    let successCount = 0;
    selectedComplaints.forEach(id => {
      if (updateComplaintStatus(id, newStatus, 'Bulk status update via Cyber Crime dashboard')) successCount++;
    });
    toast({ title: 'Bulk Update Complete', description: `Updated ${successCount} of ${selectedComplaints.length} complaints to ${newStatus}` });
    setSelectedComplaints([]);
  };

  const handleExportSelected = () => {
    if (selectedComplaints.length === 0) {
      toast({ title: 'No Complaints Selected', description: 'Please select complaints to export', variant: 'destructive' });
      return;
    }
    const selectedData = complaints.filter(c => selectedComplaints.includes(c.id));
    const csvContent = generateCSV(selectedData);
    downloadCSV(csvContent, `cybercrime_complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
    toast({ title: 'Export Successful', description: `Exported ${selectedData.length} complaints.` });
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
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedComplaints(checked ? complaints.map(c => c.id) : []);
  };

  const handleSelectComplaint = (complaintId: string, checked: boolean) => {
    setSelectedComplaints(prev => checked ? [...prev, complaintId] : prev.filter(id => id !== complaintId));
  };

  const totalPages = Math.ceil(total / pagination.limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 text-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/assets/logo.jpg" className="h-10 w-10" alt="Logo" />
            <div>
              <h1 className="text-lg font-semibold">Cyber Crime Department</h1>
              <p className="text-sm text-gray-300">Complaint Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" className="bg-teal-500 hover:bg-teal-600" onClick={() => navigate('/analytics')}>
              <BarChart3 className="mr-1 h-4 w-4" /> Analytics
            </Button>
            <Button size="sm" className="bg-teal-500 hover:bg-teal-600" onClick={() => navigate('/settings')}>
              <Settings className="mr-1 h-4 w-4" /> Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-l-4 border-blue-500"><CardContent><p className="text-2xl font-bold">{summaryStats.total}</p><p className="text-sm text-gray-500">Total Complaints</p></CardContent></Card>
          <Card className="border-l-4 border-yellow-500"><CardContent><p className="text-2xl font-bold">{summaryStats.new}</p><p className="text-sm text-gray-500">New</p></CardContent></Card>
          <Card className="border-l-4 border-sky-500"><CardContent><p className="text-2xl font-bold">{summaryStats.inReview}</p><p className="text-sm text-gray-500">In Review</p></CardContent></Card>
          <Card className="border-l-4 border-green-500"><CardContent><p className="text-2xl font-bold">{summaryStats.resolved}</p><p className="text-sm text-gray-500">Resolved</p></CardContent></Card>
          <Card className="border-l-4 border-red-500"><CardContent><p className="text-2xl font-bold">{summaryStats.rejected}</p><p className="text-sm text-gray-500">Rejected</p></CardContent></Card>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="flex items-center space-x-1"><Filter className="h-4 w-4"/> Filters & Actions</span>
              {selectedComplaints.length > 0 && <Badge>{selectedComplaints.length} selected</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by ID, title, reporter..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={filters.status?.[0] || 'all'} onValueChange={value => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : [value as ComplaintStatus] }))}>
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority?.[0] || 'all'} onValueChange={value => setFilters(prev => ({ ...prev, priority: value === 'all' ? undefined : [value as Priority] }))}>
              <SelectTrigger><SelectValue placeholder="All Priorities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2"><Shield className="h-5 w-5"/> Cyber Crime Complaints ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={selectedComplaints.length === complaints.length && complaints.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map(c => (
                    <TableRow key={c.id}>
                      <TableCell><Checkbox checked={selectedComplaints.includes(c.id)} onCheckedChange={checked => handleSelectComplaint(c.id, checked as boolean)} /></TableCell>
                      <TableCell>{c.id.substring(0, 8)}...</TableCell>
                      <TableCell className="truncate">{c.title}</TableCell>
                      <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                      <TableCell><Badge variant={c.priority === 'Critical' ? 'destructive' : c.priority === 'High' ? 'secondary' : 'outline'}>{c.priority}</Badge></TableCell>
                      <TableCell>
                        <Select value={c.status} onValueChange={value => handleStatusUpdate(c.id, value as ComplaintStatus)}>
                          <SelectTrigger className="w-32"><SelectValue><Badge className={getStatusColor(c.status)}>{c.status}</Badge></SelectValue></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="In Review">In Review</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{c.reporter.name}</TableCell>
                      <TableCell>{formatDate(c.createdAt)}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/complaint/${c.id}`)}><Eye className="mr-1 h-4 w-4"/>View</Button></TableCell>
                    </TableRow>
                  ))}
                  {complaints.length === 0 && (
                    <tr>
                      <TableCell colSpan={9} className="text-center py-10">
                        <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2"/>
                        <p className="text-gray-500">No Cyber Crime complaints found.</p>
                      </TableCell>
                    </tr>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CyberCrimeDashboard;
