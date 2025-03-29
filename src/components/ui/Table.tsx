import React from 'react';
import styles from './Table.module.css';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className={styles.tableHead}>{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className={styles.tableBody}>{children}</tbody>;
}

export function TableRow({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return <tr className={`${styles.tableRow} ${highlight ? styles.highlight : ''}`}>{children}</tr>;
}

export function TableCell({ children, header }: { children: React.ReactNode; header?: boolean }) {
  return header ? (
    <th className={styles.tableHeader}>{children}</th>
  ) : (
    <td className={styles.tableCell}>{children}</td>
  );
}
