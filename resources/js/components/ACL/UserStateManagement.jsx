import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    MapPin,
    Plus,
    Trash2,
    Search,
    Save,
    X,
    Users,
    Shield
} from 'lucide-react';

const UserStateManagement = () => {
    const [users, setUsers] = useState([]);
    const [availableStates, setAvailableStates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [userStates, setUserStates] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch users
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users/with-roles', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();
            if (result.success) {
                setUsers(result.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Fetch available states
    const fetchAvailableStates = async () => {
        try {
            const response = await fetch('/api/user-states/available-states', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();
            if (result.success) {
                setAvailableStates(result.states);
            }
        } catch (error) {
            console.error('Error fetching available states:', error);
        }
    };

    // Fetch user's assigned states
    const fetchUserStates = async (userId) => {
        try {
            const response = await fetch(`/api/user-states/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();
            if (result.success) {
                setUserStates(result.states);
            }
        } catch (error) {
            console.error('Error fetching user states:', error);
        }
    };

    // Assign states to user
    const assignStates = async () => {
        if (!selectedUser || selectedStates.length === 0) return;

        try {
            const response = await fetch(`/api/user-states/${selectedUser.id}/assign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    states: selectedStates
                }),
            });

            if (response.ok) {
                alert('States assigned successfully');
                setShowAssignDialog(false);
                setSelectedStates([]);
                fetchUserStates(selectedUser.id);
                fetchUsers(); // Refresh to show updated data
            } else {
                const errorData = await response.json();
                alert(`Failed to assign states: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error assigning states:', error);
            alert('Failed to assign states');
        }
    };

    // Remove state from user
    const removeState = async (userId, state) => {
        if (!confirm(`Are you sure you want to remove access to ${state} for this user?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/user-states/${userId}/remove`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state }),
            });

            if (response.ok) {
                alert('State access removed successfully');
                if (selectedUser && selectedUser.id === userId) {
                    fetchUserStates(userId);
                }
                fetchUsers(); // Refresh to show updated data
            } else {
                const errorData = await response.json();
                alert(`Failed to remove state access: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error removing state:', error);
            alert('Failed to remove state access');
        }
    };

    // Handle user selection
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        fetchUserStates(user.id);
    };

    // Handle state selection in dialog
    const handleStateToggle = (state) => {
        setSelectedStates(prev =>
            prev.includes(state)
                ? prev.filter(s => s !== state)
                : [...prev, state]
        );
    };

    // Open assign dialog
    const openAssignDialog = (user) => {
        setSelectedUser(user);
        setSelectedStates([]);
        setShowAssignDialog(true);
    };

    useEffect(() => {
        fetchUsers();
        fetchAvailableStates();
        setLoading(false);
    }, []);

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="h-full flex flex-col bg-surface">
            {/* Header */}
            <div className="bg-surface-container border-b border-outline-variant px-6 py-3 shrink-0">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-headline-small font-bold text-on-surface">User State Management</h1>
                        <p className="text-body-small text-on-surface-variant">
                            Assign states to users to control data access by geographical region
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {availableStates.length} States
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {users.length} Users
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Search */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredUsers.map((user) => (
                            <Card
                                key={user.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                    selectedUser?.id === user.id ? 'ring-2 ring-primary' : ''
                                }`}
                                onClick={() => handleUserSelect(user)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{user.name}</CardTitle>
                                            <CardDescription>{user.email}</CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openAssignDialog(user);
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Assign
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                Roles: {user.roles?.map(r => r.name).join(', ') || 'None'}
                                            </span>
                                        </div>

                                        {user.assigned_states && user.assigned_states.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {user.assigned_states.map((state) => (
                                                    <Badge
                                                        key={state}
                                                        variant="secondary"
                                                        className="text-xs flex items-center gap-1"
                                                    >
                                                        <MapPin className="h-3 w-3" />
                                                        {state}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeState(user.id, state);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                No states assigned (can access all states)
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No users found matching your search.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Assign States Dialog */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign States</DialogTitle>
                        <DialogDescription>
                            Select states for <strong>{selectedUser?.name}</strong>.
                            They will only be able to view data from these states.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {availableStates.map((state) => (
                            <div key={state} className="flex items-center space-x-2">
                                <Checkbox
                                    id={state}
                                    checked={selectedStates.includes(state)}
                                    onCheckedChange={() => handleStateToggle(state)}
                                />
                                <label
                                    htmlFor={state}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                >
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {state}
                                </label>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={assignStates} disabled={selectedStates.length === 0}>
                            <Save className="h-4 w-4 mr-2" />
                            Assign States
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserStateManagement;
