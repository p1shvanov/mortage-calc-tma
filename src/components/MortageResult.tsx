import { List } from '@telegram-apps/telegram-ui';

import ChartsContainer from '@/components/ChartsContainer';
import PaymentSchedule from '@/components/PaymentSchedule';
import ResultsDisplay from '@/components/ResultsDisplay';
import TabPanel from '@/components/TabPanel';
import TabView from '@/components/TabView';
import Page from './Page';

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
    <Page>
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
    </Page>
  );
};

export default MortageResult;
