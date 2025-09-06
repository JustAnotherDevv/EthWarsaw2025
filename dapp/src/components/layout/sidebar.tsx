import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Table, 
  FileText, 
  Settings, 
  ChevronRight,
  Plus,
  Search
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const mockTables = [
  { name: 'users', rows: 1234 },
  { name: 'posts', rows: 567 },
  { name: 'comments', rows: 2890 },
  { name: 'categories', rows: 45 },
  { name: 'tags', rows: 123 },
  { name: 'user_profiles', rows: 1234 },
  { name: 'orders', rows: 789 },
  { name: 'products', rows: 234 },
];

export function Sidebar({ open }: SidebarProps) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTables = mockTables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    {
      title: 'Tables',
      icon: Table,
      href: '/tables',
      badge: mockTables.length,
    },
    {
      title: 'SQL Editor',
      icon: FileText,
      href: '/sql-editor',
    },
    {
      title: 'Schema',
      icon: Database,
      href: '/schema',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    },
  ];

  return (
    <div className={cn(
      'relative flex h-full flex-col border-r bg-card transition-all duration-300',
      open ? 'w-64' : 'w-0 overflow-hidden'
    )}>
      <div className="flex h-14 items-center border-b px-4">
        <Database className="mr-2 h-6 w-6 text-emerald-500" />
        <span className="text-lg font-semibold">DB Manager</span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  size="sm"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          <Separator />

          {/* Tables Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Tables</h3>
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredTables.map((table) => (
                <Link key={table.name} to={`/tables/${table.name}`}>
                  <Button
                    variant={location.pathname === `/tables/${table.name}` ? 'secondary' : 'ghost'}
                    className="w-full justify-start h-8 text-xs"
                    size="sm"
                  >
                    <Table className="mr-2 h-3 w-3" />
                    <span className="flex-1 text-left truncate">{table.name}</span>
                    <Badge variant="outline" className="ml-1 text-xs">
                      {table.rows.toLocaleString()}
                    </Badge>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}