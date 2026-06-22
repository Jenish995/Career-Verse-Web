import { useCallback, useEffect, useMemo, useState } from 'react';
import { WishlistContext } from './wishlistStore';

const readSavedWishlist = () => {
  try {
    const saved = localStorage.getItem('wishlist');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeWishlistJob = (job) => {
  if (!job?.id) {
    return null;
  }

  return {
    id: job.id,
    logo: job.logo || job.company?.logo || '',
    title: job.title || 'Untitled role',
    company: job.company?.name || job.company || 'Unknown company',
    location: job.location || 'Location not listed',
    salary: job.salary || 'Salary not disclosed',
    experience: job.experience || '',
    postingDate: job.postingDate || job.postedDate || 'Recently posted',
    type: job.type || '',
    tags: job.tags || job.skills || [],
    companyInitials:
      job.companyInitials ||
      (job.company?.name || job.company || 'C').charAt(0).toUpperCase(),
  };
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() =>
    readSavedWishlist().map(normalizeWishlistJob).filter(Boolean),
  );

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((job) => {
    const normalizedJob = normalizeWishlistJob(job);

    if (!normalizedJob) {
      return;
    }

    setWishlist(prev => {
      const exists = prev.find(item => item.id === normalizedJob.id);
      if (exists) {
        return prev.filter(item => item.id !== normalizedJob.id);
      }
      return [...prev, normalizedJob];
    });
  }, []);

  const isInWishlist = useCallback(
    (id) => wishlist.some(item => item.id === id),
    [wishlist],
  );

  const value = useMemo(
    () => ({ wishlist, toggleWishlist, isInWishlist }),
    [wishlist, toggleWishlist, isInWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
