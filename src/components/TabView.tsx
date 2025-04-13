import React, { memo, useState } from 'react';

import { SegmentedControlItem } from '@telegram-apps/telegram-ui/dist/components/Navigation/SegmentedControl/components/SegmentedControlItem/SegmentedControlItem';
import { IconContainer, SegmentedControl } from '@telegram-apps/telegram-ui';


interface Tab {
  id: string;
  label?: string;
  icon?: React.ReactNode;
}

interface TabViewProps {
  tabs: Tab[];
  children: React.ReactNode;
  defaultTab?: string;
}

const TabView = ({ tabs, children, defaultTab }: TabViewProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);


  const childrenArray = React.Children.toArray(children);
  const activeChild = childrenArray.find(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    (child) => React.isValidElement(child) && child.props.id === activeTab
  );

  return (
    <>
      <SegmentedControl >
        {tabs.map((tab) => (
          <SegmentedControlItem
            key={tab.id}
            selected={tab.id === activeTab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label && tab.label}
            {tab.icon && <IconContainer>{tab.icon}</IconContainer>}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      {activeChild}
    </>
  );
}

export default memo(TabView);

