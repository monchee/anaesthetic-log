import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "danger" | "grade4" | "grade3" | "grade2" | "grade1" | "ungraded";
  className?: string;
  children?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
    destructive: "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
    outline: "text-slate-950 dark:text-slate-50",
    success: "border-transparent bg-green-500 text-white hover:bg-green-600 dark:bg-green-600",
    danger: "border-transparent bg-red-500 text-white hover:bg-red-600 dark:bg-red-600",
    grade4: "border-transparent bg-status-grade4 text-white hover:bg-status-grade4/90",
    grade3: "border-transparent bg-status-grade3 text-white hover:bg-status-grade3/90",
    grade2: "border-transparent bg-status-grade2 text-slate-900 hover:bg-status-grade2/90",
    grade1: "border-transparent bg-status-grade1 text-white hover:bg-status-grade1/90",
    ungraded: "border-transparent bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300",
  };

  return (
    <div ref={ref} className={`inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300 ${variants[variant]} ${className || ''}`} {...props} />
  );
});
Badge.displayName = "Badge";
