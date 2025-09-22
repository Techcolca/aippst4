import { useState } from 'react';
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
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
  ArrowRight,
  ArrowLeft
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
  technicalTeam: z.enum(["yes-full-team", "yes-limited-team", "no-team", "external-help"]),
  previousAutomation: z.string().min(1, "Please select an option"),
  priorityLevel: z.string().min(1, "Please select priority level"),
});

type FormData = z.infer<typeof formSchema>;

export default function AutomationAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasAccess: hasFeatureAccess, isLoading: featureLoading } = useFeatureCheck('advancedAnalytics');
  const upgradeModal = useUpgradeModal();
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  
  // Navegación inteligente - detecta desde dónde viene el usuario
  const handleBackNavigation = () => {
    const referrer = document.referrer;
    const isInternalReferrer = referrer && new URL(referrer).hostname === window.location.hostname;
    
    if (isInternalReferrer && history.length > 1) {
      // Si viene de una página interna, usar history.back()
      history.back();
    } else {
      // Si es acceso directo o desde externa, ir al dashboard
      setLocation('/dashboard?tab=automation');
    }
  };
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
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error submitting form');
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: t("automation_analysis.success_title"),
        description: t("automation_analysis.success_description"),
      });
      form.reset();
      setCurrentTab("benefits");
    },
    onError: (error: any) => {
      toast({
        title: t("automation_analysis.error_title"),
        description: error.message || t("automation_analysis.error_description"),
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
              {t("automation_analysis.subtitle")}
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
        {/* Navigation */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackNavigation}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            data-testid="button-back-navigation"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("automation_analysis.back_button")}
          </Button>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {t("automation_analysis.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("automation_analysis.subtitle")}
          </p>
          <Alert className="mt-6 max-w-3xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t("automation_analysis.form_alert")}
            </AlertDescription>
          </Alert>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="benefits" data-testid="tab-benefits">{t("automation_analysis.tab_benefits")}</TabsTrigger>
            <TabsTrigger value="tools" data-testid="tab-tools">{t("automation_analysis.tab_comparison")}</TabsTrigger>
            <TabsTrigger value="request" data-testid="tab-request">{t("automation_analysis.tab_request")}</TabsTrigger>
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
                      <CardTitle className="text-lg">{t("automation_analysis.benefits_planning_title")}</CardTitle>
                      <CardDescription>{t("automation_analysis.benefits_planning_description")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("automation_analysis.benefits_planning_description")}
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
                      <CardTitle className="text-lg">{t("automation_analysis.benefits_cost_title")}</CardTitle>
                      <CardDescription>{t("automation_analysis.benefits_cost_description")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("automation_analysis.benefits_cost_description")}
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
                      <CardTitle className="text-lg">{t("automation_analysis.benefits_risk_title")}</CardTitle>
                      <CardDescription>{t("automation_analysis.benefits_risk_description")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("automation_analysis.benefits_risk_description")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ROI Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>{t("automation_analysis.roi_title")}</span>
                </CardTitle>
                <CardDescription>
                  {t("automation_analysis.roi_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hours-per-week">{t("automation_analysis.roi_hours_label")}</Label>
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
                      <Label htmlFor="hourly-rate">{t("automation_analysis.roi_rate_label")}</Label>
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
                      <Label htmlFor="tool-cost">{t("automation_analysis.roi_tool_cost_label")}</Label>
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
                      <Label htmlFor="implementation-cost">{t("automation_analysis.roi_implementation_label")}</Label>
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
                      <h4 className="font-semibold mb-3">{t("automation_analysis.roi_annual_savings")}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t("automation_analysis.roi_hours_label")}:</span>
                          <span className="font-medium" data-testid="result-time-saved">
                            {annualTimeSavings.toFixed(0)} hours/year
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("automation_analysis.roi_annual_savings")}:</span>
                          <span className="font-medium text-green-600" data-testid="result-cost-savings">
                            ${annualCostSavings.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("automation_analysis.roi_tool_investment")}:</span>
                          <span className="font-medium text-red-600" data-testid="result-tool-costs">
                            ${totalToolCost.toLocaleString()}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-semibold">{t("automation_analysis.roi_net_savings")}:</span>
                          <span className={`font-bold ${netAnnualSavings > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="result-net-savings">
                            ${netAnnualSavings.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">{t("automation_analysis.roi_percentage")}:</span>
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
                          {t("automation_analysis.roi_example_details")}
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
                <CardTitle>{t("automation_analysis.comparison_title")}</CardTitle>
                <CardDescription>
                  {t("automation_analysis.comparison_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* n8n */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{t("automation_analysis.n8n_title")}</CardTitle>
                      <CardDescription>{t("automation_analysis.n8n_price")}</CardDescription>
                      <Badge variant="secondary">No-Code/Low-Code</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-green-600 mb-2">✅ {t("automation_analysis.n8n_pros_title")}</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• {t("automation_analysis.n8n_pro_1")}</li>
                          <li>• {t("automation_analysis.n8n_pro_2")}</li>
                          <li>• {t("automation_analysis.n8n_pro_3")}</li>
                          <li>• {t("automation_analysis.n8n_pro_4")}</li>
                          <li>• {t("automation_analysis.n8n_pro_5")}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-red-600 mb-2">❌ {t("automation_analysis.n8n_cons_title")}</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• {t("automation_analysis.n8n_con_1")}</li>
                          <li>• {t("automation_analysis.n8n_con_2")}</li>
                          <li>• {t("automation_analysis.n8n_con_3")}</li>
                        </ul>
                      </div>
                      <div className="pt-2">
                        <span className="text-sm font-medium">{t("automation_analysis.best_for_label")}:</span>
                        <p className="text-sm text-muted-foreground">
                          {t("automation_analysis.n8n_ideal")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Make (Integromat) */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{t("automation_analysis.make_title")}</CardTitle>
                      <CardDescription>{t("automation_analysis.make_price")}</CardDescription>
                      <Badge variant="secondary">No-Code</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-green-600 mb-2">✅ {t("automation_analysis.make_pros_title")}</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• {t("automation_analysis.make_pro_1")}</li>
                          <li>• {t("automation_analysis.make_pro_2")}</li>
                          <li>• {t("automation_analysis.make_pro_3")}</li>
                          <li>• {t("automation_analysis.make_pro_4")}</li>
                          <li>• {t("automation_analysis.make_pro_5")}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-red-600 mb-2">❌ {t("automation_analysis.make_cons_title")}</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• {t("automation_analysis.make_con_1")}</li>
                          <li>• {t("automation_analysis.make_con_2")}</li>
                          <li>• {t("automation_analysis.make_con_3")}</li>
                        </ul>
                      </div>
                      <div className="pt-2">
                        <span className="text-sm font-medium">{t("automation_analysis.best_for_label")}:</span>
                        <p className="text-sm text-muted-foreground">
                          {t("automation_analysis.make_ideal")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Code */}
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="text-lg">{t("automation_analysis.custom_title")}</CardTitle>
                      <CardDescription>{t("automation_analysis.custom_price")}</CardDescription>
                      <Badge>Full Control</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-green-600 mb-2">✅ {t("automation_analysis.custom_pros_title")}</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• {t("automation_analysis.custom_pro_1")}</li>
                          <li>• {t("automation_analysis.custom_pro_2")}</li>
                          <li>• {t("automation_analysis.custom_pro_3")}</li>
                          <li>• {t("automation_analysis.custom_pro_4")}</li>
                          <li>• {t("automation_analysis.custom_pro_5")}</li>
                          <li>• {t("automation_analysis.custom_pro_6")}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-red-600 mb-2">❌ {t("automation_analysis.custom_cons_title")}</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• {t("automation_analysis.custom_con_1")}</li>
                          <li>• {t("automation_analysis.custom_con_2")}</li>
                          <li>• {t("automation_analysis.custom_con_3")}</li>
                        </ul>
                      </div>
                      <div className="pt-2">
                        <span className="text-sm font-medium">{t("automation_analysis.best_for_label")}:</span>
                        <p className="text-sm text-muted-foreground">
                          {t("automation_analysis.custom_ideal")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="mt-6">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{t("automation_analysis.recommendation_title")}:</strong> {t("automation_analysis.recommendation_text")}
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
                  <span>{t("automation_analysis.form_title")}</span>
                </CardTitle>
                <CardDescription>
                  {t("automation_analysis.form_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Company Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{t("automation_analysis.form_company_section")}</h3>
                        
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("automation_analysis.form_company_name")}</FormLabel>
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
                              <FormLabel>{t("automation_analysis.form_contact_name")}</FormLabel>
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
                              <FormLabel>{t("automation_analysis.form_email")}</FormLabel>
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
                              <FormLabel>{t("automation_analysis.form_phone")}</FormLabel>
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
                              <FormLabel>{t("automation_analysis.form_industry")}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-industry">
                                    <SelectValue placeholder={t("automation_analysis.form_industry_placeholder")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="technology">{t("automation_analysis.industry_technology")}</SelectItem>
                                  <SelectItem value="healthcare">{t("automation_analysis.industry_healthcare")}</SelectItem>
                                  <SelectItem value="finance">{t("automation_analysis.industry_finance")}</SelectItem>
                                  <SelectItem value="retail">{t("automation_analysis.industry_retail")}</SelectItem>
                                  <SelectItem value="manufacturing">{t("automation_analysis.industry_manufacturing")}</SelectItem>
                                  <SelectItem value="education">{t("automation_analysis.industry_education")}</SelectItem>
                                  <SelectItem value="real-estate">{t("automation_analysis.industry_real_estate")}</SelectItem>
                                  <SelectItem value="consulting">{t("automation_analysis.industry_consulting")}</SelectItem>
                                  <SelectItem value="other">{t("automation_analysis.industry_other")}</SelectItem>
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
                              <FormLabel>{t("automation_analysis.form_company_size")}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-company-size">
                                    <SelectValue placeholder={t("automation_analysis.form_company_size_placeholder")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-10">{t("automation_analysis.company_size_1_10")}</SelectItem>
                                  <SelectItem value="11-50">{t("automation_analysis.company_size_11_50")}</SelectItem>
                                  <SelectItem value="51-200">{t("automation_analysis.company_size_51_200")}</SelectItem>
                                  <SelectItem value="201-1000">{t("automation_analysis.company_size_201_1000")}</SelectItem>
                                  <SelectItem value="1000+">{t("automation_analysis.company_size_1000_plus")}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Automation Requirements */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{t("automation_analysis.form_automation_section")}</h3>

                        <FormField
                          control={form.control}
                          name="currentProcesses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("automation_analysis.form_current_processes")}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder={t("automation_analysis.form_current_processes_placeholder")}
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
                              <FormLabel>{t("automation_analysis.form_automation_goals")}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder={t("automation_analysis.form_automation_goals_placeholder")}
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
                              <FormLabel>{t("automation_analysis.form_existing_systems")}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder={t("automation_analysis.form_existing_systems_placeholder")}
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
                              <FormLabel>{t("automation_analysis.form_budget_range")}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-budget-range">
                                    <SelectValue placeholder={t("automation_analysis.form_budget_range_placeholder")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="under-5k">{t("automation_analysis.budget_under_5k")}</SelectItem>
                                  <SelectItem value="5k-15k">{t("automation_analysis.budget_5k_15k")}</SelectItem>
                                  <SelectItem value="15k-50k">{t("automation_analysis.budget_15k_50k")}</SelectItem>
                                  <SelectItem value="50k-100k">{t("automation_analysis.budget_50k_100k")}</SelectItem>
                                  <SelectItem value="100k+">{t("automation_analysis.budget_100k_plus")}</SelectItem>
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
                              <FormLabel>{t("automation_analysis.form_timeline")}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-timeline">
                                    <SelectValue placeholder={t("automation_analysis.form_timeline_placeholder")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="immediate">{t("automation_analysis.timeline_immediate")}</SelectItem>
                                  <SelectItem value="short-term">{t("automation_analysis.timeline_short_term")}</SelectItem>
                                  <SelectItem value="medium-term">{t("automation_analysis.timeline_medium_term")}</SelectItem>
                                  <SelectItem value="long-term">{t("automation_analysis.timeline_long_term")}</SelectItem>
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
                              <FormLabel>{t("automation_analysis.form_priority_level")}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority-level">
                                    <SelectValue placeholder={t("automation_analysis.form_priority_level_placeholder")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">{t("automation_analysis.priority_low")}</SelectItem>
                                  <SelectItem value="medium">{t("automation_analysis.priority_medium")}</SelectItem>
                                  <SelectItem value="high">{t("automation_analysis.priority_high")}</SelectItem>
                                  <SelectItem value="urgent">{t("automation_analysis.priority_urgent")}</SelectItem>
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
                            <FormLabel>{t("automation_analysis.form_technical_team")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-technical-team">
                                  <SelectValue placeholder={t("automation_analysis.form_select_option")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes-full-team">{t("automation_analysis.tech_team_yes_full")}</SelectItem>
                                <SelectItem value="yes-limited-team">{t("automation_analysis.tech_team_yes_limited")}</SelectItem>
                                <SelectItem value="no-team">{t("automation_analysis.tech_team_no")}</SelectItem>
                                <SelectItem value="external-help">{t("automation_analysis.tech_team_external")}</SelectItem>
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
                            <FormLabel>{t("automation_analysis.form_previous_automation")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-previous-automation">
                                  <SelectValue placeholder={t("automation_analysis.form_select_option")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no-experience">{t("automation_analysis.experience_no")}</SelectItem>
                                <SelectItem value="basic-experience">{t("automation_analysis.experience_basic")}</SelectItem>
                                <SelectItem value="intermediate-experience">{t("automation_analysis.experience_intermediate")}</SelectItem>
                                <SelectItem value="advanced-experience">{t("automation_analysis.experience_advanced")}</SelectItem>
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
                            <span>{t("automation_analysis.form_submitting")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{t("automation_analysis.form_submit_button")}</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                      
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        {t("automation_analysis.form_footer_text")}
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