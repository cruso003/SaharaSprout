import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserStore } from '../types/userTypes';


const useUserStore = create(
  persist<UserStore>(
    (set, get) => ({
      user: null,
      userID: "",
      isUserIdLoading: true,

      setUserData: async () => {
        try {
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const parsedUser: User = JSON.parse(userData);        
            set({ user: parsedUser, userID: parsedUser.uid, isUserIdLoading: false });
          } else {
            set({ isUserIdLoading: false });
          }
        } catch (error) {
          console.error('Error retrieving user data:', error);
          set({ isUserIdLoading: false });
        }
      },

      clearUserData: async () => {
        await AsyncStorage.removeItem('userData');
        set({ user: null });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
