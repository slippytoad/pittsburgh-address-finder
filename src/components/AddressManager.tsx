
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: number;
  address: string;
  created_at: string | null;
}

const AddressManager: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const { toast } = useToast();

  // Function to sort addresses by street name and then by street number
  const sortAddresses = (addresses: Address[]) => {
    return addresses.sort((a, b) => {
      const parseAddress = (address: string) => {
        const match = address.match(/^(\d+)\s+(.+)$/);
        if (match) {
          return {
            number: parseInt(match[1]),
            street: match[2].toLowerCase()
          };
        }
        return {
          number: 0,
          street: address.toLowerCase()
        };
      };

      const aData = parseAddress(a.address);
      const bData = parseAddress(b.address);

      // First sort by street name
      const streetComparison = aData.street.localeCompare(bData.street);
      if (streetComparison !== 0) {
        return streetComparison;
      }

      // If street names are the same, sort by number
      return aData.number - bData.number;
    });
  };

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*');

      if (error) {
        throw error;
      }

      const sortedAddresses = sortAddresses(data || []);
      setAddresses(sortedAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch addresses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = async () => {
    if (!newAddress.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an address',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingAddress(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([{ address: newAddress.trim() }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the new address and re-sort the entire list
      const updatedAddresses = sortAddresses([...addresses, data]);
      setAddresses(updatedAddresses);
      setNewAddress('');
      toast({
        title: 'Success',
        description: 'Address added successfully',
      });
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        title: 'Error',
        description: 'Failed to add address',
        variant: 'destructive',
      });
    } finally {
      setIsAddingAddress(false);
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addAddress();
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter new address (e.g., 123 Main St)"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={addAddress}
            disabled={isAddingAddress || !newAddress.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Current Addresses ({addresses.length})
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAddresses}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="text-sm text-gray-500 py-4 text-center">
              Loading addresses...
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center">
              No addresses found. Add an address to start monitoring violations.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span className="text-sm font-medium flex-1">
                    {address.address}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAddress(address.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>
            These addresses are used to monitor property violations. The system will check for 
            investigation records that match any of these addresses when fetching data from the API.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressManager;
