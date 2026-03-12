// src/components/auth/SignupPage.tsx
// Registration page — mirrors the LoginPage layout & design language.

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  BookOpen, Mail, Lock, User, AlertCircle, Loader2, ArrowRight,
  CheckCircle2, BarChart3, Shield,
} from "lucide-react";
import { useSignupMutation } from "../../services/apiSlice";
import { setCredentials } from "../../store/authSlice";
import { useAppDispatch } from "../../hooks/reduxHooks";

// ─── Schema ───────────────────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

// ─── Password strength indicator ─────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  const levels = [
    { label: "Weak",   color: "bg-red-400"    },
    { label: "Fair",   color: "bg-amber-400"  },
    { label: "Good",   color: "bg-blue-400"   },
    { label: "Strong", color: "bg-emerald-400" },
  ];
  const level = levels[Math.min(score - 1, 3)] ?? levels[0];
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? level.color : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{level.label} password</p>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-indigo-200" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-indigo-200/70 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SignupPage() {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const [watchedPassword, setWatchedPassword] = useState("");

  const [signup, { isLoading, isError, error }] = useSignupMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const response = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();
      dispatch(setCredentials({ token: response.data.token, user: response.data.user }));
      navigate("/dashboard", { replace: true });
    } catch {
      // isError handled declaratively below
    }
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

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">

      {/* ── Left panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-violet-600 via-indigo-700 to-indigo-800 p-12 relative overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-20 -left-20 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ResearchTracker</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Start tracking<br />
              <span className="text-violet-200">smarter today.</span>
            </h2>
            <p className="mt-3 text-indigo-200/80 text-base leading-relaxed max-w-sm">
              Join researchers who use a structured system to move from "to read" to "notes completed."
            </p>
          </motion.div>

          <div className="space-y-5">
            <FeatureCard
              icon={CheckCircle2}
              title="7 reading stages"
              description="Track exactly where you are in every paper — from abstract to full notes."
              delay={0.5}
            />
            <FeatureCard
              icon={BarChart3}
              title="Analytics dashboard"
              description="See your reading funnel, domain breakdown, and citation patterns at a glance."
              delay={0.65}
            />
            <FeatureCard
              icon={Shield}
              title="Private & secure"
              description="JWT authentication means your library is yours alone — no sharing by default."
              delay={0.8}
            />
          </div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="relative z-10 grid grid-cols-3 gap-4"
        >
          {[
            { value: "9", label: "Domains" },
            { value: "7",  label: "Stages"  },
            { value: "∞",  label: "Papers"  },
          ].map(({ value, label }) => (
            <div key={label} className="text-center rounded-xl bg-white/10 border border-white/15 py-3 px-2">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-indigo-200/70 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white">ResearchTracker</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Free forever. No credit card required.
            </p>
          </div>

          {/* Error banner */}
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30 px-3.5 py-3"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{getApiError()}</p>
            </motion.div>
          )}

          {/* Form */}
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
                  autoComplete="name"
                  placeholder="Ada Lovelace"
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
                  autoComplete="email"
                  placeholder="ada@university.edu"
                  {...register("email")}
                  className={inputClass(!!errors.email)}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  {...register("password", {
                    onChange: (e) => setWatchedPassword(e.target.value),
                  })}
                  className={inputClass(!!errors.password)}
                />
              </div>
              <PasswordStrength password={watchedPassword} />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={inputClass(!!errors.confirmPassword)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
