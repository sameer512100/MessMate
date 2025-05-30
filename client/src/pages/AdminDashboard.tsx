
import React, { useState } from 'react';
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

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Masala Dosa',
    description: 'Crispy South Indian crepe with spiced potato filling',
    mealType: 'breakfast',
    calories: 350,
    protein: 12,
    carbs: 55,
    fats: 8,
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&h=200&fit=crop',
    ingredients: ['Rice', 'Lentils', 'Potatoes', 'Onions', 'Spices'],
    votes: { upvotes: 24, downvotes: 3 }
  },
  {
    id: '2',
    name: 'Rajma Rice',
    description: 'Kidney bean curry served with steamed rice',
    mealType: 'lunch',
    calories: 420,
    protein: 18,
    carbs: 65,
    fats: 8,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=200&fit=crop',
    ingredients: ['Kidney beans', 'Rice', 'Tomatoes', 'Onions', 'Garam masala'],
    votes: { upvotes: 32, downvotes: 5 }
  }
];

export const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    image: '',
    ingredients: [] as string[]
  });

  const [currentIngredient, setCurrentIngredient] = useState('');

  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      mealType: 'breakfast',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
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

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the menu item.",
        variant: "destructive",
      });
      return;
    }

    const item: MenuItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      ...newItem,
      image: newItem.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      votes: editingItem ? editingItem.votes : { upvotes: 0, downvotes: 0 }
    };

    if (editingItem) {
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === editingItem.id ? item : menuItem
      ));
      toast({
        title: "Menu item updated",
        description: `${item.name} has been updated successfully.`,
      });
    } else {
      setMenuItems(prev => [...prev, item]);
      toast({
        title: "Menu item added",
        description: `${item.name} has been added to the menu.`,
      });
    }

    resetForm();
    setIsAddingItem(false);
    setEditingItem(null);
  };

  const handleEditItem = (item: MenuItem) => {
    setNewItem({
      name: item.name,
      description: item.description,
      mealType: item.mealType,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      image: item.image,
      ingredients: [...item.ingredients]
    });
    setEditingItem(item);
    setIsAddingItem(true);
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Menu item deleted",
      description: "The menu item has been removed from the menu.",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewItem(prev => ({ ...prev, image: imageUrl }));
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsAddingItem(false);
    setEditingItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">Administrator</Badge>
      </div>

      <Tabs defaultValue="menu" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Votes</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Menu Items</CardTitle>
              <Button onClick={() => setIsAddingItem(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Item
              </Button>
            </CardHeader>
            <CardContent>
              {isAddingItem && (
                <Card className="mb-6 border-dashed">
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
                      <div className="space-y-2">
                        <Label htmlFor="calories">Calories</Label>
                        <Input
                          id="calories"
                          type="number"
                          value={newItem.calories}
                          onChange={(e) => setNewItem(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="protein">Protein (g)</Label>
                        <Input
                          id="protein"
                          type="number"
                          value={newItem.protein}
                          onChange={(e) => setNewItem(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="carbs">Carbs (g)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          value={newItem.carbs}
                          onChange={(e) => setNewItem(prev => ({ ...prev, carbs: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fats">Fats (g)</Label>
                        <Input
                          id="fats"
                          type="number"
                          value={newItem.fats}
                          onChange={(e) => setNewItem(prev => ({ ...prev, fats: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
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
                          <img src={newItem.image} alt="Preview" className="w-12 h-12 object-cover rounded" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleAddItem}>
                        {editingItem ? 'Update Item' : 'Add Item'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={item.image}
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
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-green-600">↑ {item.votes.upvotes} upvotes</span>
                            <span className="text-sm text-red-600">↓ {item.votes.downvotes} downvotes</span>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Feedback & Voting Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
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
                            <div className="text-lg font-semibold text-green-600">{item.votes.upvotes}</div>
                            <div className="text-sm text-muted-foreground">Upvotes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-red-600">{item.votes.downvotes}</div>
                            <div className="text-sm text-muted-foreground">Downvotes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                              {((item.votes.upvotes / (item.votes.upvotes + item.votes.downvotes)) * 100 || 0).toFixed(0)}%
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
