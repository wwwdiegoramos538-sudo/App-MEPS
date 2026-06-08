'use client';

import {
  LucideIcon,
  LayoutDashboard,
  FileText,
  Languages,
  Library,
  CreditCard,
  Headphones,
  Palette,
  MessageCircle,
  Settings,
  LogOut,
  Upload,
  Download,
  History,
  Users,
  Shield,
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Sparkles,
  Globe,
  Zap,
  Check,
  ArrowRight,
  Mail,
  Lock,
  User,
  Trash2,
  Star,
  Play,
  Mic,
  Type,
  FileDown,
  Eye,
  Search,
  Plus,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  file: FileText,
  languages: Languages,
  library: Library,
  credit: CreditCard,
  headphones: Headphones,
  palette: Palette,
  message: MessageCircle,
  settings: Settings,
  logout: LogOut,
  upload: Upload,
  download: Download,
  history: History,
  users: Users,
  shield: Shield,
  chart: BarChart3,
  moon: Moon,
  sun: Sun,
  menu: Menu,
  close: X,
  chevron: ChevronRight,
  book: BookOpen,
  sparkles: Sparkles,
  globe: Globe,
  zap: Zap,
  check: Check,
  arrow: ArrowRight,
  mail: Mail,
  lock: Lock,
  user: User,
  trash: Trash2,
  star: Star,
  play: Play,
  mic: Mic,
  type: Type,
  export: FileDown,
  eye: Eye,
  search: Search,
  plus: Plus,
  home: Home,
};

interface OutlineIconProps {
  name: keyof typeof iconMap;
  size?: number;
  className?: string;
}

export function OutlineIcon({ name, size = 20, className }: OutlineIconProps) {
  const Icon = iconMap[name] || FileText;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border-2 border-black bg-white/90 p-0.5 shadow-sm dark:bg-meps-light/20',
        className
      )}
    >
      <Icon size={size} strokeWidth={2.5} className="text-black dark:text-white" />
    </span>
  );
}

export { iconMap };
