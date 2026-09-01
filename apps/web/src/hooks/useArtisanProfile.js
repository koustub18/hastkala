import { useState, useEffect } from 'react';
import { getArtisanProfile, incrementArtisanImpressions } from '@hastkala/core';

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
        const fetchedArtisan = await getArtisanProfile(artisanId);
        
        if (fetchedArtisan) {
          setArtisan({ id: fetchedArtisan.uid, ...fetchedArtisan });
          // Track profile view impression for this specific artisan
          incrementArtisanImpressions(artisanId);
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
