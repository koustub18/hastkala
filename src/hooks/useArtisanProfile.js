import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useArtisanProfile = (artisanId) => {
  const [artisan, setArtisan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!artisanId) {
      setIsLoading(false);
      return;
    }

    const fetchArtisan = async () => {
      try {
        const docRef = doc(db, 'users', artisanId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setArtisan({ id: docSnap.id, ...docSnap.data() });
        } else {
          setArtisan(null);
        }
      } catch (err) {
        console.error("Error fetching artisan:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtisan();
  }, [artisanId]);

  return { artisan, isLoading };
};
