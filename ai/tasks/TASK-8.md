# TASK-8: Design System Preparation

## Objective

Prepare a design system for the mortgage calculator application using the Telegram UI library (@telegram-apps/telegram-ui). The design system should provide a consistent, mobile-first user interface that follows Telegram's design guidelines while supporting responsive layouts for desktop use.

## Analysis

The Telegram UI library provides a set of components that are designed to match the look and feel of Telegram. These components include:

1. **Blocks**: Avatar, Badge, Banner, Button, Card, Cell, IconButton, Image, List, Placeholder, Section, etc.
2. **Form**: Checkbox, Chip, Input, Radio, Select, Slider, Switch, Textarea, etc.
3. **Layout**: FixedLayout, Tabbar
4. **Typography**: Text, Title, Caption, etc.

We need to create a design system that leverages these components to build a consistent and user-friendly interface for our mortgage calculator application. The design should be mobile-first but also work well on desktop, especially in Telegram's fullscreen mode.

## Requirements

1. Create a consistent design system using Telegram UI components
2. Implement responsive layouts for both mobile and desktop views
3. Define reusable component compositions for common UI patterns
4. Ensure accessibility and usability across different devices
5. Follow Telegram's design guidelines and use their CSS variables

## Implementation Plan

### 1. Create Base Layout Components

Create reusable layout components that will be used throughout the application:

```tsx
// src/components/layout/Container.tsx
import React from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function Container({ children, fullWidth = false }: ContainerProps) {
  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''}`}>
      {children}
    </div>
  );
}
```

```css
/* src/components/layout/Container.module.css */
.container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.fullWidth {
  max-width: none;
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
}
```

### 2. Create Form Components

Create reusable form components that will be used for the loan details form:

```tsx
// src/components/form/FormField.tsx
import React from 'react';
import { Input } from '@telegram-apps/telegram-ui';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  after?: React.ReactNode;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  min,
  max,
  step,
  after
}: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <Input
        header={label}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        status={error ? 'error' : 'default'}
        after={after}
        min={min}
        max={max}
        step={step}
      />
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
```

```css
/* src/components/form/FormField.module.css */
.formField {
  margin-bottom: var(--spacing-md);
}

.error {
  color: var(--error-color);
  font-size: var(--font-size-small);
  margin-top: var(--spacing-xs);
}
```

### 3. Create Card Components

Create reusable card components for displaying information:

```tsx
// src/components/ui/InfoCard.tsx
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
```

```css
/* src/components/ui/InfoCard.module.css */
.infoCard {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.icon {
  margin-right: var(--spacing-sm);
}

.title {
  font-size: var(--font-size-normal);
  color: var(--hint-color);
}

.value {
  font-size: var(--font-size-xlarge);
  font-weight: bold;
  color: var(--text-color);
}
```

### 4. Create Tab Components

Create components for tabbed navigation:

```tsx
// src/components/ui/Tabs.tsx
import React, { useState } from 'react';
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
```

```css
/* src/components/ui/Tabs.module.css */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--card-border-color);
  margin-bottom: var(--spacing-md);
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: none;
  color: var(--hint-color);
  font-size: var(--font-size-normal);
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--transition-normal);
  position: relative;
}

.tab.active {
  color: var(--primary-color);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-color);
}

.icon {
  margin-right: var(--spacing-xs);
}

.tabPanels {
  padding: var(--spacing-md) 0;
}
```

### 5. Create Chart Components

Create wrapper components for Chart.js:

```tsx
// src/components/charts/PieChart.tsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './Chart.module.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  title?: string;
}

export function PieChart({ data, title }: PieChartProps) {
  return (
    <div className={styles.chartContainer}>
      {title && <h3 className={styles.chartTitle}>{title}</h3>}
      <div className={styles.chart}>
        <Pie
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}
```

```tsx
// src/components/charts/LineChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import styles from './Chart.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
    }[];
  };
  title?: string;
}

export function LineChart({ data, title }: LineChartProps) {
  return (
    <div className={styles.chartContainer}>
      {title && <h3 className={styles.chartTitle}>{title}</h3>}
      <div className={styles.chart}>
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </div>
    </div>
  );
}
```

```css
/* src/components/charts/Chart.module.css */
.chartContainer {
  margin-bottom: var(--spacing-lg);
}

.chartTitle {
  font-size: var(--font-size-large);
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
}

.chart {
  height: 300px;
  position: relative;
}

@media (min-width: 768px) {
  .chart {
    height: 400px;
  }
}
```

### 6. Create Table Components

Create components for displaying the payment schedule:

```tsx
// src/components/ui/Table.tsx
import React from 'react';
import styles from './Table.module.css';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className={styles.tableHead}>{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className={styles.tableBody}>{children}</tbody>;
}

export function TableRow({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return <tr className={`${styles.tableRow} ${highlight ? styles.highlight : ''}`}>{children}</tr>;
}

export function TableCell({ children, header }: { children: React.ReactNode; header?: boolean }) {
  return header ? (
    <th className={styles.tableHeader}>{children}</th>
  ) : (
    <td className={styles.tableCell}>{children}</td>
  );
}
```

```css
/* src/components/ui/Table.module.css */
.tableContainer {
  width: 100%;
  overflow-x: auto;
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--card-border-color);
  border-radius: var(--border-radius-md);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-normal);
}

.tableHead {
  background-color: var(--secondary-bg-color);
  position: sticky;
  top: 0;
  z-index: 1;
}

.tableHeader {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  font-weight: bold;
  color: var(--text-color);
  border-bottom: 1px solid var(--card-border-color);
}

.tableCell {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--card-border-color);
  color: var(--text-color);
}

.tableRow:last-child .tableCell {
  border-bottom: none;
}

.tableRow.highlight {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

@media (max-width: 768px) {
  .tableHeader,
  .tableCell {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-small);
  }
}
```

### 7. Create a Design System Documentation Component

Create a component to document the design system:

```tsx
// src/components/DesignSystem.tsx
import React from 'react';
import { Section, Button, Input, Checkbox, Radio, Select } from '@telegram-apps/telegram-ui';
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
              <Button mode="secondary">Secondary Button</Button>
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
            
            <div className={styles.componentRow}>
              <Checkbox>Checkbox</Checkbox>
              <Radio name="radio">Radio Button</Radio>
            </div>
            
            <Select
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' }
              ]}
              value="option1"
              onChange={() => {}}
            />
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
```

```css
/* src/components/DesignSystem.module.css */
.title {
  font-size: var(--font-size-xlarge);
  margin-bottom: var(--spacing-lg);
  color: var(--text-color);
}

.componentRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.heading1 {
  font-size: 24px;
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
}

.heading2 {
  font-size: 20px;
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
}

.heading3 {
  font-size: 16px;
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
}

.paragraph {
  font-size: var(--font-size-normal);
  line-height: 1.5;
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
}

.small {
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--hint-color);
}

.colorGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.colorItem {
  display: flex;
  flex-direction: column;
}

.colorSwatch {
  width: 100%;
  height: 80px;
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-sm);
}

.colorName {
  font-size: var(--font-size-normal);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.colorValue {
  font-size: var(--font-size-small);
  color: var(--hint-color);
}
```

## Dependencies

- @telegram-apps/telegram-ui for UI components
- react-chartjs-2 and chart.js for charts
- CSS Modules for component-specific styling

## Acceptance Criteria

- A comprehensive design system is created using Telegram UI components
- The design system includes layout, form, card, tab, chart, and table components
- All components are responsive and work well on both mobile and desktop
- The design system follows Telegram's design guidelines
- Components are reusable and can be easily composed to build the application
- The design system is documented with examples of each component
