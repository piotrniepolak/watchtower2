interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Simple wrapper - authentication handled by Replit Auth
  return <>{children}</>;
}