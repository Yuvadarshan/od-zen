import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardPageWrapper from "@/components/wrappers/DashboardPageWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, FileText, ExternalLink, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ODRequest {
  id: string;
  title: string;
  od_type: string;
  event_name: string;
  od_date: string;
  timings: string;
  period?: string;
  status: string;
  attachment_url?: string;
  created_at: string;
  profiles: {
    name: string;
    email: string;
    register_number?: string;
    department?: string;
    section?: string;
  };
}

export default function PendingRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('od_requests')
        .select(`
          *,
          profiles!od_requests_student_id_fkey (
            name,
            email,
            register_number,
            department,
            section
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching requests:', error);
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('od_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error approving request:', error);
        toast({
          title: "Error",
          description: "Failed to approve request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Request approved successfully",
      });

      fetchPendingRequests();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('od_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting request:', error);
        toast({
          title: "Error",
          description: "Failed to reject request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Request rejected successfully",
      });

      setRejectionReason("");
      setSelectedRequest(null);
      fetchPendingRequests();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardPageWrapper>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pending OD Requests</h1>
        <p className="text-muted-foreground">Review and approve or reject student requests</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No pending requests</h3>
            <p className="text-muted-foreground text-center">
              All requests have been reviewed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription>{request.event_name}</CardDescription>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium">Student: </span>
                    <span className="text-sm text-muted-foreground">
                      {request.profiles.name}
                    </span>
                    {request.profiles.register_number && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({request.profiles.register_number})
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Department: </span>
                    <span className="text-sm text-muted-foreground">
                      {request.profiles.department} - {request.profiles.section}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(request.od_date), "PPP")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{request.timings}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium">Type: </span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {request.od_type}
                    </span>
                  </div>
                  {request.period && (
                    <div>
                      <span className="text-sm font-medium">Period: </span>
                      <span className="text-sm text-muted-foreground">
                        {request.period}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Submitted {format(new Date(request.created_at), "PPp")}
                  </span>
                  {request.attachment_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(request.attachment_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Attachment
                    </Button>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedRequest(request.id)}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject OD Request</DialogTitle>
                        <DialogDescription>
                          Please provide a reason for rejecting this request.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Textarea
                          placeholder="Enter rejection reason..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRejectionReason("");
                            setSelectedRequest(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject Request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardPageWrapper>
  );
}