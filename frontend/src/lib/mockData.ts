export type PaperStage = "To Read" | "Abstract Read" | "Introduction Done" | "Methods Reviewed" | "Results Analyzed" | "Fully Read" | "Notes Completed";
export type ImpactScore = "High" | "Medium" | "Low" | "Unknown";
export type ResearchDomain = "Computer Science" | "Biology" | "Physics" | "Mathematics" | "Medicine" | "Engineering" | "Psychology" | "Chemistry" | "Economics";

export interface ResearchPaper {
    id: string;
    title: string;
    authors: string[];
    domain: ResearchDomain;
    stage: PaperStage;
    citations: number;
    impactScore: ImpactScore;
    dateAdded: string;
}

export const mockPapers: ResearchPaper[] = [
    {
        id: "p1",
        title: "Attention Is All You Need",
        authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
        domain: "Computer Science",
        stage: "Notes Completed",
        citations: 92400,
        impactScore: "High",
        dateAdded: "2023-11-10T08:00:00Z",
    },
    {
        id: "p2",
        title: "Deep Residual Learning for Image Recognition",
        authors: ["He, K.", "Zhang, X.", "Ren, S."],
        domain: "Computer Science",
        stage: "Fully Read",
        citations: 154000,
        impactScore: "High",
        dateAdded: "2023-12-05T09:30:00Z",
    },
    {
        id: "p3",
        title: "CRISPR/Cas9 for genome editing",
        authors: ["Doudna, J.", "Charpentier, E."],
        domain: "Biology",
        stage: "Introduction Done",
        citations: 28000,
        impactScore: "High",
        dateAdded: "2024-01-15T10:15:00Z",
    },
    {
        id: "p4",
        title: "Quantum Supremacy Using a Programmable Superconducting Processor",
        authors: ["Arute, F.", "Arya, K."],
        domain: "Physics",
        stage: "To Read",
        citations: 5600,
        impactScore: "High",
        dateAdded: "2024-02-20T14:45:00Z",
    },
    {
        id: "p5",
        title: "AlphaFold: a solution to a 50-year-old grand challenge in biology",
        authors: ["Jumper, J.", "Evans, R."],
        domain: "Biology",
        stage: "Abstract Read",
        citations: 12500,
        impactScore: "High",
        dateAdded: "2024-03-01T11:20:00Z",
    },
    {
        id: "p6",
        title: "Generative Adversarial Nets",
        authors: ["Goodfellow, I.", "Pouget-Abadie, J."],
        domain: "Computer Science",
        stage: "Notes Completed",
        citations: 46000,
        impactScore: "Medium",
        dateAdded: "2024-03-10T16:00:00Z",
    },
    {
        id: "p7",
        title: "The impact of COVID-19 on global health",
        authors: ["Smith, J.", "Doe, J."],
        domain: "Medicine",
        stage: "Fully Read",
        citations: 3200,
        impactScore: "High",
        dateAdded: "2024-03-12T08:30:00Z",
    },
    {
        id: "p8",
        title: "Blockchain technology: A comprehensive review",
        authors: ["Wang, H.", "Zheng, Z."],
        domain: "Computer Science",
        stage: "Introduction Done",
        citations: 1500,
        impactScore: "Medium",
        dateAdded: "2024-03-18T13:45:00Z",
    },
    {
        id: "p9",
        title: "Graphene: Status and Prospects",
        authors: ["Geim, A. K."],
        domain: "Physics",
        stage: "Abstract Read",
        citations: 38000,
        impactScore: "High",
        dateAdded: "2024-03-25T09:10:00Z",
    },
    {
        id: "p10",
        title: "A survey on Internet of Things architectures",
        authors: ["Al-Fuqaha, A."],
        domain: "Engineering",
        stage: "To Read",
        citations: 8200,
        impactScore: "Medium",
        dateAdded: "2024-03-28T15:20:00Z",
    },
    {
        id: "p11",
        title: "Advances in Neural Information Processing Systems",
        authors: ["Bengio, Y.", "LeCun, Y."],
        domain: "Computer Science",
        stage: "Fully Read",
        citations: 12000,
        impactScore: "Low",
        dateAdded: "2025-01-10T11:00:00Z",
    },
    {
        id: "p12",
        title: "On the Origin of Species by Means of Natural Selection",
        authors: ["Darwin, C."],
        domain: "Biology",
        stage: "Notes Completed",
        citations: 80000,
        impactScore: "High",
        dateAdded: "2025-02-05T14:30:00Z",
    },
    {
        id: "p13",
        title: "Cognitive Behavioral Therapy: A Meta-Analysis",
        authors: ["Hofmann, S.", "Smits, J."],
        domain: "Psychology",
        stage: "Methods Reviewed",
        citations: 4560,
        impactScore: "Medium",
        dateAdded: "2024-04-15T10:00:00Z",
    },
    {
        id: "p14",
        title: "Economic Growth in the Age of AI",
        authors: ["Aghion, P.", "Jones, B."],
        domain: "Economics",
        stage: "Results Analyzed",
        citations: 890,
        impactScore: "Low",
        dateAdded: "2024-03-25T09:00:00Z",
    },
    {
        id: "p15",
        title: "Sustainable Engineering Practices for Climate Mitigation",
        authors: ["Smith, R.", "Patel, K."],
        domain: "Engineering",
        stage: "Abstract Read",
        citations: 560,
        impactScore: "Low",
        dateAdded: "2024-04-05T11:30:00Z",
    }
];
