// Grading utility functions

export type GradeVariant = "grade4" | "grade3" | "grade2" | "grade1" | "ungraded";

export const getGradeVariant = (grade: string): GradeVariant => {
    if (!grade) return "ungraded";
    const g = grade.toUpperCase();
    if (g.includes("GRADE IV") || g.includes("CARDIAC ARREST") || g === "4") return "grade4";
    if (g.includes("GRADE III") || g.includes("LIFE THREATENING") || g === "3") return "grade3";
    if (g.includes("GRADE II") || g.includes("MODERATE") || g === "2") return "grade2";
    if (g.includes("GRADE I") || g.includes("CUTANEOUS") || g === "1") return "grade1";
    return "ungraded";
};
