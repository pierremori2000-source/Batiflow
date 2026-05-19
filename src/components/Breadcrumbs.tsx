import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center gap-1 text-sm mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
          {item.href ? (
            <Link
              to={item.href}
              className="text-slate-400 hover:text-orange-500 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-200 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;