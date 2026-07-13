import {
  LayoutDashboard,
  BookMarked,
  Search,
  GraduationCap,
  Users,
  PenLine,
  BookOpenCheck,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  description: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard, description: "Vue d'ensemble du site" },
  { href: "/ouvrages", label: "Ouvrages", icon: BookMarked, description: "Fonds local du site" },
  { href: "/recherche", label: "Recherche globale", icon: Search, description: "Fan-out sur les 3 sites" },
  { href: "/emprunts", label: "Emprunts", icon: ArrowLeftRight, description: "Transaction distribuée" },
  { href: "/prets", label: "Prêts", icon: BookOpenCheck, description: "Prêts traités par ce site" },
  { href: "/etudiants", label: "Étudiants", icon: GraduationCap, description: "Fragment local" },
  { href: "/employes", label: "Employés", icon: Users, description: "Fragment local" },
  { href: "/auteurs", label: "Auteurs", icon: PenLine, description: "Table répliquée" },
]
