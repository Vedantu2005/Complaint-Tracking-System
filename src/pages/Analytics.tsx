// Analytics dashboard
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useComplaintData } from '@/hooks/useComplaintData';
import { SimpleBarChart, SimplePieChart } from '@/components/charts/SimpleChart';

const Analytics = () => {
  const navigate = useNavigate();
  const { getAnalyticsData, data } = useComplaintData();
  
  const analytics = getAnalyticsData();

  if (!analytics || !data) {
    return (
      <div className="min-h-screen bg-gradient-surface p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Loading Analytics...</h1>
        </div>
      </div>
    );
  }

  const statusData = Object.entries(analytics.byStatus).map(([name, value]) => ({
    name,
    value
  }));

  const categoryData = Object.entries(analytics.byCategory).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="min-h-screen bg-gradient-surface">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <SimplePieChart 
            data={statusData}
            title="Complaints by Status"
            useStatusColors={true}
          />
          <SimpleBarChart 
            data={categoryData}
            title="Complaints by Category"
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="bg-card p-6 rounded-lg shadow-card text-center">
            <h3 className="text-2xl font-bold">{analytics.total}</h3>
            <p className="text-muted-foreground">Total Complaints</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-card text-center">
            <h3 className="text-2xl font-bold">{analytics.recent}</h3>
            <p className="text-muted-foreground">Recent (30 days)</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-card text-center">
            <h3 className="text-2xl font-bold">{analytics.avgResolutionTime}</h3>
            <p className="text-muted-foreground">Avg Resolution (days)</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-card text-center">
            <h3 className="text-2xl font-bold">
              {((analytics.byStatus.Resolved || 0) / analytics.total * 100).toFixed(1)}%
            </h3>
            <p className="text-muted-foreground">Resolution Rate</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;