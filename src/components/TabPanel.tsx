import { memo } from 'react';

import styles from '@/ui.module.css';

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

const TabPanel = ({ children }: TabPanelProps) => {
  return <div className={styles.tabPanel}>{children}</div>;
};

export default memo(TabPanel);
