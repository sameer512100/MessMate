import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, BarChart3, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from './StudentDashboard';

const backendUrl = "https://messmate-uk3s.onrender.com";

export const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner',
    day: 'Monday',
    image: '',
    ingredients: [] as string[]
  });

  const [currentIngredient, setCurrentIngredient] = useState('');

  useEffect(() => {
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

  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      mealType: 'breakfast',
      day: 'Monday',
      image: '',
      ingredients: []
    });
    setCurrentIngredient('');
  };

  const handleAddIngredient = () => {
    if (currentIngredient.trim() && !newItem.ingredients.includes(currentIngredient.trim())) {
      setNewItem(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, currentIngredient.trim()]
      }));
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setNewItem(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing !== ingredient)
    }));
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the menu item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    try {
      if (editingItem) {
        const res = await axios.put(`/api/menu/${editingItem.id}`, newItem, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMenuItems(prev => prev.map(menuItem =>
          menuItem.id === editingItem.id ? { ...res.data, id: res.data._id } : menuItem
        ));
        toast({
          title: "Menu item updated",
          description: `${newItem.name} has been updated successfully.`,
        });
      } else {
        const res = await axios.post('/api/menu', newItem, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMenuItems(prev => [...prev, { ...res.data, id: res.data._id }]);
        toast({
          title: "Menu item added",
          description: `${newItem.name} has been added to the menu.`,
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save menu item.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
    resetForm();
    setIsAddingItem(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: MenuItem) => {
    setNewItem({
      name: item.name,
      description: item.description,
      mealType: item.mealType,
      day: (item as any).day || 'Monday',
      image: item.image,
      ingredients: [...item.ingredients]
    });
    setEditingItem(item);
    setIsAddingItem(true);
  };

  const handleDeleteItem = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Menu item deleted",
        description: "The menu item has been removed from the menu.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete menu item.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await axios.post('/api/menu/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setNewItem(prev => ({ ...prev, image: res.data.imageUrl }));
      } catch {
        toast({
          title: "Image upload failed",
          description: "Could not upload image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsAddingItem(false);
    setEditingItem(null);
  };

  // Helper for image URLs
  const getImageUrl = (img: string) =>
    img
      ? img.startsWith('http')
        ? img
        : backendUrl + img
      : '';

  return (
    <div className="animated-gradient-bg min-h-screen max-w-7xl mx-auto p-6 transition-all duration-700">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold drop-shadow-lg">Admin Dashboard</h1>
        <Badge variant="secondary">Administrator</Badge>
      </div>

      <Tabs defaultValue="menu" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner animate-fade-in">
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Votes</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-6">
          <Card className="glass-card animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Menu Items</CardTitle>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddingItem(true);
                  setEditingItem(null);
                }}
                className="flex items-center gap-2 gradient-btn"
              >
                <Plus className="h-4 w-4" />
                Add New Item
              </Button>
            </CardHeader>
            <CardContent>
              {isAddingItem && (
                <Card className="mb-6 border-dashed glass-card animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-name">Item Name</Label>
                        <Input
                          id="item-name"
                          value={newItem.name}
                          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter item name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meal-type">Meal Type</Label>
                        <Select value={newItem.mealType} onValueChange={(value) => setNewItem(prev => ({ ...prev, mealType: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Day selection */}
                      <div className="space-y-2">
                        <Label htmlFor="day">Day</Label>
                        <Select value={newItem.day} onValueChange={day => setNewItem(prev => ({ ...prev, day }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                              <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter item description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ingredients</Label>
                      <div className="flex gap-2">
                        <Input
                          value={currentIngredient}
                          onChange={(e) => setCurrentIngredient(e.target.value)}
                          placeholder="Enter ingredient"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                        />
                        <Button type="button" onClick={handleAddIngredient} variant="outline">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newItem.ingredients.map((ingredient, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {ingredient}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveIngredient(ingredient)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-4 text-sm text-muted-foreground">
                        Macros (calories, protein, carbs, fats) will be calculated automatically based on ingredients.
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image-upload">Item Image</Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button asChild variant="outline" size="sm">
                          <label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Image
                          </label>
                        </Button>
                        {newItem.image && (
                          <img
                            src={getImageUrl(newItem.image)}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddItem} className="gradient-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          editingItem ? 'Update Item' : 'Add Item'
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <Card key={item.id} className="glass-card animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                <span className="font-medium">Ingredients: </span>
                                {item.ingredients.join(', ')}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="capitalize">{item.mealType}</Badge>
                            <Badge variant="outline">{item.calories} cal</Badge>
                            <Badge variant="outline">P: {item.protein}g</Badge>
                            <Badge variant="outline">C: {item.carbs}g</Badge>
                            <Badge variant="outline">F: {item.fats}g</Badge>
                            <Badge variant="outline">{(item as any).day || 'Monday'}</Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-green-600">↑ {item.votes?.upvotes || 0} upvotes</span>
                            <span className="text-sm text-red-600">↓ {item.votes?.downvotes || 0} downvotes</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="feedback" className="space-y-6">
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Feedback & Voting Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <Card key={item.id} className="glass-card animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge variant="secondary" className="capitalize">{item.mealType}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">{item.votes?.upvotes || 0}</div>
                            <div className="text-sm text-muted-foreground">Upvotes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-red-600">{item.votes?.downvotes || 0}</div>
                            <div className="text-sm text-muted-foreground">Downvotes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                              {((item.votes?.upvotes / ((item.votes?.upvotes || 0) + (item.votes?.downvotes || 0))) * 100 || 0).toFixed(0)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Positive</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};