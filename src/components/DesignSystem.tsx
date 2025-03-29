import { useState } from 'react';
import { Section, Button } from '@telegram-apps/telegram-ui';
import { Container } from './layout/Container';
import { FormField } from './form/FormField';
import { InfoCard } from './ui/InfoCard';
import { Tabs, TabPanels, TabPanel } from './ui/Tabs';
import { Table, TableHead, TableBody, TableRow, TableCell } from './ui/Table';
import { PieChart } from './charts/PieChart';
import { LineChart } from './charts/LineChart';
import styles from './DesignSystem.module.css';

export function DesignSystem() {
  const [activeTab, setActiveTab] = useState('components');
  
  return (
    <Container>
      <h1 className={styles.title}>Design System</h1>
      
      <Tabs
        tabs={[
          { id: 'components', label: 'Components' },
          { id: 'typography', label: 'Typography' },
          { id: 'colors', label: 'Colors' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <TabPanels activeTab={activeTab}>
        <TabPanel id="components">
          <Section header="Buttons">
            <div className={styles.componentRow}>
              <Button>Primary Button</Button>
              <Button mode="gray">Secondary Button</Button>
              <Button mode="outline">Outline Button</Button>
              <Button disabled>Disabled Button</Button>
            </div>
          </Section>
          
          <Section header="Form Elements">
            <FormField
              label="Text Input"
              name="textInput"
              value=""
              onChange={() => {}}
              placeholder="Enter text"
            />
            
            <FormField
              label="Number Input"
              name="numberInput"
              type="number"
              value=""
              onChange={() => {}}
              placeholder="Enter number"
            />
            
            {/* Checkbox and Radio components removed temporarily due to type issues */}
            
            {/* Select component removed temporarily due to type issues */}
          </Section>
          
          <Section header="Cards">
            <div className={styles.componentRow}>
              <InfoCard
                title="Monthly Payment"
                value="$1,500"
                icon={<span>💰</span>}
              />
              <InfoCard
                title="Total Interest"
                value="$180,000"
                icon={<span>📈</span>}
              />
            </div>
          </Section>
          
          <Section header="Tables">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell header>Month</TableCell>
                  <TableCell header>Payment</TableCell>
                  <TableCell header>Principal</TableCell>
                  <TableCell header>Interest</TableCell>
                  <TableCell header>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell>$1,500</TableCell>
                  <TableCell>$500</TableCell>
                  <TableCell>$1,000</TableCell>
                  <TableCell>$299,500</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2</TableCell>
                  <TableCell>$1,500</TableCell>
                  <TableCell>$505</TableCell>
                  <TableCell>$995</TableCell>
                  <TableCell>$298,995</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Section>
          
          <Section header="Charts">
            <PieChart
              title="Payment Breakdown"
              data={{
                labels: ['Principal', 'Interest'],
                datasets: [
                  {
                    data: [70, 30],
                    backgroundColor: ['#4caf50', '#f44336'],
                    borderColor: ['#4caf50', '#f44336'],
                    borderWidth: 1
                  }
                ]
              }}
            />
            
            <LineChart
              title="Amortization Schedule"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Principal',
                    data: [500, 505, 510, 515, 520, 525],
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true
                  },
                  {
                    label: 'Interest',
                    data: [1000, 995, 990, 985, 980, 975],
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    fill: true
                  }
                ]
              }}
            />
          </Section>
        </TabPanel>
        
        <TabPanel id="typography">
          <Section header="Typography">
            <h1 className={styles.heading1}>Heading 1</h1>
            <h2 className={styles.heading2}>Heading 2</h2>
            <h3 className={styles.heading3}>Heading 3</h3>
            <p className={styles.paragraph}>
              This is a paragraph of text. It demonstrates the body text style used throughout the application.
            </p>
            <p className={styles.small}>
              This is smaller text, often used for captions or hints.
            </p>
          </Section>
        </TabPanel>
        
        <TabPanel id="colors">
          <Section header="Colors">
            <div className={styles.colorGrid}>
              <div className={styles.colorItem}>
                <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--primary-color)' }}></div>
                <div className={styles.colorName}>Primary Color</div>
                <div className={styles.colorValue}>var(--primary-color)</div>
              </div>
              <div className={styles.colorItem}>
                <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--text-color)' }}></div>
                <div className={styles.colorName}>Text Color</div>
                <div className={styles.colorValue}>var(--text-color)</div>
              </div>
              <div className={styles.colorItem}>
                <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--bg-color)' }}></div>
                <div className={styles.colorName}>Background Color</div>
                <div className={styles.colorValue}>var(--bg-color)</div>
              </div>
              <div className={styles.colorItem}>
                <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--secondary-bg-color)' }}></div>
                <div className={styles.colorName}>Secondary Background</div>
                <div className={styles.colorValue}>var(--secondary-bg-color)</div>
              </div>
              <div className={styles.colorItem}>
                <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--hint-color)' }}></div>
                <div className={styles.colorName}>Hint Color</div>
                <div className={styles.colorValue}>var(--hint-color)</div>
              </div>
              <div className={styles.colorItem}>
                <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--success-color)' }}></div>
                <div className={styles.colorName}>Success Color</div>
                <div className={styles.colorValue}>var(--success-color)</div>
              </div>
              <div className={styles.colorItem}>
                <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--error-color)' }}></div>
                <div className={styles.colorName}>Error Color</div>
                <div className={styles.colorValue}>var(--error-color)</div>
              </div>
            </div>
          </Section>
        </TabPanel>
      </TabPanels>
    </Container>
  );
}
