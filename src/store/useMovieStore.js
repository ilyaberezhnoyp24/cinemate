import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useMovieStore = create(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,

      login: (data, isSignUp) => {
        const { users } = get();
        const emailLower = data.email ? data.email.toLowerCase() : "";
        const user = users.find(u => u.email.toLowerCase() === emailLower);

          if (isSignUp) {
          // 1. Перевірка на заповнення полів
          if (!data.username || !data.email || !data.password) {
            return { success: false, message: "Заповніть всі поля!" };
          }

          // 2. Валідація Email (стандартний паттерн)
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailLower)) {
            return { success: false, message: "Введіть коректну адресу пошти!" };
          }

          // 3. Валідація Пароля:
          // ^(?=.*[a-z]) - мінімум одна мала літера
          // (?=.*[A-Z])  - мінімум одна велика літера
          // (?=.*\d)     - мінімум одна цифра
          // [a-zA-Z\d]   - тільки латиниця та цифри
          // {6,}         - мінімум 6 символів
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    
          if (!passwordRegex.test(data.password)) {
            return { 
              success: false, 
              message: "Пароль має містити: мінімум 6 символів, велику та малу літери латиницею, та цифру." 
            };
          }

          // 4. Перевірка на співпадіння паролів
          if (data.password !== data.confirmPassword) {
            return { success: false, message: "Паролі не збігаються" };
          }

          // 5. Перевірка на унікальність
          if (user) return { success: false, message: "Цей Email вже зайнятий" };

          const newUser = {
            id: Date.now().toString(),
            name: data.username,
            email: emailLower,
            password: data.password,
            genre: data.genre || "Фантастика",
            favorites: []
          };
    
          set({ users: [...users, newUser], currentUserId: newUser.id });
          return { success: true };
        } else {
          // Логіка входу залишається простою
          if (user && user.password === data.password) {
            set({ currentUserId: user.id });
            return { success: true };
          }
          return { success: false, message: "Невірний Email або пароль" };
        }
      },

      logout: () => {
        console.log("Вихід з акаунту...");
        set({ currentUserId: null });
      },

      updateProfile: (newData) => {
        const { users, currentUserId } = get();
        const updatedUsers = users.map(u => 
          u.id === currentUserId ? { ...u, ...newData } : u
        );
        set({ users: updatedUsers });
      },

      getCurrentUser: () => {
        const { users, currentUserId } = get();
        if (!currentUserId) return null;
        return users.find(u => u.id === currentUserId) || null;
      },

      // --- ДОДАНО ФУНКЦІЇ ДЛЯ FAVORITES ---

      toggleFavorite: (movie) => {
        const { users, currentUserId } = get();
        if (!currentUserId) return;

        const updatedUsers = users.map(u => {
          if (u.id === currentUserId) {
            const exists = u.favorites.find(m => m.id === movie.id);
            const newFavorites = exists
              ? u.favorites.filter(m => m.id !== movie.id)
              : [...u.favorites, movie];
            return { ...u, favorites: newFavorites };
          }
          return u;
        });

        set({ users: updatedUsers });
      },

      isFavorite: (movieId) => {
        const { users, currentUserId } = get();
        if (!currentUserId) return false;
        const user = users.find(u => u.id === currentUserId);
        return user ? user.favorites.some(m => m.id === movieId) : false;
      },
    }),
    {
      name: 'cinemate-v100-final', 
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);