// src/services/apiSlice.ts
// Single RTK Query slice covering both auth and paper/analytics endpoints.
// Token injection and 401 handling are managed via a custom baseQuery wrapper.

import { createApi, fetchBaseQuery,type BaseQueryFn,type FetchArgs,type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store/store";
import { clearCredentials } from "../store/authSlice";
import type {
  ResearchPaper,
  CreatePaperRequest,
  UpdatePaperRequest,
  ListPapersParams,
  ApiResponse,
  PaginatedResponse,
  DashboardSummary,
  RecentPaper,
  FunnelDataPoint,
  DomainStagesDataPoint,
  CitationsImpactDataPoint,
  // Auth
  SignupRequest,
  LoginRequest,
  UpdateProfileRequest,
  AuthUser,
  AuthResponse,
} from "../types/api.types";

// ─── Tag constants ────────────────────────────────────────────────────────────

const PAPER_TAG     = "Paper"     as const;
const ANALYTICS_TAG = "Analytics" as const;
const USER_TAG      = "User"      as const;

// ─── Raw base query (no token) ────────────────────────────────────────────────

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",

  // Automatically attach the JWT Bearer token from Redux state on every request.
  // This runs BEFORE every fetch so newly-set tokens are always picked up.
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// ─── Wrapper: global 401 handler ─────────────────────────────────────────────
// If ANY request returns 401 (token expired / account deleted), dispatch
// clearCredentials() to wipe localStorage + Redux, which will trigger the
// ProtectedRoute to redirect the user to /login.

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Token is invalid or expired — clear the session immediately.
    api.dispatch(clearCredentials());
  }

  return result;
};

// ─── Helper: repeated-key query string ───────────────────────────────────────
// Express only sees an array when the same key appears multiple times:
//   domain=Chemistry&domain=Biology  →  req.query.domain = ["Chemistry","Biology"]
// URLSearchParams.append() handles this correctly; Object.entries() doesn't.

function buildQueryString(params: ListPapersParams): string {
  const qs = new URLSearchParams();

  if (params.page)       qs.set("page",       String(params.page));
  if (params.limit)      qs.set("limit",      String(params.limit));
  if (params.q)          qs.set("q",          params.q);
  if (params.timePeriod) qs.set("timePeriod", params.timePeriod);
  if (params.sortBy)     qs.set("sortBy",     params.sortBy);
  if (params.sortDir)    qs.set("sortDir",    params.sortDir);

  params.domain?.forEach((d) => qs.append("domain", d));
  params.stage?.forEach((s) => qs.append("stage", s));
  params.impactScore?.forEach((i) => qs.append("impactScore", i));

  const str = qs.toString();
  return str ? `?${str}` : "";
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: [PAPER_TAG, ANALYTICS_TAG, USER_TAG],

  endpoints: (builder) => ({

    // ── Auth ────────────────────────────────────────────────────────────────

    /**
     * POST /api/auth/signup
     * Returns { user, token }. Caller (SignupPage) must dispatch setCredentials().
     */
    signup: builder.mutation<ApiResponse<AuthResponse>, SignupRequest>({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body,
      }),
    }),

    /**
     * POST /api/auth/login
     * Returns { user, token }. Caller (LoginPage) must dispatch setCredentials().
     */
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    /**
     * GET /api/auth/me
     * Returns the current user's profile. Used on app init to rehydrate the
     * user object when a token is found in localStorage.
     */
    getMe: builder.query<ApiResponse<AuthUser>, void>({
      query: () => "/auth/me",
      providesTags: [{ type: USER_TAG, id: "ME" }],
    }),

    /**
     * PATCH /api/auth/me
     * Update name and/or email. Invalidates the ME cache so getMe re-fetches.
     */
    updateProfile: builder.mutation<ApiResponse<AuthUser>, UpdateProfileRequest>({
      query: (body) => ({
        url: "/auth/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: USER_TAG, id: "ME" }],
    }),

    // ── Papers ──────────────────────────────────────────────────────────────

    /**
     * GET /api/papers
     * Paginated, filtered, sorted list scoped to the authenticated user.
     */
    getPapers: builder.query<PaginatedResponse<ResearchPaper>, ListPapersParams>({
      query: (params = {}) => `/papers${buildQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: PAPER_TAG, id } as const)),
              { type: PAPER_TAG, id: "LIST" },
            ]
          : [{ type: PAPER_TAG, id: "LIST" }],
    }),

    /**
     * GET /api/papers/:id
     */
    getPaperById: builder.query<ApiResponse<ResearchPaper>, string>({
      query: (id) => `/papers/${id}`,
      providesTags: (_result, _err, id) => [{ type: PAPER_TAG, id }],
    }),

    /**
     * POST /api/papers
     */
    addPaper: builder.mutation<ApiResponse<ResearchPaper>, CreatePaperRequest>({
      query: (body) => ({ url: "/papers", method: "POST", body }),
      invalidatesTags: [
        { type: PAPER_TAG,     id: "LIST"    },
        { type: ANALYTICS_TAG, id: "SUMMARY" },
      ],
    }),

    /**
     * PATCH /api/papers/:id
     */
    updatePaper: builder.mutation<
      ApiResponse<ResearchPaper>,
      { id: string; body: UpdatePaperRequest }
    >({
      query: ({ id, body }) => ({ url: `/papers/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: PAPER_TAG,     id          },
        { type: PAPER_TAG,     id: "LIST"  },
        { type: ANALYTICS_TAG, id: "SUMMARY" },
      ],
    }),

    /**
     * DELETE /api/papers/:id
     */
    deletePaper: builder.mutation<void, string>({
      query: (id) => ({ url: `/papers/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, id) => [
        { type: PAPER_TAG,     id             },
        { type: PAPER_TAG,     id: "LIST"     },
        { type: ANALYTICS_TAG, id: "SUMMARY"  },
        { type: ANALYTICS_TAG, id: "RECENT"   },
      ],
    }),

    // ── Analytics ────────────────────────────────────────────────────────────

    getSummary: builder.query<ApiResponse<DashboardSummary>, void>({
      query: () => "/analytics/summary",
      providesTags: [{ type: ANALYTICS_TAG, id: "SUMMARY" }],
    }),

    getRecentPapers: builder.query<ApiResponse<RecentPaper[]>, number | void>({
      query: (limit = 5) => `/analytics/recent-papers?limit=${limit}`,
      providesTags: [{ type: ANALYTICS_TAG, id: "RECENT" }],
    }),

    getFunnel: builder.query<ApiResponse<FunnelDataPoint[]>, void>({
      query: () => "/analytics/funnel",
      providesTags: [{ type: ANALYTICS_TAG, id: "FUNNEL" }],
    }),

    getDomainStages: builder.query<ApiResponse<DomainStagesDataPoint[]>, void>({
      query: () => "/analytics/domain-stages",
      providesTags: [{ type: ANALYTICS_TAG, id: "DOMAIN_STAGES" }],
    }),

    getCitationsImpact: builder.query<ApiResponse<CitationsImpactDataPoint[]>, void>({
      query: () => "/analytics/citations-impact",
      providesTags: [{ type: ANALYTICS_TAG, id: "CITATIONS_IMPACT" }],
    }),
  }),
});

// ─── Export hooks ─────────────────────────────────────────────────────────────

export const {
  // Auth
  useSignupMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  // Papers
  useGetPapersQuery,
  useGetPaperByIdQuery,
  useAddPaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
  // Analytics
  useGetSummaryQuery,
  useGetRecentPapersQuery,
  useGetFunnelQuery,
  useGetDomainStagesQuery,
  useGetCitationsImpactQuery,
} = apiSlice;