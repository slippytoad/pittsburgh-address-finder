import { useState } from 'react';

export const useAddressSearch = () => {
  const [addressSearch, setAddressSearch] = useState('');

  return {
    addressSearch,
    setAddressSearch,
  };
}; 