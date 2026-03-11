// ============================================================================
// SHADED UI COMPONENTS (from shadcn/ui)
// ============================================================================

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Button, buttonVariants } from './button';
export { Input } from './input';
export { Label } from './label';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';
export { Textarea } from './textarea';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Separator } from './separator';
export { ScrollArea } from './scroll-area';
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
export { Alert, AlertDescription, AlertTitle } from './alert';
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
export { Skeleton } from './skeleton';
export { Progress } from './progress';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Switch } from './switch';
export {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from './accordion';
export { Toaster } from './sonner';

// ============================================================================
// CUSTOM MEDICAL COMPONENTS (application-specific)
// ============================================================================

// Re-export dropdown menu (custom implementation that works well)
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu';

// Custom Badge with medical grade variants (grade1-4, ungraded)
export { Badge } from './custom-badge';
export { HoverCard, HoverCardTrigger, HoverCardContent } from './custom-hover-card';
export { AccordionItem } from './custom-accordion-item';

// Legacy Toaster (react-hot-toast) - kept for backwards compatibility
import { Toaster as HotToaster } from "react-hot-toast"
export const LegacyToaster = () => {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        zIndex: 100000,
      }}
      toastOptions={{
        duration: 5000,
        className: 'dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg text-sm font-medium',
        style: {
          padding: '12px 16px',
          maxWidth: '500px',
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #10b981',
          }
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #ef4444',
          }
        },
      }}
    />
  )
};
