import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import EditIntegration from "@/pages/edit-integration";
import CreateIntegration from "@/pages/create-integration";
import Analytics from "@/pages/analytics";
import GetStarted from "@/pages/get-started";
import Documentation from "@/pages/docs";
import FormsGuide from "@/pages/forms-guide";
import Pricing from "@/pages/pricing";
import Checkout from "@/pages/checkout";
import SubscriptionSuccess from "@/pages/subscription-success";
import SubscriptionCancel from "@/pages/subscription-cancel";
import AdminPanel from "@/pages/admin";
import FormTemplateSelection from "@/pages/form-template-selection";
import FormEditor from "@/pages/form-editor";
import FormResponses from "@/pages/form-responses";
import FormPreview from "@/pages/form-preview";
// @ts-ignore - Form integration import
import FormIntegration from "@/pages/form-integration";
import ConversationDetails from "@/pages/conversation-details";
import IntegrationConversations from "@/pages/integration-conversations";
import IntegrationAnalytics from "@/pages/integration-analytics";
import SettingsEdit from "@/pages/settings-edit";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { ProfileProvider } from "@/context/profile-context";
// Importamos React-i18next directamente sin provider

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/get-started" component={GetStarted} />
      <Route path="/forms-guide" component={FormsGuide} />
      <Route path="/docs" component={Documentation} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout/:planId" component={Checkout} />
      <Route path="/dashboard/subscription/success" component={SubscriptionSuccess} />
      <Route path="/dashboard/subscription/cancel" component={SubscriptionCancel} />
      <Route path="/integrations/:id/edit" component={EditIntegration} />
      <Route path="/integrations/:id/conversations" component={IntegrationConversations} />
      <Route path="/integrations/:id/analytics" component={IntegrationAnalytics} />
      <Route path="/create-integration" component={CreateIntegration} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/create-form" component={FormTemplateSelection} />
      <Route path="/forms/:id/edit" component={FormEditor} />
      <Route path="/forms/:id/responses" component={FormResponses} />
      <Route path="/forms/:id/integrate" component={FormIntegration} />
      <Route path="/forms/:id" component={FormPreview} />
      <Route path="/conversations/:id" component={ConversationDetails} />
      <Route path="/settings/edit" component={SettingsEdit} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
            <Router />
            <Toaster />
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
