import React from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function Container({ children, fullWidth = false }: ContainerProps) {
  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''}`}>
      {children}
    </div>
  );
}
