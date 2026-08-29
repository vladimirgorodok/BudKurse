// Powered by OnSpace.AI
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (code: string) => void;
  isFavorite: (code: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(['USD', 'EUR', 'RUB']);

  useEffect(() => {
    AsyncStorage.getItem('favorites').then((val) => {
      if (val) {
        try {
          setFavorites(JSON.parse(val));
        } catch {}
      }
    });
  }, []);

  const toggleFavorite = async (code: string) => {
    setFavorites((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      AsyncStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (code: string) => favorites.includes(code);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
