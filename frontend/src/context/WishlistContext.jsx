import { useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_CHANGED_EVENT } from "../services/auth";
import {
  getSavedJobs,
  mapSavedJob,
  saveJob as saveJobRequest,
  unsaveJob as unsaveJobRequest,
} from "../services/savedJobs";
import { WishlistContext } from "./wishlistStore";

const getCurrentUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const normalizeWishlistJob = (job) => {
  if (!job?.id) {
    return null;
  }

  return {
    id: job.id,
    logo: job.logo || job.company?.logo || "",
    title: job.title || "Untitled role",
    company: job.company?.name || job.company || "Unknown company",
    location: job.location || "Location not listed",
    salary: job.salary || "Salary not disclosed",
    experience: job.experience || "",
    postingDate: job.postingDate || job.postedDate || "Recently posted",
    type: job.type || "",
    tags: job.tags || job.skills || [],
    companyInitials:
      job.companyInitials ||
      (job.company?.name || job.company || "C").charAt(0).toUpperCase(),
  };
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const syncWishlistWithSession = useCallback(async () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setError("");

    if (!user?.id) {
      setWishlist([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await getSavedJobs(user.id);
      setWishlist((data.savedJobs || []).map(mapSavedJob));
    } catch (fetchError) {
      setWishlist([]);
      setError(fetchError.message || "Unable to fetch saved jobs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      syncWishlistWithSession();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [syncWishlistWithSession]);

  useEffect(() => {
    window.addEventListener(AUTH_CHANGED_EVENT, syncWishlistWithSession);
    window.addEventListener("storage", syncWishlistWithSession);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncWishlistWithSession);
      window.removeEventListener("storage", syncWishlistWithSession);
    };
  }, [syncWishlistWithSession]);

  const toggleWishlist = useCallback(
    async (job) => {
      const normalizedJob = normalizeWishlistJob(job);
      const user = getCurrentUser();

      if (!normalizedJob || !user?.id) {
        return { ok: false, requiresAuth: true };
      }

      const exists = wishlist.some((item) => item.id === normalizedJob.id);
      const previousWishlist = wishlist;
      setError("");

      if (exists) {
        setWishlist((prev) =>
          prev.filter((item) => item.id !== normalizedJob.id),
        );

        try {
          await unsaveJobRequest({ userId: user.id, jobId: normalizedJob.id });
          return { ok: true, saved: false };
        } catch (requestError) {
          setWishlist(previousWishlist);
          setError(requestError.message || "Unable to remove saved job");
          return { ok: false, saved: true, error: requestError.message };
        }
      }

      setWishlist((prev) => [...prev, normalizedJob]);

      try {
        await saveJobRequest({ userId: user.id, jobId: normalizedJob.id });
        return { ok: true, saved: true };
      } catch (requestError) {
        setWishlist(previousWishlist);
        setError(requestError.message || "Unable to save job");
        return { ok: false, saved: false, error: requestError.message };
      }
    },
    [wishlist],
  );

  const isInWishlist = useCallback(
    (id) => wishlist.some((item) => item.id === id),
    [wishlist],
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const value = useMemo(
    () => ({
      wishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      isLoading,
      error,
      currentUser,
    }),
    [
      wishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      isLoading,
      error,
      currentUser,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
