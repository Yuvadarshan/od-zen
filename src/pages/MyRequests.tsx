import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardPageWrapper from "@/components/wrappers/DashboardPageWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

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
  rejection_reason?: string;
}

export default function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('od_requests')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <DashboardPageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My OD Requests</h1>
        <p className="text-muted-foreground">Track the status of your submitted requests</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No requests found</h3>
            <p className="text-muted-foreground text-center">
              You haven't submitted any OD requests yet.
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
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
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

                {request.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <span className="text-sm font-medium text-red-800">Rejection Reason: </span>
                    <span className="text-sm text-red-700">{request.rejection_reason}</span>
                  </div>
                )}

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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardPageWrapper>
  );
}