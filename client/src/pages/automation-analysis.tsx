import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useFeatureCheck } from "@/hooks/use-feature-access";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Zap, 
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Target,
  Shield,
  ArrowRight
} from "lucide-react";

// Form validation schema
const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  industry: z.string().min(1, "Please select an industry"),
  companySize: z.string().min(1, "Please select company size"),
  currentProcesses: z.string().min(10, "Please describe your current processes"),
  automationGoals: z.string().min(10, "Please describe your automation goals"),
  existingSystems: z.string().optional(),
  budgetRange: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  technicalTeam: z.string().min(1, "Please select an option"),
  previousAutomation: z.string().min(1, "Please select an option"),
  priorityLevel: z.string().min(1, "Please select priority level"),
});

type FormData = z.infer<typeof formSchema>;

export default function AutomationAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasAccess: hasFeatureAccess, isLoading: featureLoading } = useFeatureCheck('advancedAnalytics');
  const upgradeModal = useUpgradeModal();
  const [currentTab, setCurrentTab] = useState("benefits");
  const [roiCalculation, setRoiCalculation] = useState({
    hoursPerWeek: 0,
    hourlyRate: 0,
    toolCost: 0,
    implementationCost: 0
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: user?.email || "",
      phone: "",
      industry: "",
      companySize: "",
      currentProcesses: "",
      automationGoals: "",
      existingSystems: "",
      budgetRange: "",
      timeline: "",
      technicalTeam: "",
      previousAutomation: "",
      priorityLevel: "",
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/automation-analysis-requests', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Request Submitted",
        description: "Our automation experts will review your requirements and contact you within 24-48 hours.",
      });
      form.reset();
      setCurrentTab("benefits");
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createRequestMutation.mutate(data);
  };

  // ROI Calculations
  const weeklyTimeSavings = roiCalculation.hoursPerWeek;
  const annualTimeSavings = weeklyTimeSavings * 52;
  const annualCostSavings = annualTimeSavings * roiCalculation.hourlyRate;
  const totalToolCost = roiCalculation.toolCost * 12 + roiCalculation.implementationCost;
  const netAnnualSavings = annualCostSavings - totalToolCost;
  const roiPercentage = totalToolCost > 0 ? ((netAnnualSavings / totalToolCost) * 100) : 0;

  // Feature access check
  if (featureLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!hasFeatureAccess) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-amber-100 dark:bg-amber-900 rounded-full w-fit">
              <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl">Enterprise Feature Required</CardTitle>
            <CardDescription className="text-lg">
              Automation analysis is available exclusively for Enterprise plan users
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Upgrade to Enterprise to access professional automation analysis, ROI calculations, 
              and personalized implementation guidance from our experts.
            </p>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => upgradeModal.showUpgradeModal("general", "Enterprise")}
              data-testid="button-upgrade-enterprise"
            >
              Upgrade to Enterprise
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Enterprise Automation Analysis
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get a professional analysis of your automation needs. Our experts will evaluate your processes, 
            calculate ROI, and provide a detailed implementation roadmap.
          </p>
          <Alert className="mt-6 max-w-3xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Proper analysis is crucial before automation implementation. 
              Rushed automation projects often fail or deliver poor ROI. Let our experts guide you to success.
            </AlertDescription>
          </Alert>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="benefits" data-testid="tab-benefits">Benefits & ROI</TabsTrigger>
            <TabsTrigger value="tools" data-testid="tab-tools">Tool Comparison</TabsTrigger>
            <TabsTrigger value="request" data-testid="tab-request">Request Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="benefits" className="space-y-8">
            {/* Benefits Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Time Savings</CardTitle>
                      <CardDescription>Up to 80% reduction</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Eliminate repetitive tasks and streamline complex workflows to free up valuable time for strategic work.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Cost Reduction</CardTitle>
                      <CardDescription>Average 300% ROI</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Reduce operational costs through efficient automation while improving accuracy and consistency.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Team Productivity</CardTitle>
                      <CardDescription>Focus on high-value work</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Enable your team to focus on creative and strategic tasks while automation handles the routine work.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ROI Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>ROI Calculator</span>
                </CardTitle>
                <CardDescription>
                  Calculate your potential return on investment from automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hours-per-week">Hours saved per week</Label>
                      <Input
                        id="hours-per-week"
                        type="number"
                        value={roiCalculation.hoursPerWeek || ''}
                        onChange={(e) => setRoiCalculation(prev => ({ 
                          ...prev, 
                          hoursPerWeek: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="e.g., 20"
                        data-testid="input-hours-per-week"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourly-rate">Average hourly rate ($)</Label>
                      <Input
                        id="hourly-rate"
                        type="number"
                        value={roiCalculation.hourlyRate || ''}
                        onChange={(e) => setRoiCalculation(prev => ({ 
                          ...prev, 
                          hourlyRate: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="e.g., 75"
                        data-testid="input-hourly-rate"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tool-cost">Monthly tool cost ($)</Label>
                      <Input
                        id="tool-cost"
                        type="number"
                        value={roiCalculation.toolCost || ''}
                        onChange={(e) => setRoiCalculation(prev => ({ 
                          ...prev, 
                          toolCost: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="e.g., 99"
                        data-testid="input-tool-cost"
                      />
                    </div>
                    <div>
                      <Label htmlFor="implementation-cost">Implementation cost ($)</Label>
                      <Input
                        id="implementation-cost"
                        type="number"
                        value={roiCalculation.implementationCost || ''}
                        onChange={(e) => setRoiCalculation(prev => ({ 
                          ...prev, 
                          implementationCost: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="e.g., 5000"
                        data-testid="input-implementation-cost"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-3">Annual Results</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Time saved:</span>
                          <span className="font-medium" data-testid="result-time-saved">
                            {annualTimeSavings.toFixed(0)} hours/year
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost savings:</span>
                          <span className="font-medium text-green-600" data-testid="result-cost-savings">
                            ${annualCostSavings.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total tool costs:</span>
                          <span className="font-medium text-red-600" data-testid="result-tool-costs">
                            ${totalToolCost.toLocaleString()}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-semibold">Net savings:</span>
                          <span className={`font-bold ${netAnnualSavings > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="result-net-savings">
                            ${netAnnualSavings.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">ROI:</span>
                          <span className={`font-bold ${roiPercentage > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="result-roi">
                            {roiPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {roiPercentage > 200 && (
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          Excellent ROI! This automation project shows strong financial benefits.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Automation Platform Comparison</CardTitle>
                <CardDescription>
                  Understanding the benefits and trade-offs of different automation approaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* n8n */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">n8n</CardTitle>
                      <CardDescription>Visual workflow automation</CardDescription>
                      <Badge variant="secondary">No-Code/Low-Code</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-green-600 mb-2">✅ Pros</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Visual workflow designer</li>
                          <li>• 400+ pre-built integrations</li>
                          <li>• Self-hosted option</li>
                          <li>• Active community</li>
                          <li>• Custom code nodes available</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-red-600 mb-2">❌ Cons</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Limited complex logic handling</li>
                          <li>• Performance issues with large workflows</li>
                          <li>• Requires technical knowledge for advanced features</li>
                        </ul>
                      </div>
                      <div className="pt-2">
                        <span className="text-sm font-medium">Best for:</span>
                        <p className="text-sm text-muted-foreground">
                          Medium complexity workflows with existing integrations
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Make (Integromat) */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Make (Integromat)</CardTitle>
                      <CardDescription>Visual automation platform</CardDescription>
                      <Badge variant="secondary">No-Code</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-green-600 mb-2">✅ Pros</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Intuitive visual interface</li>
                          <li>• Real-time execution monitoring</li>
                          <li>• Good error handling</li>
                          <li>• Strong data transformation tools</li>
                          <li>• Webhook support</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-red-600 mb-2">❌ Cons</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Higher pricing for complex scenarios</li>
                          <li>• Limited customization options</li>
                          <li>• Vendor lock-in (cloud-only)</li>
                        </ul>
                      </div>
                      <div className="pt-2">
                        <span className="text-sm font-medium">Best for:</span>
                        <p className="text-sm text-muted-foreground">
                          Simple to medium workflows with visual design preference
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Code */}
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="text-lg">Custom Development</CardTitle>
                      <CardDescription>Native code solution</CardDescription>
                      <Badge>Full Control</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-green-600 mb-2">✅ Pros</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Complete customization</li>
                          <li>• Maximum performance</li>
                          <li>• No vendor lock-in</li>
                          <li>• Complex logic handling</li>
                          <li>• Integration with any system</li>
                          <li>• Cost-effective at scale</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-red-600 mb-2">❌ Cons</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Higher initial development time</li>
                          <li>• Requires technical expertise</li>
                          <li>• Ongoing maintenance responsibility</li>
                        </ul>
                      </div>
                      <div className="pt-2">
                        <span className="text-sm font-medium">Best for:</span>
                        <p className="text-sm text-muted-foreground">
                          Complex, high-volume, or highly customized automation needs
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="mt-6">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Our Recommendation:</strong> The best approach depends on your specific needs, technical capabilities, 
                    and long-term goals. Our analysis will help you choose the optimal solution for your unique situation.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Request Professional Analysis</span>
                </CardTitle>
                <CardDescription>
                  Get a personalized automation strategy from our experts. We'll analyze your processes, 
                  calculate precise ROI, and create a detailed implementation plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Company Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Company Information</h3>
                        
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-company-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-contact-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-industry">
                                    <SelectValue placeholder="Select your industry" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="technology">Technology</SelectItem>
                                  <SelectItem value="healthcare">Healthcare</SelectItem>
                                  <SelectItem value="finance">Finance</SelectItem>
                                  <SelectItem value="retail">Retail</SelectItem>
                                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                  <SelectItem value="education">Education</SelectItem>
                                  <SelectItem value="real-estate">Real Estate</SelectItem>
                                  <SelectItem value="consulting">Consulting</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companySize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Size</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-company-size">
                                    <SelectValue placeholder="Select company size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-10">1-10 employees</SelectItem>
                                  <SelectItem value="11-50">11-50 employees</SelectItem>
                                  <SelectItem value="51-200">51-200 employees</SelectItem>
                                  <SelectItem value="201-1000">201-1000 employees</SelectItem>
                                  <SelectItem value="1000+">1000+ employees</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Automation Requirements */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Automation Requirements</h3>

                        <FormField
                          control={form.control}
                          name="currentProcesses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Manual Processes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe the manual processes you want to automate..."
                                  className="min-h-[100px]"
                                  data-testid="textarea-current-processes"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="automationGoals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Automation Goals</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="What do you hope to achieve with automation?"
                                  className="min-h-[100px]"
                                  data-testid="textarea-automation-goals"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="existingSystems"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Existing Systems & Tools</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="List your current software and systems (CRM, ERP, etc.)"
                                  className="min-h-[80px]"
                                  data-testid="textarea-existing-systems"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="budgetRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget Range</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-budget-range">
                                    <SelectValue placeholder="Select budget range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="under-5k">Under $5,000</SelectItem>
                                  <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                                  <SelectItem value="15k-50k">$15,000 - $50,000</SelectItem>
                                  <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                                  <SelectItem value="100k+">$100,000+</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="timeline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Implementation Timeline</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-timeline">
                                    <SelectValue placeholder="Select timeline" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="immediate">Immediate (within 1 month)</SelectItem>
                                  <SelectItem value="short-term">Short-term (1-3 months)</SelectItem>
                                  <SelectItem value="medium-term">Medium-term (3-6 months)</SelectItem>
                                  <SelectItem value="long-term">Long-term (6+ months)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priorityLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority-level">
                                    <SelectValue placeholder="Select priority level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low - Nice to have</SelectItem>
                                  <SelectItem value="medium">Medium - Important</SelectItem>
                                  <SelectItem value="high">High - Critical</SelectItem>
                                  <SelectItem value="urgent">Urgent - Business critical</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Additional Questions */}
                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                      <FormField
                        control={form.control}
                        name="technicalTeam"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Do you have a technical team to support implementation?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-technical-team">
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes-full-team">Yes, we have a full technical team</SelectItem>
                                <SelectItem value="yes-limited-team">Yes, but limited technical resources</SelectItem>
                                <SelectItem value="no-team">No, we don't have a technical team</SelectItem>
                                <SelectItem value="external-help">We plan to hire external help</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="previousAutomation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Have you implemented automation projects before?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-previous-automation">
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no-experience">No, this is our first automation project</SelectItem>
                                <SelectItem value="basic-experience">Yes, basic automation (email, scheduling)</SelectItem>
                                <SelectItem value="intermediate-experience">Yes, intermediate automation (workflows, integrations)</SelectItem>
                                <SelectItem value="advanced-experience">Yes, advanced automation (custom development)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-6 border-t">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={createRequestMutation.isPending}
                        data-testid="button-submit"
                      >
                        {createRequestMutation.isPending ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Submitting Request...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>Request Professional Analysis</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                      
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Our automation experts will review your requirements and contact you within 24-48 hours 
                        with a detailed analysis and implementation recommendation.
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}