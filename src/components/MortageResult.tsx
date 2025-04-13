import { List } from '@telegram-apps/telegram-ui';

import ChartsContainer from '@/components/ChartsContainer';
import PaymentSchedule from '@/components/PaymentSchedule';
import ResultsDisplay from '@/components/ResultsDisplay';
import TabPanel from '@/components/TabPanel';
import TabView from '@/components/TabView';


const tabs = [
  {
    id: 'charts',
    icon: '📊 ',
  },
  {
    id: 'schedule',
    icon: '📅',
  },
];

const MortageResult = () => {
  return (
    <List>
      <ResultsDisplay />
      <TabView tabs={tabs} defaultTab='charts'>
        <TabPanel id='charts'>
          <ChartsContainer />
        </TabPanel>
        <TabPanel id='schedule'>
          <PaymentSchedule />
        </TabPanel>
      </TabView>
    </List>
  );
};

export default MortageResult;
