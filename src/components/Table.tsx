import React from 'react';

import { Caption, Text } from '@telegram-apps/telegram-ui';

import styles from '@/ui.module.css';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table = ({ children, className }: TableProps) => {
  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      <table className={styles.table}>{children}</table>
    </div>
  );
};

export const TableHead = ({ children }: { children: React.ReactNode }) => {
  return <thead className={styles.tableHead}>{children}</thead>;
};

export const TableFoot = ({ children }: { children: React.ReactNode }) => {
  return <tfoot className={styles.tableHead}>{children}</tfoot>;
};

export const TableBody = ({ children }: { children: React.ReactNode }) => {
  return <tbody className={styles.tableBody}>{children}</tbody>;
};

export const TableRow = ({
  children,
  highlight,
  style,
}: {
  children: React.ReactNode;
  highlight?: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <tr 
      className={`${styles.tableRow} ${highlight ? styles.highlight : ''}`}
      style={style}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({
  children,
  header,
}: {
  children?: React.ReactNode;
  header?: boolean;
}) => {
  return header ? (
    <th className={styles.tableHeader}>
      <Caption weight='1'>{children}</Caption>
    </th>
  ) : (
    <td className={styles.tableCell}>
      <Text weight='3'>{children}</Text>
    </td>
  );
};
