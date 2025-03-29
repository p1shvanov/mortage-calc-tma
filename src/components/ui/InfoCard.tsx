import React from 'react';
import { Card } from '@telegram-apps/telegram-ui';
import styles from './InfoCard.module.css';

interface InfoCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function InfoCard({ title, value, icon }: InfoCardProps) {
  return (
    <Card className={styles.infoCard}>
      <div className={styles.header}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <div className={styles.title}>{title}</div>
      </div>
      <div className={styles.value}>{value}</div>
    </Card>
  );
}
