import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbsUp, ThumbsDown, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  day?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image: string;
  ingredients: string[];
  votes: {
    upvotes: number;
    downvotes: number;
  };
  userVote?: 'up' | 'down' | null;
}

const backendUrl = "http://localhost:3000";
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const StudentDashboard: React.FC = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');

  useEffect(() => {
    // Set current day
    const currentDay = daysOfWeek[new Date().getDay() - 1] || 'Monday';
    setSelectedDay(currentDay);

    // Set current meal based on time
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) {
      setSelectedMeal('breakfast');
    } else if (hour >= 11 && hour < 16) {
      setSelectedMeal('lunch');
    } else {
      setSelectedMeal('dinner');
    }

    // Fetch menu items from backend and map _id to id
    axios.get('/api/menu')
      .then(res => {
        const items = res.data.map((item: any) => ({
          ...item,
          id: item._id,
        }));
        setMenuItems(items);
      })
      .catch(() => setMenuItems([]));
  }, []);

  // Helper for image URLs
  const getImageUrl = (img: string) =>
    img
      ? img.startsWith('http')
        ? img
        : backendUrl + img
      : '';

  const currentMenuItems = menuItems.filter(item => item.mealType === selectedMeal && item.day === selectedDay);

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `/api/menu/${itemId}/vote`,
        { vote: voteType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenuItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                votes: {
                  upvotes: res.data.upvotes,
                  downvotes: res.data.downvotes,
                },
                userVote: res.data.userVote,
              }
            : item
        )
      );
      toast({
        title: "Vote recorded",
        description: `Your ${voteType}vote has been recorded!`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to vote.",
        variant: "destructive",
      });
    }
  };

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const selectedMenuItems = menuItems.filter(item => selectedItems.includes(item.id));
  const totalCalories = selectedMenuItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = selectedMenuItems.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = selectedMenuItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalFats = selectedMenuItems.reduce((sum, item) => sum + item.fats, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mess Menu</h1>
          <p className="text-muted-foreground mt-1">Select your meals and track nutrition</p>
        </div>
      </div>

      {/* Day Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "outline"}
                onClick={() => setSelectedDay(day)}
                className="min-w-[100px]"
              >
                {day}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Menu for {selectedDay}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedMeal} onValueChange={(value) => setSelectedMeal(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="breakfast">🌅 Breakfast</TabsTrigger>
                  <TabsTrigger value="lunch">☀️ Lunch</TabsTrigger>
                  <TabsTrigger value="dinner">🌙 Dinner</TabsTrigger>
                </TabsList>
                <TabsContent value={selectedMeal} className="mt-6">
                  <div className="space-y-4">
                    {currentMenuItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No menu items available for {selectedMeal} on {selectedDay}
                      </p>
                    ) : (
                      currentMenuItems.map((item) => (
                        <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Checkbox
                                id={item.id}
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                                className="mt-1"
                              />
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1 space-y-2">
                                <div>
                                  <h3 className="font-semibold text-lg">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    <span className="font-medium">Ingredients: </span>
                                    {item.ingredients.join(', ')}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">{item.calories} cal</Badge>
                                  <Badge variant="outline">P: {item.protein}g</Badge>
                                  <Badge variant="outline">C: {item.carbs}g</Badge>
                                  <Badge variant="outline">F: {item.fats}g</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant={item.userVote === 'up' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleVote(item.id, 'up')}
                                    className="vote-button flex items-center gap-1"
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                    {item.votes.upvotes}
                                  </Button>
                                  <Button
                                    variant={item.userVote === 'down' ? "destructive" : "outline"}
                                    size="sm"
                                    onClick={() => handleVote(item.id, 'down')}
                                    className="vote-button flex items-center gap-1"
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                    {item.votes.downvotes}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        {/* Selected Items Summary */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">
                Your Selection for {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Select items from the menu to see nutritional summary
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {selectedMenuItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">{item.calories} cal</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Calories:</span>
                      <span className="font-semibold text-primary">{totalCalories}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-green-600">Protein</div>
                        <div>{totalProtein}g</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">Carbs</div>
                        <div>{totalCarbs}g</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">Fats</div>
                        <div>{totalFats}g</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};