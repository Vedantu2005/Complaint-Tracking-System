// Landing page with role selection for Complaint Tracking System

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Shield, BarChart3, Users, Clock, Siren, Settings, X } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isPoliceModalOpen, setIsPoliceModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const departments = [
    'Traffic',
    'Cyber Crime',
    'Women & Child Safety',
    'Local Crime',
    'Economic Offences',
    'Narcotics',
    'Missing Persons'
  ];

  const handleProceedToDashboard = () => {
  if (!selectedDepartment) {
    alert('Please select a department to continue.');
    return;
  }

  // Add this block for cybercrime
  if (selectedDepartment === 'cyber-crime') {
    navigate('/dashboard/cybercrime');
    setIsPoliceModalOpen(false);
  } else if (selectedDepartment === 'traffic') {
    navigate('/dashboard/traffic');
    setIsPoliceModalOpen(false);
  } else {
    const departmentName = departments.find(dept => 
      dept.toLowerCase().replace(/ & /g, '_').replace(/ /g, '-') === selectedDepartment
    );
    alert(`The dashboard for the "${departmentName || selectedDepartment}" department has not been added yet.`);
  }
};

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
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Public Grievance & Complaint<br /> Management Portal
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-lg text-muted-foreground">
            A dedicated platform for citizens to voice concerns and for the police and administration to ensure timely and transparent resolutions.
          </p>

          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-1 lg:grid-cols-3">
            {/* Citizen Card */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-green-600"
              onClick={() => navigate('/submit')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/10 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">Citizen Portal</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                  <p className="mb-6 text-muted-foreground">
                    Submit a new complaint and track its status.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                    Submit Complaint
                  </Button>
              </CardContent>
            </Card>

            {/* Police Card */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-blue-600"
              onClick={() => setIsPoliceModalOpen(true)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Siren className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">Police Department</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-muted-foreground">
                  Select your department to view and manage complaints.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                  Select Department
                </Button>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-slate-600"
              onClick={() => navigate('/dashboard')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-600/10 text-slate-700 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">Administrator Portal</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-muted-foreground">
                  Access the main dashboard for system-wide oversight.
                </p>
                <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white" size="lg">
                  Admin Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">Key Features</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Clock className="h-6 w-6" /></div>
              <h4 className="mb-2 text-lg font-semibold">Real-time Tracking</h4>
              <p className="text-muted-foreground">Track your complaints from submission to resolution with real-time status updates.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground"><BarChart3 className="h-6 w-6" /></div>
              <h4 className="mb-2 text-lg font-semibold">Analytics Dashboard</h4>
              <p className="text-muted-foreground">Comprehensive analytics for administrators to monitor performance.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FileText className="h-6 w-6" /></div>
              <h4 className="mb-2 text-lg font-semibold">Document Management</h4>
              <p className="text-muted-foreground">Attach supporting documents for complete complaint records.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-slate-800 text-slate-300 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Sangli Police Complaint Management System.</p>
            <p className="text-sm text-slate-400">
              Built for transparency, efficiency, and public service.
            </p>
        </div>
      </footer>

      {/* Police Department Selection Modal */}
      {isPoliceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Select Police Department</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsPoliceModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <Select required onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Choose a department..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept.toLowerCase().replace(/ & /g, '_').replace(/ /g, '-')}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleProceedToDashboard} className="w-full" size="lg">
                View Complaints
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

