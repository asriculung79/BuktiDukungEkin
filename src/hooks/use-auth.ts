import { useEkin } from "@/context/EkinContext";

export function useAuth() {
  const { user, isAuthenticated, isLoadingAuth, signIn, signOut } = useEkin();

  return {
    user: user
      ? {
          id: user.email,
          profile: {
            name: user.name,
            email: user.email,
            picture: user.avatarUrl,
          },
        }
      : null,
    isAuthenticated,
    isLoading: isLoadingAuth,
    signin: signIn,
    signout: signOut,
    signIn,
    signOut,
    error: null as { message: string } | null,
  };
}

export function useUser() {
  const { user } = useAuth();
  return user;
}
