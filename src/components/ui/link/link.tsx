import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

interface LinkProps extends RouterLinkProps {
  className?: string;
  children: React.ReactNode;
}

export const Link = ({ className, children, ...props }: LinkProps) => {
  return (
    <RouterLink className={className} {...props}>
      {children}
    </RouterLink>
  );
};