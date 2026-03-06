import { useState } from "react";
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
    SelectValue
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import type {
    ResearchDomain,
    PaperStage,
    ImpactScore,
    ResearchPaper
} from "@/lib/mockData";

interface AddPaperDialogProps {
    onAddPaper: (paper: Omit<ResearchPaper, "id" | "dateAdded">) => void;
}

export function AddPaperDialog({ onAddPaper }: AddPaperDialogProps) {
    const [open, setOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [authors, setAuthors] = useState("");
    const [domain, setDomain] = useState<ResearchDomain | "">("");
    const [stage, setStage] = useState<PaperStage | "">("");
    const [citations, setCitations] = useState("");
    const [impactScore, setImpactScore] = useState<ImpactScore | "">("");


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !authors || !domain || !stage || !impactScore) return;

        onAddPaper({
            title,
            authors: authors.split(",").map(a => a.trim()),
            domain: domain as ResearchDomain,
            stage: stage as PaperStage,
            citations: parseInt(citations) || 0,
            impactScore: impactScore as ImpactScore,
        });

        // Reset and close
        setTitle("");
        setAuthors("");
        setDomain("");
        setStage("");
        setCitations("");
        setImpactScore("");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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

                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">Title</label>
                            <Input
                                id="title"
                                placeholder="e.g. Attention Is All You Need"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="authors" className="text-sm font-medium">Authors (comma separated)</label>
                            <Input
                                id="authors"
                                placeholder="e.g. Vaswani, A., Shazeer, N."
                                value={authors}
                                onChange={(e) => setAuthors(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Domain</label>
                            <Select value={domain} onValueChange={(val) => setDomain(val as ResearchDomain)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select domain" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                                    <SelectItem value="Biology">Biology</SelectItem>
                                    <SelectItem value="Physics">Physics</SelectItem>
                                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                                    <SelectItem value="Medicine">Medicine</SelectItem>
                                    <SelectItem value="Engineering">Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reading Stage</label>
                            <Select value={stage} onValueChange={(val) => setStage(val as PaperStage)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="To Read">To Read</SelectItem>
                                    <SelectItem value="Abstract Read">Abstract Read</SelectItem>
                                    <SelectItem value="Introduction Done">Introduction Done</SelectItem>
                                    <SelectItem value="Fully Read">Fully Read</SelectItem>
                                    <SelectItem value="Notes Completed">Notes Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Impact Score</label>
                            <Select value={impactScore} onValueChange={(val) => setImpactScore(val as ImpactScore)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select impact" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Unknown">Unknown</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="citations" className="text-sm font-medium">Citations</label>
                            <Input
                                id="citations"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={citations}
                                onChange={(e) => setCitations(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Save Paper
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
