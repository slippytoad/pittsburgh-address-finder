import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserCheck, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserWithRole {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Get users from auth.users and their roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at
        `);

      if (error) throw error;

      // For now, we'll show the user_roles data
      // Once Google auth is implemented, we can enhance this to show actual user data
      return userRoles?.map(ur => ({
        id: ur.user_id,
        email: `user-${ur.user_id.slice(0, 8)}`, // Placeholder until we have actual user emails
        role: ur.role as 'admin' | 'user',
        created_at: ur.created_at
      })) || [];
    }
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'user' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserRole.mutate({ userId, newRole: newRole as 'admin' | 'user' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>User Management</CardTitle>
        </div>
        <CardDescription>
          Manage user access and roles. Google authentication integration coming soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4" />
            <span>Current users in the system</span>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading users...
            </div>
          ) : users?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Users will appear here after authentication is implemented.
            </div>
          ) : (
            <div className="space-y-2">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={updateUserRole.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Next Steps</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Implement Google authentication</li>
              <li>• Configure user whitelist functionality</li>
              <li>• Add user invitation system</li>
              <li>• Set up email notifications for new users</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;