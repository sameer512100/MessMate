
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Upload, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    collegeId: user?.collegeId || '',
  });
  
  const [dietGoals, setDietGoals] = useState({
    targetCalories: user?.dietGoals?.targetCalories || 2000,
    protein: user?.dietGoals?.protein || 150,
    carbs: user?.dietGoals?.carbs || 250,
    fats: user?.dietGoals?.fats || 67,
  });

  if (!user) return null;

  const handleSaveProfile = () => {
    updateProfile({
      ...profileData,
      dietGoals: user.role === 'student' ? dietGoals : undefined,
    });
    
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to a server
      const imageUrl = URL.createObjectURL(file);
      updateProfile({ profilePicture: imageUrl });
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Badge variant="secondary" className="capitalize">
          {user.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.profilePicture} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                {user.collegeId && (
                  <p className="text-sm text-muted-foreground">ID: {user.collegeId}</p>
                )}
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-picture-upload"
                />
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="profile-picture-upload" className="cursor-pointer flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Change Picture
                  </label>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              ) : (
                'Edit Profile'
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              
              {user.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="collegeId">College ID</Label>
                  <Input
                    id="collegeId"
                    value={profileData.collegeId}
                    onChange={(e) => setProfileData(prev => ({ ...prev, collegeId: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diet Goals - Only for Students */}
      {user.role === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>My Diet Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetCalories">Target Calories/day</Label>
                <Input
                  id="targetCalories"
                  type="number"
                  value={dietGoals.targetCalories}
                  onChange={(e) => setDietGoals(prev => ({ ...prev, targetCalories: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={dietGoals.protein}
                  onChange={(e) => setDietGoals(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={dietGoals.carbs}
                  onChange={(e) => setDietGoals(prev => ({ ...prev, carbs: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fats">Fats (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  value={dietGoals.fats}
                  onChange={(e) => setDietGoals(prev => ({ ...prev, fats: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
            </div>
            
            {!isEditing && (
              <>
                <Separator />
                <div className="text-center space-y-2">
                  <h4 className="font-semibold">Daily Goals Summary</h4>
                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{dietGoals.targetCalories}</div>
                      <div className="text-sm text-muted-foreground">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{dietGoals.protein}g</div>
                      <div className="text-sm text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{dietGoals.carbs}g</div>
                      <div className="text-sm text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{dietGoals.fats}g</div>
                      <div className="text-sm text-muted-foreground">Fats</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
