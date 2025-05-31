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

// --- Add this import for your CSS if not already present ---
import '@/index.css';

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

interface MealHistoryEntry {
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  items: MenuItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

const backendUrl = "http://localhost:3000";
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const StudentDashboard: React.FC = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [activeTab, setActiveTab] = useState<'menu' | 'history'>('menu');
  const [history, setHistory] = useState<MealHistoryEntry[]>([]);

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

    // Fetch meal history for the logged-in user
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setHistory(res.data))
        .catch(() => setHistory([]));
    }
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

  const handleSaveDayMeals = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        '/api/history',
        {
          day: selectedDay,
          mealType: selectedMeal,
          itemIds: selectedItems,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Meals saved!",
        description: `Your meal selection for ${selectedDay} has been saved.`,
      });
      setSelectedItems([]);
      // Refresh history after saving
      const res = await axios.get('/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save meal selection.",
        variant: "destructive",
      });
    }
  };

  const selectedMenuItems = menuItems.filter(item => selectedItems.includes(item.id));
  const totalCalories = selectedMenuItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = selectedMenuItems.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = selectedMenuItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalFats = selectedMenuItems.reduce((sum, item) => sum + item.fats, 0);

  return (
    <div className="animated-gradient-bg min-h-screen max-w-7xl mx-auto p-6 space-y-6 transition-all duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground drop-shadow-lg animate-fade-in">VIT Mess Menu</h1>
          <p className="text-muted-foreground mt-1 animate-fade-in">Select your meals and track nutrition</p>
        </div>
      </div>

      {/* Main Navigation */}
      <Card className="glass-card animate-fade-in">
        <CardContent className="p-2">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'menu' | 'history')}>
            <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Today's Menu
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                📊 Meal History
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {activeTab === 'menu' && (
        <>
          {/* Day Selector */}
          <Card className="glass-card animate-fade-in">
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
                    className={`min-w-[100px] transition-all duration-300 ${
                      selectedDay === day
                        ? "bg-gradient-to-r from-teal-400 via-green-400 to-blue-400 text-white shadow-lg scale-105"
                        : "hover:bg-gradient-to-r hover:from-blue-100 hover:to-green-100"
                    }`}
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
              <Card className="glass-card animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Menu for {selectedDay}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedMeal} onValueChange={(value) => setSelectedMeal(value as any)}>
                    <TabsList className="grid w-full grid-cols-3 bg-white/20 backdrop-blur-md rounded-xl shadow-inner animate-fade-in">
                      <TabsTrigger value="breakfast">🌅 Breakfast</TabsTrigger>
                      <TabsTrigger value="lunch">☀️ Lunch</TabsTrigger>
                      <TabsTrigger value="dinner">🌙 Dinner</TabsTrigger>
                    </TabsList>
                    <TabsContent value={selectedMeal} className="mt-6">
                      <div className="space-y-4">
                        {currentMenuItems.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8 animate-fade-in">
                            No menu items available for {selectedMeal} on {selectedDay}
                          </p>
                        ) : (
                          currentMenuItems.map((item, idx) => (
                            <Card
                              key={item.id}
                              className="glass-card transition-all duration-300 hover:shadow-2xl hover:scale-[1.015] animate-fade-in"
                              style={{ animationDelay: `${idx * 60}ms` }}
                            >
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
                                    className="w-20 h-20 object-cover rounded-lg shadow-md"
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
                                        className="vote-button flex items-center gap-1 transition-all duration-200"
                                      >
                                        <ThumbsUp className="h-3 w-3" />
                                        {item.votes.upvotes}
                                      </Button>
                                      <Button
                                        variant={item.userVote === 'down' ? "destructive" : "outline"}
                                        size="sm"
                                        onClick={() => handleVote(item.id, 'down')}
                                        className="vote-button flex items-center gap-1 transition-all duration-200"
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
              <Card className="glass-card sticky top-24 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Your Selection for {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4 animate-fade-in">
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
                      <Button 
                        onClick={handleSaveDayMeals}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                        disabled={selectedItems.length === 0}
                      >
                        Save Day's Meals
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <CardTitle>Meal History </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 animate-fade-in">
                No meal history found.
              </p>
            ) : (
              <div className="space-y-6">
                {history.map((entry, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-white/70 shadow">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-semibold">{entry.day}</span> - <span className="capitalize">{entry.mealType}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{entry.totalCalories} cal</Badge>
                        <Badge variant="outline">P: {entry.totalProtein}g</Badge>
                        <Badge variant="outline">C: {entry.totalCarbs}g</Badge>
                        <Badge variant="outline">F: {entry.totalFats}g</Badge>
                      </div>
                    </div>
                    <Separator />
                    <ul className="mt-2 space-y-1">
                      {entry.items.map(item => (
                        <li key={item.id} className="flex items-center gap-2">
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-8 h-8 object-cover rounded" />
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">{item.calories} cal</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};