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
export { Skeleton, SkeletonText, SkeletonCard } from './skeleton';
export { Progress } from './progress';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Switch } from './switch';
export {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from './accordion';
export { Toaster } from './sonner';

// ============================================================================
// CUSTOM MEDICAL COMPONENTS (application-specific)
// ============================================================================

// Re-export dropdown menu (custom implementation that works well)
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from './dropdown-menu';

// Custom Badge with medical grade variants (grade1-4, ungraded)
export { Badge } from './badge';
export { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
