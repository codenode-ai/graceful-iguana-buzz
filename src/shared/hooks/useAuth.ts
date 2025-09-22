import { useAuthContext } from "@/shared/providers/AuthProvider";

export const useAuth = () => {
  return useAuthContext();
};
