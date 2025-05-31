import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User as LucideUser } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProfilePictureUploader } from '@/components/ProfilePictureUploader';

type DietGoals = {
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type UserWithDietGoals = {
  name: string;
  email: string;
  collegeId?: string;
  role: string;
  dietGoals?: DietGoals;
  profilePicture?: string;
};

const backendUrl = "https://messmate-uk3s.onrender.com";

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
    targetCalories: (user as UserWithDietGoals)?.dietGoals?.targetCalories || 2000,
    protein: (user as UserWithDietGoals)?.dietGoals?.protein || 150,
    carbs: (user as UserWithDietGoals)?.dietGoals?.carbs || 250,
    fats: (user as UserWithDietGoals)?.dietGoals?.fats || 67,
  });

  const [profilePicture, setProfilePicture] = useState((user as UserWithDietGoals | null)?.profilePicture);

  // Fetch latest profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setProfileData({
          name: userData.name,
          email: userData.email,
          collegeId: userData.collegeId,
        });
        setDietGoals({
          targetCalories: userData.dietGoals?.targetCalories || 2000,
          protein: userData.dietGoals?.protein || 150,
          carbs: userData.dietGoals?.carbs || 250,
          fats: userData.dietGoals?.fats || 67,
        });
        setProfilePicture(userData.profilePicture);
        if (updateProfile) updateProfile(userData);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setProfilePicture((user as UserWithDietGoals | null)?.profilePicture);
  }, [user]);

  useEffect(() => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      collegeId: user?.collegeId || '',
    });
    setDietGoals({
      targetCalories: (user as UserWithDietGoals)?.dietGoals?.targetCalories || 2000,
      protein: (user as UserWithDietGoals)?.dietGoals?.protein || 150,
      carbs: (user as UserWithDietGoals)?.dietGoals?.carbs || 250,
      fats: (user as UserWithDietGoals)?.dietGoals?.fats || 67,
    });
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profileData,
          dietGoals: user.role === 'student' ? dietGoals : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      setProfileData({
        name: updated.name,
        email: updated.email,
        collegeId: updated.collegeId,
      });
      setDietGoals({
        targetCalories: updated.dietGoals?.targetCalories || 2000,
        protein: updated.dietGoals?.protein || 150,
        carbs: updated.dietGoals?.carbs || 250,
        fats: updated.dietGoals?.fats || 67,
      });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      if (updateProfile) updateProfile(updated);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not update profile.",
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
              <LucideUser className="h-5 w-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <ProfilePictureUploader
                current={profilePicture}
                onUpload={url => {
                  setProfilePicture(url);
                  toast({
                    title: "Profile picture updated",
                    description: "Your profile picture has been updated successfully.",
                  });
                }}
              />
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                {user.collegeId && (
                  <p className="text-sm text-muted-foreground">ID: {user.collegeId}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Profile Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSaveProfile();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="collegeId">College ID</Label>
                  <Input
                    id="collegeId"
                    value={profileData.collegeId}
                    onChange={e => setProfileData(prev => ({ ...prev, collegeId: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </form>
            <div className="flex gap-4 mt-4">
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="button" onClick={handleSaveProfile}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        name: user?.name || '',
                        email: user?.email || '',
                        collegeId: user?.collegeId || '',
                      });
                      setDietGoals({
                        targetCalories: (user as UserWithDietGoals)?.dietGoals?.targetCalories || 2000,
                        protein: (user as UserWithDietGoals)?.dietGoals?.protein || 150,
                        carbs: (user as UserWithDietGoals)?.dietGoals?.carbs || 250,
                        fats: (user as UserWithDietGoals)?.dietGoals?.fats || 67,
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </>
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