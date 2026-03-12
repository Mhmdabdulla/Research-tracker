// src/components/layout/AppInitializer.tsx
// On first render, if a token exists in localStorage (rehydrated into Redux by
// authSlice's initialState), fetch /auth/me to restore the user object.
// If the token is invalid/expired, the 401 handler in apiSlice clears it.

import { useEffect } from "react";
import { useGetMeQuery } from "../../services/apiSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { setUser } from "../../store/authSlice";
import { selectToken } from "../../store/authSlice";


interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const dispatch = useAppDispatch();
  const token    = useAppSelector(selectToken);

  // Only fire the getMe query when a token exists — skip is false when token is present
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (meResponse?.data) {
      dispatch(setUser(meResponse.data));
    }
  }, [meResponse, dispatch]);

  return <>{children}</>;
}
