// src/components/dialogs/AddPaperDialog.tsx

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAddPaperMutation } from "@/services/apiSlice";
import type { ResearchDomain, PaperStage, ImpactScore } from "@/types/api.types";
import { toast } from "sonner";

// ─── Zod schema ───────────────────────────────────────────────────────────────

// FIX 1: Zod v4 removed `errorMap` from z.enum(). Use `.message` instead.
// The messy "Invalid option: expected one of..." was the Zod v4 default enum
// error leaking through because errorMap was silently ignored.

const paperSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(500, "Title must be at most 500 characters"),

    // FIX 2: Split schema into inputSchema (what the form sees) and a separate
    // transform step. This resolves the resolver type mismatch — useForm<T>
    // must be typed with the INPUT shape, not the transformed output shape.
    // We keep authorsRaw as a plain string here; transformation happens in onSubmit.
    authorsRaw: z
        .string()
        .min(1, "At least one author is required"),

    domain: z
        .enum(["Computer Science", "Biology", "Physics", "Chemistry", "Mathematics",
               "Medicine", "Psychology", "Economics", "Engineering"] as const,
            { message: "Please select a domain" }),

    stage: z
        .enum(["To Read", "Abstract Read", "Introduction Done", "Methods Reviewed",
               "Results Analyzed", "Fully Read", "Notes Completed"] as const,
            { message: "Please select a reading stage" }),

    citations: z
        .string()
        .optional(),

    impactScore: z
        .enum(["High", "Medium", "Low", "Unknown"] as const,
            { message: "Please select an impact score" }),
});

