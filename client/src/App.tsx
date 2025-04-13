import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import { ProtectedRoute } from "./lib/protected-route";
import UserDashboard from "@/pages/user/dashboard";
import SubmissionForm from "@/pages/user/submission-form";
import SubmissionStatus from "@/pages/user/submission-status";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminSubmissions from "@/pages/admin/submissions";
import AdminSubmissionDetail from "@/pages/admin/submission-detail";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import TemplateManager from "@/pages/admin/templates";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/user/dashboard" component={UserDashboard} />
      <ProtectedRoute path="/user/submission/:type" component={SubmissionForm} />
      <ProtectedRoute path="/user/status" component={SubmissionStatus} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/admin/submissions" component={AdminSubmissions} />
      <ProtectedRoute path="/admin/submissions/:id" component={AdminSubmissionDetail} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} />
      <ProtectedRoute path="/admin/templates" component={TemplateManager} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
