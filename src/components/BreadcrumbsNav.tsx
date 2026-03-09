import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '@telegram-apps/telegram-ui';
import { hapticSelection } from '@/utils/haptic';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsNavProps {
  items: BreadcrumbItem[];
  divider?: 'dot' | 'slash' | 'chevron';
}

const BreadcrumbsNav = ({ items, divider = 'slash' }: BreadcrumbsNavProps) => {
  const navigate = useNavigate();

  return (
    <Breadcrumbs divider={divider}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = !isLast && item.path !== undefined;
        return (
          <Breadcrumbs.Item
            key={`${item.path ?? item.label}-${index}`}
            onClick={
              isClickable && item.path
                ? () => {
                    hapticSelection();
                    navigate(item.path!);
                  }
                : undefined
            }
          >
            {item.label}
          </Breadcrumbs.Item>
        );
      })}
    </Breadcrumbs>
  );
};

export default memo(BreadcrumbsNav);