// FIX 3: useForm is typed with the raw INPUT shape (all strings, no transforms).
// SubmitHandler<PaperFormValues> then satisfies handleSubmit's expected param type.
type PaperFormValues = z.infer<typeof paperSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export function AddPaperDialog() {
    const [open, setOpen] = useState(false);

    // RTK Query mutation — replaces the onAddPaper prop entirely
    const [addPaper, { isLoading, isError, error, reset: resetMutation }] = useAddPaperMutation();

    const {
        register,
        handleSubmit,
        control,
        reset: resetForm,
        formState: { errors },
    } = useForm<PaperFormValues>({
        resolver: zodResolver(paperSchema),
        defaultValues: {
            title:       "",
            authorsRaw:  "",
            domain:      undefined,
            stage:       undefined,
            citations:   "",
            impactScore: undefined,
        },
    });

    // ── Handlers ──────────────────────────────────────────────────────────────

    // SubmitHandler<PaperFormValues> satisfies handleSubmit's expected signature,
    // eliminating the "TFieldValues is not assignable" error on the form tag.
    const onSubmit: SubmitHandler<PaperFormValues> = async (raw) => {
        // Transforms that were previously in the schema now live here,
        // keeping the schema as pure validation (no input→output shape change).
        const parsedCitations = raw.citations === "" || raw.citations === undefined
            ? 0
            : parseInt(raw.citations, 10);
        const parsedAuthors = raw.authorsRaw.split(",").map((a) => a.trim()).filter(Boolean);

        try {
            await addPaper({
                title:       raw.title,
                authors:     parsedAuthors,
                domain:      raw.domain as ResearchDomain,
                stage:       raw.stage as PaperStage,
                citations:   parsedCitations,
                impactScore: raw.impactScore as ImpactScore,
            }).unwrap();

            // Success — reset everything and close
            toast.success("Paper Created successfully.");
            resetForm();
            resetMutation();
            setOpen(false);
        } catch {
            // isError is set automatically by RTK Query — no extra state needed.
            // The error banner below the form will appear.
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            // Clear both form and any stale mutation error when the dialog closes
            resetForm();
            resetMutation();
        }
        setOpen(next);
    };

    // ── Error message helper ──────────────────────────────────────────────────

    const getApiErrorMessage = (): string => {
        if (!error) return "Something went wrong. Please try again.";
        // RTK Query serializes errors as { status, data }
        if ("data" in error) {
            const data = error.data as { message?: string };
            return data?.message ?? "Something went wrong. Please try again.";
        }
        return "Network error. Check your connection and try again.";
    };

    /* ──────── render ──────── */
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white">
                    <PlusCircle className="w-4 h-4" /> Add Paper
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px] glass-card border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Add New Research Paper</DialogTitle>
                    <DialogDescription>
                        Enter the details of the paper to add it to your tracking library.
                    </DialogDescription>
                </DialogHeader>

                {/* react-hook-form's handleSubmit wraps our onSubmit */}
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 gap-4">

                        {/* Title */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">Title</label>
                            <Input
                                id="title"
                                placeholder="e.g. Attention Is All You Need"
                                {...register("title")}
                                aria-invalid={!!errors.title}
                            />
                            {errors.title && (
                                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Authors */}
                        <div className="space-y-2">
                            <label htmlFor="authorsRaw" className="text-sm font-medium">
                                Authors <span className="text-muted-foreground font-normal">(comma separated)</span>
                            </label>
                            <Input
                                id="authorsRaw"
                                placeholder="e.g. Vaswani, A., Shazeer, N."
                                {...register("authorsRaw")}
                                aria-invalid={!!errors.authorsRaw}
                            />
                            {errors.authorsRaw && (
                                <p className="text-xs text-red-500 mt-1">{errors.authorsRaw.message as string}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        {/* Domain */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Domain</label>
                            <Controller
                                name="domain"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                        <SelectTrigger aria-invalid={!!errors.domain}>
                                            <SelectValue placeholder="Select domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                                            <SelectItem value="Biology">Biology</SelectItem>
                                            <SelectItem value="Physics">Physics</SelectItem>
                                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                                            <SelectItem value="Medicine">Medicine</SelectItem>
                                            <SelectItem value="Engineering">Engineering</SelectItem>
                                            <SelectItem value="Psychology">Psychology</SelectItem>
                                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                                            <SelectItem value="Economics">Economics</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.domain && (
                                <p className="text-xs text-red-500 mt-1">{errors.domain.message}</p>
                            )}
                        </div>

                        {/* Reading Stage */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reading Stage</label>
                            <Controller
                                name="stage"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                        <SelectTrigger aria-invalid={!!errors.stage}>
                                            <SelectValue placeholder="Select stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="To Read">To Read</SelectItem>
                                            <SelectItem value="Abstract Read">Abstract Read</SelectItem>
                                            <SelectItem value="Introduction Done">Introduction Done</SelectItem>
                                            <SelectItem value="Methods Reviewed">Methods Reviewed</SelectItem>
                                            <SelectItem value="Results Analyzed">Results Analyzed</SelectItem>
                                            <SelectItem value="Fully Read">Fully Read</SelectItem>
                                            <SelectItem value="Notes Completed">Notes Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.stage && (
                                <p className="text-xs text-red-500 mt-1">{errors.stage.message}</p>
                            )}
                        </div>

                        {/* Impact Score */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Impact Score</label>
                            <Controller
                                name="impactScore"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                        <SelectTrigger aria-invalid={!!errors.impactScore}>
                                            <SelectValue placeholder="Select impact" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Unknown">Unknown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.impactScore && (
                                <p className="text-xs text-red-500 mt-1">{errors.impactScore.message}</p>
                            )}
                        </div>

                        {/* Citations */}
                        <div className="space-y-2">
                            <label htmlFor="citations" className="text-sm font-medium">Citations</label>
                            <Input
                                id="citations"
                                type="number"
                                min="0"
                                placeholder="0"
                                {...register("citations")}
                                aria-invalid={!!errors.citations}
                            />
                            {errors.citations && (
                                <p className="text-xs text-red-500 mt-1">{errors.citations.message as string}</p>
                            )}
                        </div>
                    </div>

                    {/* API error banner — only visible when the mutation fails */}
                    {isError && (
                        <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/20 px-3 py-2.5">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600 dark:text-red-400">{getApiErrorMessage()}</p>
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>

                        {/* Disabled + spinner while the API call is in-flight */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[110px]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </span>
                            ) : (
                                "Save Paper"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
