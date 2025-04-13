import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading, isAdmin } = useAuth();
  const [location] = useLocation();
  
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if user is trying to access admin routes but is not an admin
  if (path.startsWith("/admin") && !isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/user/dashboard" />
      </Route>
    );
  }

  // Check if admin is trying to access user routes
  if (path.startsWith("/user") && isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/admin/dashboard" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
