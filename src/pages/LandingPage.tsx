// Landing page with role selection for Complaint Tracking System

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, BarChart3, Users, Clock, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'admin' | null>(null);

  const handleRoleSelection = (role: 'citizen' | 'admin') => {
    setSelectedRole(role);
    localStorage.setItem('user_role', role);
    
    if (role === 'citizen') {
      navigate('/submit');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CitiTrack</h1>
                <p className="text-sm text-muted-foreground">Complaint Tracking System</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              Version 1.0
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Track and Manage
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Complaints </span>
            Efficiently
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
            A comprehensive system for citizens to submit complaints and for administrators 
            to track, manage, and resolve issues efficiently. Built for transparency and accountability.
          </p>

          {/* Role Selection Cards */}
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Citizen Card */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={() => handleRoleSelection('citizen')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">I'm a Citizen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-muted-foreground">
                  Submit complaints, track their progress, and communicate with officials
                </p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Submit new complaints</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Track complaint status</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Upload supporting documents</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Receive status updates</span>
                  </li>
                </ul>
                <Button className="mt-6 w-full" size="lg">
                  Continue as Citizen
                </Button>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={() => handleRoleSelection('admin')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">I'm an Administrator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-muted-foreground">
                  Manage complaints, assign tasks, and monitor system performance
                </p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Review and assign complaints</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Update complaint status</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">View analytics and reports</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm">Manage system settings</span>
                  </li>
                </ul>
                <Button className="mt-6 w-full" variant="secondary" size="lg">
                  Continue as Admin
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">Key Features</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <h4 className="mb-2 text-lg font-semibold">Real-time Tracking</h4>
              <p className="text-muted-foreground">
                Track your complaints from submission to resolution with real-time status updates
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h4 className="mb-2 text-lg font-semibold">Analytics Dashboard</h4>
              <p className="text-muted-foreground">
                Comprehensive analytics and reporting for administrators to monitor performance
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="mb-2 text-lg font-semibold">Document Management</h4>
              <p className="text-muted-foreground">
                Attach and manage supporting documents for complete complaint records
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-8 text-2xl font-bold">Quick Access</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/track')}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Track Complaint</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/analytics')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Analytics</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 CitiTrack - Complaint Tracking System. Built for transparency and efficiency.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;