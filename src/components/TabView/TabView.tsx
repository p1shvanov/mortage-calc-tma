import React, { useState } from 'react';
import styles from './TabView.module.css';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabViewProps {
  tabs: Tab[];
  children: React.ReactNode;
  defaultTab?: string;
}

export function TabView({ tabs, children, defaultTab }: TabViewProps) {
  // No need for localization here as tab labels are passed as props
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);
  
  // Filter children to only show the active tab
  const childrenArray = React.Children.toArray(children);
  const activeChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.props.id === activeTab
  );
  
  return (
    <div className={styles.tabView}>
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className={styles.tabContent}>
        {activeChild}
      </div>
    </div>
  );
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

export function TabPanel({ children }: TabPanelProps) {
  return <div className={styles.tabPanel}>{children}</div>;
}
