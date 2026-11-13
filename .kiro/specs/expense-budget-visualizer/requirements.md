# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that lets users record spending transactions, view a running total balance, manage transaction entries, and visualize spending distribution by category through a pie chart. The application is built with three files: index.html for structure (loading Chart.js from a CDN), css/style.css for styling, and js/main.js for logic, using Vanilla JavaScript with no frameworks and no backend server. All data is persisted in the browser Local Storage. The application supports a dark/light theme toggle, custom categories, and transaction sorting, and is designed to be clean, minimal, and mobile-friendly.

## Glossary

- **Expense_Budget_Visualizer**: The web application being built, consisting of index.html, css/style.css, and js/main.js, which loads Chart.js from a CDN.
- **Total_Balance**: The aggregate sum of all Transaction amounts, displayed prominently at the top of the interface.
- **Transaction**: A single spending record consisting of an item name, an amount, and a category.
- **Input_Form**: The form containing fields for item name, amount, and category, plus an "Add Transaction" button.
- **Transaction_List**: The scrollable list displaying all added Transactions with their name, amount, category, and a Delete button for each entry.
- **Spending_Chart**: The Chart.js pie chart visualizing spending distribution grouped by category.
- **Category**: A classification label for a Transaction. Default categories are Food, Transport, and Fun. Users may add custom categories.
- **Theme_Toggle**: The control that switches the interface between dark and light appearance modes.
- **Sort_Control**: The control that orders the Transaction_List by amount or by category.
- **Local_Storage**: The browser Web Storage API used to persist Transactions and application settings on the client device.
- **Chart.js**: A third-party JavaScript charting library loaded from a CDN, used to render the Spending_Chart.

## Requirements

### Requirement 1: Display Total Balance

**User Story:** As a user, I want to see my total balance displayed prominently at the top, so that I can quickly understand my overall spending at a glance.

#### Acceptance Criteria

1. THE Expense_Budget_Visualizer SHALL display the Total_Balance at the top of the interface, above all other displayed elements, in blue text that is larger than any other text element on the interface.
2. WHEN a Transaction is added, THE Expense_Budget_Visualizer SHALL recompute and display the updated Total_Balance without requiring additional user action, within 1 second of the Transaction being added.
3. WHEN a Transaction is deleted, THE Expense_Budget_Visualizer SHALL recompute and display the updated Total_Balance without requiring additional user action, within 1 second of the Transaction being deleted.
4. THE Expense_Budget_Visualizer SHALL compute the Total_Balance as the sum of all Transaction amounts, where income Transactions increase the Total_Balance and expense Transactions decrease the Total_Balance.

### Requirement 2: Add Transaction via Input Form

**User Story:** As a user, I want to fill in an item name, amount, and category and add a transaction, so that I can record my spending entries.

#### Acceptance Criteria

1. THE Input_Form SHALL contain fields for item name, amount, and category, and an "Add Transaction" button.
2. THE Input_Form SHALL provide the default categories Food, Transport, and Fun in the category field.
3. IF any Input_Form field is empty when the "Add Transaction" button is pressed, THEN THE Expense_Budget_Visualizer SHALL prevent submission and indicate which fields require input.
4. WHEN all Input_Form fields are filled with valid values and the "Add Transaction" button is pressed, THE Expense_Budget_Visualizer SHALL create a new Transaction from the entered values and clear the Input_Form fields.
5. IF the amount field contains a non-numeric value or a value outside the range 0.01 to 999,999,999.99 when the "Add Transaction" button is pressed, THEN THE Expense_Budget_Visualizer SHALL prevent submission and indicate that the amount field requires a numeric value within the valid range.

### Requirement 3: Display and Delete Transactions

**User Story:** As a user, I want to view a scrollable list of my transactions and delete individual entries, so that I can manage my spending records.

#### Acceptance Criteria

