import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const handleLogin = () => {
    // Redirect to Replit Auth login endpoint
    window.location.href = '/api/login';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account Access</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Welcome to ConflictWatch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in to access personalized features including quiz participation, 
              leaderboards, and custom watchlists.
            </p>
            <Button onClick={handleLogin} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}