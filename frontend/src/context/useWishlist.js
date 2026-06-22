import { useContext } from 'react';
import { WishlistContext } from './wishlistStore';

export const useWishlist = () => useContext(WishlistContext);
