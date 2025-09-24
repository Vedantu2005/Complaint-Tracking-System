// Admin complaint details page
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useComplaintData } from '@/hooks/useComplaintData';

const ComplaintDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getComplaintById } = useComplaintData();
  
  const complaint = id ? getComplaintById(id) : null;

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-surface p-8">
        <Button onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Complaint Not Found</h1>
          <p>The requested complaint could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface p-8">
      <Button onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complaint #{complaint.id}</h1>
        <div className="bg-card p-6 rounded-lg shadow-card">
          <h2 className="text-xl font-semibold mb-4">{complaint.title}</h2>
          <p className="text-muted-foreground mb-4">{complaint.description}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <strong>Status:</strong> {complaint.status}
            </div>
            <div>
              <strong>Category:</strong> {complaint.category}
            </div>
            <div>
              <strong>Priority:</strong> {complaint.priority}
            </div>
            <div>
              <strong>Reporter:</strong> {complaint.reporter.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;