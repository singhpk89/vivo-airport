import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Input, TextField } from '../ui/Input';
import { Badge, Chip } from '../ui/Badge';
import { FloatingActionButton, ExtendedFAB, PositionedFAB } from '../ui/fab';
import { NavigationRail, NavigationRailItem, TopAppBar } from '../ui/navigation';
import { ThemeProvider, ThemeToggle } from '../ui/theme-provider';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Settings,
  Home,
  User,
  Bell,
  Mail,
  Heart,
  Star
} from 'lucide-react';

const Material3Showcase = () => {
  const [selectedNavItem, setSelectedNavItem] = useState('home');
  const [inputValue, setInputValue] = useState('');
  const [chips, setChips] = useState([
    { id: 1, label: 'React' },
    { id: 2, label: 'Material 3' },
    { id: 3, label: 'Design System' }
  ]);

  const removeChip = (id) => {
    setChips(chips.filter(chip => chip.id !== id));
  };

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-background text-on-background">

        {/* Top App Bar */}
        <TopAppBar
          title="Material 3 Design System"
          elevated={true}
          navigation={
            <Button variant="text" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          }
          actions={
            <div className="flex items-center gap-2">
              <Button variant="text" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          }
        />

        <div className="flex">
          {/* Navigation Rail */}
          <NavigationRail>
            <NavigationRailItem
              active={selectedNavItem === 'home'}
              icon={<Home className="h-6 w-6" />}
              label="Home"
              onClick={() => setSelectedNavItem('home')}
            />
            <NavigationRailItem
              active={selectedNavItem === 'users'}
              icon={<User className="h-6 w-6" />}
              label="Users"
              badge="3"
              onClick={() => setSelectedNavItem('users')}
            />
            <NavigationRailItem
              active={selectedNavItem === 'mail'}
              icon={<Mail className="h-6 w-6" />}
              label="Mail"
              badge="12"
              onClick={() => setSelectedNavItem('mail')}
            />
            <NavigationRailItem
              active={selectedNavItem === 'favorites'}
              icon={<Heart className="h-6 w-6" />}
              label="Favorites"
              onClick={() => setSelectedNavItem('favorites')}
            />
          </NavigationRail>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-8">

            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-display-medium font-normal text-on-background">
                Material 3 Design System
              </h1>
              <p className="text-body-large text-on-surface-variant max-w-2xl mx-auto">
                Experience the new Material 3 design language with dynamic colors,
                improved accessibility, and enhanced personalization.
              </p>
            </div>

            {/* Button Showcase */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>
                  Material 3 buttons with different variants and states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Primary Buttons */}
                <div className="space-y-3">
                  <h3 className="text-title-medium font-medium">Primary Buttons</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="filled">
                      <Plus className="h-4 w-4 mr-2" />
                      Filled Button
                    </Button>
                    <Button variant="filled-tonal">
                      <Edit className="h-4 w-4 mr-2" />
                      Filled Tonal
                    </Button>
                    <Button variant="outlined">
                      <Search className="h-4 w-4 mr-2" />
                      Outlined
                    </Button>
                    <Button variant="text">Text Button</Button>
                  </div>
                </div>

                {/* Icon Buttons */}
                <div className="space-y-3">
                  <h3 className="text-title-medium font-medium">Icon Buttons</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="filled" size="icon">
                      <Plus className="h-5 w-5" />
                    </Button>
                    <Button variant="filled-tonal" size="icon">
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button variant="outlined" size="icon">
                      <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="text" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* FAB Buttons */}
                <div className="space-y-3">
                  <h3 className="text-title-medium font-medium">Floating Action Buttons</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <FloatingActionButton
                      variant="primary"
                      size="small"
                      icon={<Plus className="h-5 w-5" />}
                    />
                    <FloatingActionButton
                      variant="primary"
                      icon={<Plus className="h-6 w-6" />}
                    />
                    <FloatingActionButton
                      variant="primary"
                      size="large"
                      icon={<Plus className="h-7 w-7" />}
                    />
                    <ExtendedFAB
                      variant="primary"
                      icon={<Plus className="h-5 w-5" />}
                      label="Create New"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input Fields */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Input Fields</CardTitle>
                <CardDescription>
                  Material 3 text fields with different variants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    variant="outlined"
                    label="Outlined Text Field"
                    placeholder="Enter text..."
                    supportingText="This is supporting text"
                  />
                  <TextField
                    variant="filled"
                    label="Filled Text Field"
                    placeholder="Enter text..."
                    supportingText="This is supporting text"
                  />
                  <TextField
                    variant="outlined"
                    label="Required Field"
                    placeholder="Enter text..."
                    required
                    supportingText="This field is required"
                  />
                  <TextField
                    variant="outlined"
                    label="Error State"
                    placeholder="Enter text..."
                    error="This field has an error"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Badges and Chips */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Badges & Chips</CardTitle>
                <CardDescription>
                  Status indicators and interactive elements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Badges */}
                <div className="space-y-3">
                  <h3 className="text-title-medium font-medium">Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="filled">Default</Badge>
                    <Badge variant="tonal">Tonal</Badge>
                    <Badge variant="outlined">Outlined</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error">Error</Badge>
                  </div>
                </div>

                {/* Chips */}
                <div className="space-y-3">
                  <h3 className="text-title-medium font-medium">Chips</h3>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <Chip
                        key={chip.id}
                        variant="filter"
                        onRemove={() => removeChip(chip.id)}
                      >
                        {chip.label}
                      </Chip>
                    ))}
                    <Chip variant="assist">
                      <Star className="h-4 w-4" />
                      With Icon
                    </Chip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Variants */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>
                    Cards with shadow elevation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-body-medium text-on-surface-variant">
                    This card uses shadow elevation to create depth and hierarchy.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="text">Action</Button>
                  <Button variant="filled-tonal">Primary</Button>
                </CardFooter>
              </Card>

              <Card variant="filled">
                <CardHeader>
                  <CardTitle>Filled Card</CardTitle>
                  <CardDescription>
                    Cards with filled background
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-body-medium text-on-surface-variant">
                    This card uses a filled background for subtle differentiation.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="text">Action</Button>
                  <Button variant="filled-tonal">Primary</Button>
                </CardFooter>
              </Card>

              <Card variant="outlined">
                <CardHeader>
                  <CardTitle>Outlined Card</CardTitle>
                  <CardDescription>
                    Cards with outlined border
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-body-medium text-on-surface-variant">
                    This card uses an outline for clear boundaries.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="text">Action</Button>
                  <Button variant="filled-tonal">Primary</Button>
                </CardFooter>
              </Card>
            </div>

          </main>
        </div>

        {/* Positioned FAB */}
        <PositionedFAB
          position="bottom-right"
          variant="primary"
          icon={<Plus className="h-6 w-6" />}
        />
      </div>
    </ThemeProvider>
  );
};

export default Material3Showcase;
