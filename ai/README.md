# Mortgage Calculator TMA (Telegram Mini App)

This document outlines the technical specifications and implementation plan for the Mortgage Calculator Telegram Mini App. The goal is to create a lightweight, functional application that allows users from any country to quickly calculate mortgage/credit costs.

## Project Overview

The Mortgage Calculator TMA is designed to provide users with a comprehensive tool for calculating mortgage payments, visualizing payment schedules, and understanding the impact of early payments on their mortgage.

### Key Features

1. **Loan Details Input**: Allow users to input home value, down payment, interest rate, loan term, etc.
2. **Results Display**: Show monthly payment, total interest, and total cost.
3. **Graphical Visualization**: Display pie charts and amortization graphs.
4. **Payment Schedule**: Show a detailed payment schedule table.
5. **Early Payment Functionality**: Allow users to add early payments and see how they affect the loan.
6. **Internationalization**: Support multiple languages based on the user's Telegram settings.
7. **Theming**: Support both light and dark themes using Telegram's theme variables.

## Implementation Tasks

The implementation is divided into several tasks, each focusing on a specific aspect of the application:

- [TASK-5: Project Review and SDK Initialization](tasks/TASK-5.md)
- [TASK-6: Localization Implementation](tasks/TASK-6.md)
- [TASK-7: Theming and Palette Initialization](tasks/TASK-7.md)
- [TASK-8: Design System Preparation](tasks/TASK-8.md)
- [TASK-9: Loan Details Block Implementation](tasks/TASK-9.md)
- [TASK-10: Results Display Implementation](tasks/TASK-10.md)
- [TASK-11: Graphical Display Implementation](tasks/TASK-11-refactored-final.md)
- [TASK-12: Payment Schedule Implementation](tasks/TASK-12-refactored-final.md)
- [TASK-13: Early Payment Functionality](tasks/TASK-13-refactored-final.md)

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Telegram UI (@telegram-apps/telegram-ui)
- **Telegram Integration**: Telegram SDK (@telegram-apps/sdk-react)
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: CSS with Telegram theme variables

## Development Approach

The development will follow these principles:

1. **Mobile-First Design**: The application will be designed primarily for mobile devices, with responsive design for desktop.
2. **Modular Architecture**: Code will be organized into reusable modules for better maintainability.
3. **Modern Patterns**: Use of modern React patterns like hooks, context, and functional components.
4. **Performance Optimization**: Ensure the application is lightweight and performs well on all devices.
5. **Accessibility**: Ensure the application is accessible to all users.
6. **Maximized TelegramUI Integration**: Use TelegramUI components wherever possible to ensure consistent design and behavior.
7. **Minimal Dependencies**: Keep dependencies to a minimum to ensure a lightweight application.

## Reference

The design and functionality are inspired by the reference HTML file located at `/ai/reference.html`, which demonstrates the desired layout, components, and features.
