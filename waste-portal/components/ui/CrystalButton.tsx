'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'glass';
type Size = 'sm' | 'md' | 'lg';

interface CrystalButtonProps {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: Size;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  target?: string;
  rel?: string;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-crystal btn-crystal-primary',
  outline: 'btn-crystal btn-crystal-outline',
  glass: 'btn-crystal btn-crystal-glass',
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '10px 22px', fontSize: '13px' },
  md: { padding: '14px 32px', fontSize: '15px' },
  lg: { padding: '18px 44px', fontSize: '17px' },
};

export default function CrystalButton({
  children,
  variant = 'primary',
  href,
  icon,
  iconPosition = 'left',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  target,
  rel,
}: CrystalButtonProps) {
  const baseClass = `${variantClass[variant]} ${className}`;
  const style = sizeStyles[size];

  const inner = (
    <>
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </>
  );

  const motionProps = {
    whileHover: { scale: 1.03, y: -2 },
    whileTap: { scale: 0.97, y: 0 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
  };

  if (href) {
    return (
      <motion.div
        className="inline-block"
        {...motionProps}
      >
        <Link
          href={href}
          className={baseClass}
          style={{ ...style, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          target={target}
          rel={rel}
        >
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      className={baseClass}
      style={style}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}
