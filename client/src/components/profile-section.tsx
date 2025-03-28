import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy as CopyIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProfileSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyApiKey = () => {
    // Placeholder: In a real implementation, this would copy an API key from the user object
    const demoApiKey = "aipi_demo1234567890";
    navigator.clipboard.writeText(demoApiKey);
    setCopied(true);
    toast({
      title: "API Key copied",
      description: "API Key has been copied to clipboard",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementación de actualización de perfil aquí
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully",
    });
  };

  // Extract initials safely
  const getInitials = () => {
    if (user && user.fullName && user.fullName.length > 0) {
      return user.fullName.charAt(0).toUpperCase();
    } else if (user && user.username && user.username.length > 0) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U"; // Default fallback
  };

  // Get display name safely
  const getDisplayName = () => {
    if (user) {
      return user.fullName || user.username || "User";
    }
    return "User";
  };

  // Get email safely
  const getEmail = () => {
    return user && user.email ? user.email : "example@aipi.com";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 text-5xl">
            {getInitials()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{getDisplayName()}</h3>
            <p className="text-gray-500 dark:text-gray-400">{getEmail()}</p>
            
            <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  placeholder="Your full name" 
                  defaultValue={user?.fullName || ""} 
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="Your email address" 
                  defaultValue={getEmail()} 
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div className="pt-4">
                <Button type="submit" className="mr-2">
                  Update Profile
                </Button>
                <Button variant="outline" type="button">
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-6">
        <h3 className="text-lg font-medium mb-4">Account API Key</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          This is your personal API key for accessing the AIPI API. Keep it secure.
        </p>
        <div className="flex items-center space-x-2">
          <Input 
            value="aipi_demo1234567890"
            readOnly
            className="font-mono"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyApiKey}
          >
            <CopyIcon className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}