1. THE Transaction_List SHALL display every Transaction with its item name, amount, and category.
2. WHILE the number of Transactions exceeds the visible area, THE Transaction_List SHALL provide scrolling.
3. THE Transaction_List SHALL display a "Delete" button for each Transaction.
4. WHEN the "Delete" button for a Transaction is pressed, THE Expense_Budget_Visualizer SHALL remove that Transaction from the Transaction_List and from Local_Storage.
5. IF no Transactions exist, THEN THE Transaction_List SHALL display a message indicating that no Transactions are available.
6. IF removal of a Transaction from Local_Storage fails, THEN THE Expense_Budget_Visualizer SHALL retain the Transaction in the Transaction_List and display an error message indicating that the deletion failed.

### Requirement 4: Visualize Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending distribution by category, so that I can understand how my spending is distributed.

#### Acceptance Criteria

1. THE Expense_Budget_Visualizer SHALL render a Spending_Chart as a pie chart using Chart.js showing spending grouped by category, where each segment represents the sum of amounts for Transactions sharing that category, and only categories with a total amount greater than zero are displayed as segments.
2. WHEN a Transaction is added or deleted, THE Spending_Chart SHALL update to reflect the current spending distribution without additional user action, within 2 seconds of the Transaction being added or deleted.
3. WHEN there are no Transactions, THE Spending_Chart SHALL display an indication that no spending data is available instead of rendering a pie chart.

### Requirement 5: Persist Data in Local Storage

**User Story:** As a user, I want my transactions to persist when I reload or reopen the app, so that I do not lose my data.

#### Acceptance Criteria

1. WHEN a Transaction is created, THE Expense_Budget_Visualizer SHALL save it to Local_Storage.
2. WHEN a Transaction is deleted, THE Expense_Budget_Visualizer SHALL remove it from Local_Storage.
3. WHEN the Expense_Budget_Visualizer loads, THE Expense_Budget_Visualizer SHALL read all saved Transactions from Local_Storage and render the Total_Balance, Transaction_List, and Spending_Chart from that data.
4. THE Expense_Budget_Visualizer SHALL store all data on the client device using Local_Storage and SHALL operate without a backend server.
5. IF saving a Transaction to Local_Storage fails, THEN THE Expense_Budget_Visualizer SHALL display an error message indicating the save failed and retain the Transaction in the current session state.
6. WHEN the Expense_Budget_Visualizer loads with no saved Transactions in Local_Storage, THE Expense_Budget_Visualizer SHALL render a Total_Balance of zero, an empty Transaction_List, and an empty Spending_Chart.
7. IF Local_Storage contains data that cannot be parsed as valid Transactions, THEN THE Expense_Budget_Visualizer SHALL discard the invalid data and render the Total_Balance, Transaction_List, and Spending_Chart from the remaining valid Transactions.

### Requirement 6: Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light appearance, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Expense_Budget_Visualizer SHALL display a Theme_Toggle control indicating the currently active theme.
2. WHEN the Theme_Toggle is activated, THE Expense_Budget_Visualizer SHALL switch the interface to the theme that is not currently active and update the Theme_Toggle to indicate the newly active theme.
3. WHEN the selected theme changes, THE Expense_Budget_Visualizer SHALL save the selected theme to Local_Storage.
4. WHEN the Expense_Budget_Visualizer loads, THE Expense_Budget_Visualizer SHALL apply the previously saved theme from Local_Storage.
5. IF no saved theme exists in Local_Storage when the Expense_Budget_Visualizer loads, THEN THE Expense_Budget_Visualizer SHALL apply the light theme as the default.

### Requirement 7: Custom Categories

**User Story:** As a user, I want to add my own categories beyond the defaults, so that I can classify transactions in a way that fits my spending.

#### Acceptance Criteria

