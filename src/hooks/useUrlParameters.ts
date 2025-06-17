
import { useEffect, useState } from 'react';

export const useUrlParameters = () => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['IN VIOLATION']);
  const [expandAllCards, setExpandAllCards] = useState(false);
  const [highlightedCaseNumber, setHighlightedCaseNumber] = useState<string | null>(null);

  // Debug logging to track state changes
  useEffect(() => {
    console.log('useUrlParameters - selectedStatuses changed:', selectedStatuses);
  }, [selectedStatuses]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    const caseParam = urlParams.get('case');
    
    if (statusParam) {
      const decodedStatus = decodeURIComponent(statusParam);
      console.log('URL status param found:', decodedStatus);
      setSelectedStatuses([decodedStatus]);
      setExpandAllCards(true);
    }
    
    if (caseParam) {
      const decodedCase = decodeURIComponent(caseParam);
      console.log('URL case param found:', decodedCase);
      setHighlightedCaseNumber(decodedCase);
      setExpandAllCards(true);
    }
    
    // Clear the URL parameters to keep URL clean
    if (statusParam || caseParam) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return {
    selectedStatuses,
    setSelectedStatuses,
    expandAllCards,
    highlightedCaseNumber
  };
};
