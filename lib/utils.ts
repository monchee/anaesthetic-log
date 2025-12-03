export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  // Check if it matches YYYY-MM-DD patterns usually found in ISO strings
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

export const getPositiveResults = (record: any) => {
  const drugs: string[] = [];
  
  // 1. Challenge Positive
  if (record.proceedToChallenge && record.outcome === 'UNSUCCESS') {
      drugs.push(record.challengeDrug);
  }

  // 2. Skin Test Positive (Arbitrary >=3mm)
  (record.testPanel || []).forEach((t: any) => {
      const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
      // If challenged drug was tested in panel, rely on challenge outcome logic above if it was the specific target
      // But typically we list it if skin test positive regardless unless cleared by challenge.
      if (record.proceedToChallenge && drugName === record.challengeDrug) return;

      const isSPT_POS = t.sptWheal && parseInt(t.sptWheal) >= 3;
      const isIDT_POS = (t.idt100 && parseInt(t.idt100) >= 3) || 
                        (t.idt10 && parseInt(t.idt10) >= 3) || 
                        (t.idtNeat && parseInt(t.idtNeat) >= 3);

      if (isSPT_POS || isIDT_POS) {
          drugs.push(drugName);
      }
  });

  return [...new Set(drugs)]; 
};

export const getNegativeResults = (record: any) => {
  const drugs: string[] = [];

  // 1. Challenge Negative
  if (record.proceedToChallenge && record.outcome === 'SUCCESS') {
      drugs.push(record.challengeDrug);
  }

  // 2. Skin Test Negative (Arbitrary <3mm)
  (record.testPanel || []).forEach((t: any) => {
      const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
      if (record.proceedToChallenge && drugName === record.challengeDrug) return;

      const isSPT_POS = t.sptWheal && parseInt(t.sptWheal) >= 3;
      const isIDT_POS = (t.idt100 && parseInt(t.idt100) >= 3) || 
                        (t.idt10 && parseInt(t.idt10) >= 3) || 
                        (t.idtNeat && parseInt(t.idtNeat) >= 3);

      if (!isSPT_POS && !isIDT_POS) {
          drugs.push(drugName);
      }
  });

  return [...new Set(drugs)];
};