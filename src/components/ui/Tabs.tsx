import React from 'react';
import styles from './Tabs.module.css';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

interface TabPanelsProps {
  activeTab: string;
  children: React.ReactNode;
}

export function TabPanels({ activeTab, children }: TabPanelsProps) {
  const childrenArray = React.Children.toArray(children);
  const activeChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.props.id === activeTab
  );
  
  return <div className={styles.tabPanels}>{activeChild}</div>;
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

export function TabPanel({ children }: TabPanelProps) {
  return <div className={styles.tabPanel}>{children}</div>;
}
