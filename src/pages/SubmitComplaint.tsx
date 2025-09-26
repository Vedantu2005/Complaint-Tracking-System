// Complaint submission form for citizens

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Upload, X, FileText, Home } from 'lucide-react';
import { ComplaintCategory, Priority, Attachment } from '@/types';
import { useComplaintData } from '@/hooks/useComplaintData'; // CORRECTED: Using the real hook
import { toast } from '@/hooks/use-toast';

// Define the police-specific categories for validation and dropdowns
const policeCategories = [
  'Traffic',
  'Cyber Crime',
  'Women & Child Safety',
  'Local Crime',
  'Economic Offences',
  'Narcotics',
  'Missing Persons'
] as const;

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

// Validation schema updated for attachments and location
const complaintSchema = yup.object({
  title: yup.string()
    .required('Title is required')
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  category: yup.string()
    .required('Category is required')
    .oneOf([...policeCategories]),
  priority: yup.string()
    .required('Priority is required')
    .oneOf(PRIORITIES),
  location: yup.string()
    .optional()
    .max(200, 'Location must be less than 200 characters'),
  reporterName: yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  reporterEmail: yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  reporterPhone: yup.string()
    .optional()
    .matches(/^[+]?[\s\d\-()]*$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits'),
  preferredContact: yup.string()
    .required('Preferred contact method is required')
    .oneOf(['email', 'phone'])
});

type FormData = yup.InferType<typeof complaintSchema>;

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { createComplaint } = useComplaintData(); // CORRECTED: Using the real hook
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: yupResolver(complaintSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      location: '',
      reporterName: '',
      reporterEmail: '',
      reporterPhone: '',
      preferredContact: 'email'
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });
    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Convert files to base64 for storage
      const attachmentPromises = attachments.map(file => {
        return new Promise<Attachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              mime: file.type,
              base64: reader.result as string,
              size: file.size
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const processedAttachments = await Promise.all(attachmentPromises);

      const complaint = createComplaint({
        title: data.title,
        description: data.description,
        category: data.category as ComplaintCategory,
        priority: data.priority as Priority,
        status: 'New',
        location: data.location || undefined,
        reporter: {
          name: data.reporterName,
          email: data.reporterEmail,
          phone: data.reporterPhone || undefined,
          preferredContact: data.preferredContact as 'email' | 'phone'
        },
        attachments: processedAttachments,
        tags: []
      });

      if (complaint) {
        toast({
          title: "Complaint Submitted Successfully",
          description: `Your complaint ID is: ${complaint.id}. You will be redirected shortly.`
        });
        setTimeout(() => navigate(`/my/${complaint.id}`), 2000);
      }
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      toast({
        title: "Submission Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/track')} className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Track Complaint</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Submit a New Complaint</span>
            </CardTitle>
            <p className="text-muted-foreground">
              Please provide detailed information. Fields marked with * are required.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Brief summary of the issue" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Detailed Description *</FormLabel><FormControl><Textarea placeholder="Describe the incident, including location, time, and relevant details..." className="min-h-32" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl><SelectContent>{policeCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem><FormLabel>Priority *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl><SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location (Optional)</FormLabel><FormControl><Input placeholder="Address or area where the issue occurred" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="space-y-4 rounded-md border p-4">
                  <h3 className="text-lg font-medium">Your Contact Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="reporterName" render={({ field }) => (<FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="reporterEmail" render={({ field }) => (<FormItem><FormLabel>Email Address *</FormLabel><FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="reporterPhone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+91-123-456-7890" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="preferredContact" render={({ field }) => (<FormItem><FormLabel>Preferred Contact *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="phone">Phone</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Attachments (Optional)</Label>
                  <p className="text-sm text-muted-foreground">Max 5 files (images or PDF), 5MB each.</p>
                  <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()} className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" /><span>Upload Files</span>
                  </Button>
                  <input id="file-upload" type="file" multiple accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                  {attachments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-2">
                          <div className="flex items-center space-x-2 truncate"><FileText className="h-4 w-4 flex-shrink-0" /><span className="text-sm truncate">{file.name}</span><Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge></div>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttachment(index)}><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => navigate('/')}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="min-w-32">{isSubmitting ? 'Submitting...' : 'Submit Complaint'}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SubmitComplaint;

