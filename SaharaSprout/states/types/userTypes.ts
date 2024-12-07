
export interface User {
    uid: string;
    name: string;
    email: string;
    avatar?: string;
    token?: string;
  }
  
  export interface UserStore {
    user: User | null;
    userID: string;
    isUserIdLoading: boolean;
    setUserData: () => Promise<void>;
    clearUserData: () => Promise<void>;
  }