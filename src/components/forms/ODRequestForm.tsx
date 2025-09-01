import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const odRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  od_type: z.string().min(1, "OD Type is required"),
  event_name: z.string().min(1, "Event name is required"),
  od_date: z.date({
    required_error: "OD date is required",
  }),
  timings: z.string().min(1, "Timings are required"),
  period: z.string().optional(),
});

type ODRequestFormData = z.infer<typeof odRequestSchema>;

export function ODRequestForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [events, setEvents] = useState<Array<{id: string, title: string, event_date: string}>>([]);

  const form = useForm<ODRequestFormData>({
    resolver: zodResolver(odRequestSchema),
    defaultValues: {
      title: "",
      od_type: "",
      event_name: "",
      timings: "",
      period: "",
    },
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
    }
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('od-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('od-attachments')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const onSubmit = async (data: ODRequestFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      let attachmentUrl = null;
      
      if (attachmentFile) {
        attachmentUrl = await uploadAttachment(attachmentFile);
        if (!attachmentUrl) {
          toast({
            title: "Error",
            description: "Failed to upload attachment",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from('od_requests')
        .insert([
          {
            student_id: user.id,
            title: data.title,
            od_type: data.od_type,
            event_name: data.event_name,
            od_date: data.od_date.toISOString().split('T')[0],
            timings: data.timings,
            period: data.period || null,
            attachment_url: attachmentUrl,
            status: 'pending',
          },
        ]);

      if (error) {
        console.error('Error creating OD request:', error);
        toast({
          title: "Error",
          description: "Failed to submit OD request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "OD request submitted successfully",
      });

      form.reset();
      setAttachmentFile(null);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit New OD Request</CardTitle>
        <CardDescription>
          Fill out the form below to request an on-duty for your event or activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title for your OD request" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="od_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OD Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select OD type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event or enter custom" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.title}>
                          {event.title} - {format(new Date(event.event_date), 'MMM dd, yyyy')}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Event</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.value === "custom" && (
                    <FormControl>
                      <Input 
                        placeholder="Enter custom event name" 
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mt-2"
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="od_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>OD Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timings</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 9:00 AM - 5:00 PM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify periods if applicable (e.g., 1st to 3rd period)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank if the OD is for the entire day
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Attachment (Optional)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {attachmentFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {attachmentFile.name}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit OD Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}