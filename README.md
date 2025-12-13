# Anaesthetic Allergy Clinic Management System

<div align="center">
<img width="1200" height="475" alt="Clinic Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A comprehensive web-based application for managing anaesthetic allergy clinic operations at the Royal Prince Alfred Hospital (RPAH) Department of Clinical Immunology & Allergy.

## Features

### 🏥 Patient Management
- **Patient Selection**: Choose from existing patient database or create new patient entries
- **Patient History**: View detailed clinical history for existing patients
- **Manual Entry**: Add new patients with complete demographic information

### 🧪 Testing & Assessment
- **Testing Plan Generator**: Create customized testing panels based on patient history and drug categories
- **Clinical Testing Logs**: Record skin prick tests (SPT), intradermal tests (IDT), and challenge procedures
- **Symptom Tracking**: Document reactions, interventions, and treatment outcomes

### 📋 Reporting & Documentation
- **Clinical Reports**: Generate comprehensive clinical reports with test results and outcomes
- **Patient Handouts**: Create printable patient information summaries
- **Testing Plan Print Views**: Preview and print testing protocols

### 📊 Dashboard & Analytics
- **Clinical Dashboard**: Overview of recent logs, patient statistics, and testing patterns
- **Data Management**: Upload custom patient databases via CSV
- **Changelog**: Track application updates and database changes

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for different lighting conditions
- **Font Size Controls**: Adjustable text sizes for accessibility
- **Print-Optimized**: All reports and handouts are print-ready

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom UI components
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React hooks
- **Data Storage**: Local storage with CSV import/export capability

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/monchee/anaesthetic-log.git
   cd anaesthetic-log
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### Getting Started
1. Select a patient from the database or create a new manual entry
2. Review patient history (for existing patients)
3. Generate a testing plan based on clinical requirements
4. Proceed to the testing session to record procedures
5. Generate clinical reports and patient handouts

### Data Management
- The application includes mock patient data for demonstration
- Upload custom patient databases using CSV format
- All testing logs are stored locally in the browser

### Printing & Export
- Clinical reports and patient handouts are optimized for printing
- Use your browser's print function (Ctrl/Cmd + P) for best results

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Dashboard.tsx   # Main dashboard view
│   ├── TestingLogForm.tsx  # Testing session form
│   ├── ClinicalReport.tsx   # Clinical report generator
│   └── ...
├── data/               # Mock data and constants
├── lib/                # Utility functions and constants
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

This project uses:
- TypeScript for type safety
- ESLint for code linting (configured via Vite)
- Tailwind CSS for styling
- Component-based architecture

## Contributing

1. Create a new branch for your feature: `git checkout -b feature-name`
2. Make your changes and test thoroughly
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-name`
5. Create a Pull Request

## License

This project is intended for use within the RPAH Department of Clinical Immunology & Allergy. Please contact the development team for licensing inquiries.

## Contact

For technical support or feature requests, please contact the development team at the Royal Prince Alfred Hospital Department of Clinical Immunology & Allergy.