1. THE Expense_Budget_Visualizer SHALL allow the user to add a custom Category with a name between 1 and 30 characters in addition to Food, Transport, and Fun.
2. WHEN a custom Category is added, THE Expense_Budget_Visualizer SHALL make it available in the Input_Form category field.
3. WHEN a custom Category is added, THE Expense_Budget_Visualizer SHALL persist the custom Category in Local_Storage.
4. WHEN the Expense_Budget_Visualizer loads, THE Expense_Budget_Visualizer SHALL restore all custom Categories from Local_Storage into the Input_Form category field.
5. IF the custom Category name is empty, exceeds 30 characters, or duplicates an existing Category, THEN THE Expense_Budget_Visualizer SHALL reject the addition, display an error message indicating the validation failure, and SHALL NOT persist the rejected Category.

### Requirement 8: Sort Transactions

**User Story:** As a user, I want to sort my transactions by amount or by category, so that I can review my spending in a meaningful order.

#### Acceptance Criteria

1. THE Expense_Budget_Visualizer SHALL provide a Sort_Control that orders the Transaction_List by amount or by category.
2. WHEN the Sort_Control is set to sort by amount, THE Transaction_List SHALL order Transactions by amount in ascending order from the lowest amount to the highest amount.
3. WHEN the Sort_Control is set to sort by category, THE Transaction_List SHALL order Transactions by category in ascending alphabetical order.
4. WHEN the Transaction_List is ordered by the selected sort key and two or more Transactions share equal values for that key, THE Transaction_List SHALL maintain the existing relative order among those equal Transactions.

### Requirement 9: Responsive Layout

**User Story:** As a user, I want the app to look good on both desktop and mobile, so that I can use it on any device.

#### Acceptance Criteria

1. THE Expense_Budget_Visualizer SHALL display the Total_Balance at the top, the Input_Form below it, and the Transaction_List and Spending_Chart below the Input_Form.
2. WHILE the viewport width is at least 768 pixels, THE Expense_Budget_Visualizer SHALL display the Transaction_List and Spending_Chart side-by-side.
3. WHILE the viewport width is less than 768 pixels, THE Expense_Budget_Visualizer SHALL stack the Transaction_List and Spending_Chart vertically with the Transaction_List above the Spending_Chart.

### Requirement 10: Performance

**User Story:** As a user, I want the app to respond quickly to my actions, so that I have a smooth experience.

#### Acceptance Criteria

1. WHEN a Transaction is added, updated, or deleted, THE Expense_Budget_Visualizer SHALL update the Total_Balance, Transaction_List, and Spending_Chart within 100 milliseconds.
2. WHEN the Expense_Budget_Visualizer loads, THE Expense_Budget_Visualizer SHALL load and display stored data from Local_Storage within 500 milliseconds.
3. IF Local_Storage is empty when the Expense_Budget_Visualizer loads, THEN THE Expense_Budget_Visualizer SHALL display the empty initial state within 500 milliseconds of page load.

### Requirement 11: Browser Compatibility

**User Story:** As a user, I want the app to work across modern browsers, so that I can use my preferred browser.

#### Acceptance Criteria

1. THE Expense_Budget_Visualizer SHALL render all UI elements, process user input, and display expense and budget data without errors in the two most recent stable major versions of Chrome, Firefox, Edge, and Safari.
2. THE Expense_Budget_Visualizer SHALL allow the user to add, view, and delete expense and budget data in the two most recent stable major versions of Chrome, Firefox, Edge, and Safari, whether used as a standalone web app or as a browser extension.

### Requirement 12: Simplicity and Visual Design

**User Story:** As a user, I want a clean and easy-to-use interface, so that I can understand and use the app without a complex setup.

#### Acceptance Criteria

1. THE Expense_Budget_Visualizer SHALL present a main interface displaying no more than 5 interactive controls (buttons, input fields, and selectors) on initial load.
2. THE Expense_Budget_Visualizer SHALL display all body text at a minimum font size of 14 pixels and maintain a contrast ratio of at least 4.5:1 between text and its background.
3. THE Expense_Budget_Visualizer SHALL require no account creation, software installation, or configuration before a user can enter expenses and view budget visualizations after opening the application in a browser.
4. THE Expense_Budget_Visualizer SHALL display primary section headings at a larger visual size than secondary content labels.
