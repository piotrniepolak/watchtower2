import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { 
  User, 
  Camera, 
  Upload, 
  Save, 
  Mail, 
  Calendar,
  Shield,
  Star,
  TrendingUp,
  Target
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    profileImageUrl: ''
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  // Create demo user data if not authenticated
  const demoUser = {
    email: "demo@geopolitical-intel.com",
    firstName: "Demo",
    lastName: "User",
    bio: "Intelligence analyst specializing in geopolitical risk assessment and defense market analysis.",
    profileImageUrl: "",
    createdAt: "2024-01-01T00:00:00.000Z",
    username: "demo_user"
  };

  const currentUser = (user as any) || demoUser;
  const isDemoUser = (user as any)?.username === 'demo_user' || !isAuthenticated;

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        profileImageUrl: user.profileImageUrl || ''
      });
      setPreviewUrl(user.profileImageUrl || '');
      setNewUsername(user.username || '');
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Attempting to update profile with data:', data);
      
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Response data:', result);
        return result;
      } catch (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      console.log('Profile update successful, data received:', data);
      
      // Update the form data with the new values
      setFormData(prev => ({
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        profileImageUrl: data.profileImageUrl
      }));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      console.error('Profile update mutation error:', error);
      toast({
        title: "Update Failed", 
        description: error?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const usernameUpdateMutation = useMutation({
    mutationFn: async (username: string) => {
      try {
        const response = await apiRequest('PATCH', '/api/auth/username', { username });
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.log('Non-JSON response:', text);
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        console.log('JSON data:', data);
        return data;
      } catch (error) {
        console.error('Username update error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
      setIsEditingUsername(false);
      setNewUsername(data.user.username);
      // Update the user data in the cache
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to update username";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleEditUsername = () => {
    setNewUsername(currentUser?.username || "");
    setIsEditingUsername(true);
  };

  const handleSaveUsername = () => {
    if (newUsername.trim() && newUsername !== currentUser?.username) {
      usernameUpdateMutation.mutate(newUsername.trim());
    } else {
      setIsEditingUsername(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingUsername(false);
    setNewUsername(currentUser?.username || "");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit to prevent payload errors
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 1MB.",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }

      setProfileImage(file);
      
      // Create compressed preview URL
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Resize image to max 200x200 for profile pictures
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPreviewUrl(compressedDataUrl);
        
        // Update form data with the compressed image
        setFormData(prev => ({
          ...prev,
          profileImageUrl: compressedDataUrl
        }));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio,
      profileImageUrl: previewUrl || formData.profileImageUrl
    };

    updateProfileMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-slate-200 rounded-lg"></div>
              </div>
              <div className="h-64 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Always show profile page for demo purposes
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">Manage your account settings and profile information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-slate-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                          {currentUser?.firstName?.[0] || currentUser?.email?.[0] || 'U'}
                        </div>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full p-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">Profile Picture</h3>
                      <p className="text-sm text-slate-600 mb-2">Upload a new profile picture</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <Separator />

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <Label htmlFor="username">Username</Label>
                    {isEditingUsername ? (
                      <div className="flex space-x-2">
                        <Input
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="Enter username"
                          className="flex-1"
                          minLength={3}
                          maxLength={20}
                          pattern="^[a-zA-Z0-9_-]+$"
                        />
                        <Button
                          type="button"
                          onClick={handleSaveUsername}
                          disabled={usernameUpdateMutation.isPending || !newUsername.trim()}
                          size="sm"
                        >
                          {usernameUpdateMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={currentUser?.username || ''}
                          disabled
                          className="bg-slate-50 flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleEditUsername}
                          size="sm"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Username must be 3-20 characters, alphanumeric with hyphens and underscores allowed
                    </p>
                  </div>

                  {/* Email (readonly) */}
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="bg-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Account Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Member Since</span>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Recently'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Watchlists</span>
                  <Badge>
                    <Star className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Account Type</span>
                  <Badge variant="secondary">
                    <Shield className="h-3 w-3 mr-1" />
                    Standard
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/watchlist">
                    <Star className="h-4 w-4 mr-2" />
                    Manage Watchlists
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/learning">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Learning Progress
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/privacy">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}