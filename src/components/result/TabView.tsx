import React, { memo, useState } from 'react';

import { IconContainer, SegmentedControl } from '@telegram-apps/telegram-ui';
import { SegmentedControlItem } from '@telegram-apps/telegram-ui/dist/components/Navigation/SegmentedControl/components/SegmentedControlItem/SegmentedControlItem';
import { hapticSelection } from '@/utils/haptic';

export interface TabPanelSpec {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabViewProps {
  panels: TabPanelSpec[];
  defaultTab?: string;
}

const TabView = memo(function TabView({ panels, defaultTab }: TabViewProps) {
  const [activeTab, setActiveTab] = useState(
    defaultTab ?? panels[0]?.id ?? '',
  );

  const activePanel = panels.find((p) => p.id === activeTab);

  return (
    <>
      <SegmentedControl>
        {panels.map((tab) => (
          <SegmentedControlItem
            key={tab.id}
            selected={tab.id === activeTab}
            onClick={() => {
              hapticSelection();
              setActiveTab(tab.id);
            }}
          >
            {tab.label}
            {tab.icon && <IconContainer>{tab.icon}</IconContainer>}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      {activePanel?.content}
    </>
  );
});

export default TabView;
