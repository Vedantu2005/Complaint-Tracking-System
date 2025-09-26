import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Eye } from 'lucide-react';

// Mock data for demonstration. In a real application, you would fetch this.
const allComplaints = [
  { id: 'CMPT001', title: 'Illegal Parking Blocking Driveway', status: 'New', date: '2024-09-25', citizen: 'John Doe', category: 'traffic' },
  { id: 'CMPT002', title: 'Online Phishing Scam', status: 'In Review', date: '2024-09-24', citizen: 'Jane Smith', category: 'cyber-crime' },
  { id: 'CMPT003', title: 'Street Light Malfunctioning', status: 'Resolved', date: '2024-09-22', citizen: 'Peter Jones', category: 'local-crime' },
  { id: 'CMPT004', title: 'Speeding on residential street', status: 'New', date: '2024-09-25', citizen: 'Emily White', category: 'traffic' },
  { id: 'CMPT005', title: 'Harassment Complaint', status: 'In Review', date: '2024-09-23', citizen: 'Sarah Brown', category: 'women_child-safety' },
  { id: 'CMPT006', title: 'Credit Card Fraud', status: 'New', date: '2024-09-25', citizen: 'Michael Green', category: 'economic-offences' },
  { id: 'CMPT007', title: 'Noise Complaint after 10 PM', status: 'Resolved', date: '2024-09-21', citizen: 'David Black', category: 'local-crime' },
  { id: 'CMPT008', title: 'Suspicious Email demanding money', status: 'In Review', date: '2024-09-24', citizen: 'Linda Blue', category: 'cyber-crime' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'New': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'In Review': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();

  // Filter complaints based on the category from the URL
  const complaints = allComplaints.filter(c => c.category === category);

  // Helper to format the category name for display
  const formatCategoryName = (slug: string | undefined) => {
    if (!slug) return 'Unknown Department';
    return slug
      .replace(/-/g, ' ')
      .replace(/_/g, ' & ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };
  
  const departmentName = formatCategoryName(category);

  return (
    <div className="min-h-screen bg-slate-100">
       <header 
        className="bg-cover bg-center text-white shadow-lg"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1570128912643-61804f42df89?q=80&w=2070&auto=format&fit=crop')` }}
      >
        <div className="bg-black bg-opacity-60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="https://i.imgur.com/k6V2s5p.png" 
                  alt="Maharashtra Police Logo" 
                  className="h-14 w-14"
                />
                <div>
                  <h1 className="text-xl font-bold tracking-wider">पोलीस डॅशबोर्ड</h1>
                  <p className="text-sm text-slate-200">{departmentName} Department</p>
                </div>
              </div>
               <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Main Page
                </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Complaints for {departmentName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Date Lodged</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.length > 0 ? (
                    complaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                        <TableCell className="font-medium">{complaint.title}</TableCell>
                        <TableCell>{complaint.citizen}</TableCell>
                        <TableCell>{complaint.date}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/dashboard/complaint/${complaint.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                         <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                         <h3 className="text-lg font-semibold">No Complaints Found</h3>
                         <p className="text-muted-foreground">There are currently no complaints for the {departmentName} department.</p>
                      </TableCell>
                    </TableRow>
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

export default PoliceDashboard;

