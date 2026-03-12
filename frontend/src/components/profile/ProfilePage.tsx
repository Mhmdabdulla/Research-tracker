// src/components/profile/ProfilePage.tsx
// User profile page — shows account info and allows updating name/email.
// Uses the updateProfile RTK mutation via apiSlice.

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, CheckCircle2, AlertCircle, Loader2, Save,
  LogOut, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetMeQuery, useUpdateProfileMutation } from "../../services/apiSlice";
import { setUser, clearCredentials, selectUser } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { useNavigate } from "react-router-dom";

// ─── Schema ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0 border-slate-100 dark:border-slate-800">
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const storeUser = useAppSelector(selectUser);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch the current user from the API (also keeps the user in sync)
  const { data: meResponse, isLoading: meLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: updating, isError, error }] = useUpdateProfileMutation();

  // Sync latest API user into Redux
  useEffect(() => {
    if (meResponse?.data) {
      dispatch(setUser(meResponse.data));
    }
  }, [meResponse, dispatch]);

  const user = meResponse?.data ?? storeUser;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name:  user?.name  ?? "",
      email: user?.email ?? "",
    },
  });

  // Reset form when user data arrives
  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const response = await updateProfile(data).unwrap();
      dispatch(setUser(response.data));
      setSuccessMsg("Profile updated successfully.");
      reset({ name: response.data.name, email: response.data.email });
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      // isError handled declaratively
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login", { replace: true });
  };

  const getApiError = (): string => {
    if (!error) return "Something went wrong. Please try again.";
    if ("data" in error) {
      const d = error.data as { message?: string };
      return d?.message ?? "Something went wrong. Please try again.";
    }
    return "Network error. Check your connection and try again.";
  };

  const inputClass = (hasError: boolean) =>
    `w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/40 ${
      hasError
        ? "border-red-400 dark:border-red-700"
        : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
    }`;

  if (meLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 w-full h-full overflow-y-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your account information.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ── Account info sidebar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Avatar */}
              <div className="flex flex-col items-center py-4 mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <p className="mt-3 font-semibold text-slate-800 dark:text-slate-100">{user?.name ?? "—"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email ?? "—"}</p>
              </div>

              {user && (
                <>
                  <InfoRow icon={User}     label="Full name"   value={user.name}  />
                  <InfoRow icon={Mail}     label="Email"        value={user.email} />
                  <InfoRow
                    icon={Calendar}
                    label="Member since"
                    value={new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  />
                  <InfoRow icon={Shield}   label="Auth"         value="JWT / Bearer" />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Edit form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Edit Profile</CardTitle>
              <CardDescription>Update your name or email address.</CardDescription>
            </CardHeader>
            <CardContent>

              {/* Success banner */}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/30 px-3.5 py-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMsg}</p>
                </motion.div>
              )}

              {/* Error banner */}
              {isError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30 px-3.5 py-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{getApiError()}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      {...register("name")}
                      className={inputClass(!!errors.name)}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={inputClass(!!errors.email)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updating || !isDirty}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900/50 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {updating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save changes</>
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="shadow-sm mt-4 border-red-100 dark:border-red-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-600 dark:text-red-400">Sign out</CardTitle>
              <CardDescription>
                This will clear your local session. Your data remains on the server.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
