import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy as CopyIcon, Upload as UploadIcon, Camera as CameraIcon, Trash2 as TrashIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProfileSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);

    // Here you would normally upload to server
    // Simulate server upload delay
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    }, 1500);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Profile picture removed",
      description: "Your profile picture has been removed",
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
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 text-5xl border-2 border-primary-200 dark:border-primary-800">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials()
              )}
            </div>
            
            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100">
              <div className="flex flex-col items-center justify-center space-y-2">
                <button 
                  type="button" 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="rounded-full bg-white p-2 text-gray-700 hover:text-primary-600"
                >
                  {isUploading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full" />
                  ) : (
                    <CameraIcon className="h-5 w-5" />
                  )}
                </button>
                {avatarUrl && (
                  <button 
                    type="button" 
                    onClick={handleDeleteAvatar}
                    className="rounded-full bg-white p-2 text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
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
              
              <div className="mt-2">
                <Label htmlFor="companyLogo" className="block mb-2">Company Logo (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => {
                      const logoInput = document.getElementById('companyLogo') as HTMLInputElement;
                      if (logoInput) logoInput.click();
                    }}
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <span className="text-sm text-gray-500">
                    Recommended size: 500x500px (Max 5MB)
                  </span>
                </div>
                <input 
                  id="companyLogo" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      toast({
                        title: "Logo selected",
                        description: `Selected: ${file.name}`,
                      });
                    }
                  }}
                />
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