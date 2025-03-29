import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
}

export function Card({ children, title }: CardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card-bg-color)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-md)',
    padding: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)',
    border: '1px solid var(--card-border-color)',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
  };

  const titleStyle: React.CSSProperties = {
    color: 'var(--text-color)',
    fontSize: 'var(--font-size-large)',
    marginTop: 0,
    marginBottom: 'var(--spacing-sm)'
  };

  const contentStyle: React.CSSProperties = {
    color: 'var(--text-color)'
  };

  return (
    <div style={cardStyle}>
      {title && <h2 style={titleStyle}>{title}</h2>}
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
