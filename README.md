# The DREAM App

<div align="center">
<img width="1200" height="475" alt="Clinic Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

*Safe sleep, clear answers*
</div>

**DREAM** — Drug Reaction Evaluation & Anaesthetic Management. *Safe sleep, clear answers.*

A specialist web application for investigating and managing suspected anaesthetic drug reactions at the RPAH Department of Clinical Immunology & Allergy.

## Features

### Patient Management
- **Patient Selection**: Choose from existing patient database or create new patient entries
- **Patient History**: View detailed clinical history for existing patients
- **Manual Entry**: Add new patients with complete demographic information

### Testing & Assessment
- **Testing Plan Generator**: Create customised testing panels based on patient history and drug categories
- **Clinical Testing Logs**: Record skin prick tests (SPT), intradermal tests (IDT), and challenge procedures
- **Symptom Tracking**: Document reactions, interventions, and treatment outcomes

### Reporting & Documentation
- **Clinical Reports**: Generate comprehensive clinical reports with test results and outcomes
- **Patient Handouts**: Create printable patient information summaries
- **Testing Plan Print Views**: Preview and print testing protocols

### Dashboard & Analytics
- **Clinical Dashboard**: Overview of recent logs, patient statistics, and testing patterns
- **Research Database**: Browse and filter the full patient dataset
- **Data Management**: Upload custom patient databases via CSV
- **Changelog**: Track application updates and database changes

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for different lighting conditions
- **Font Size Controls**: Adjustable text sizes for accessibility
- **Print-Optimised**: All reports and handouts are print-ready
- **PWA**: Installable as a Progressive Web App on any device

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React hooks
- **Data Storage**: Local storage with CSV import capability

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/monchee/anaesthetic-log.git
   cd anaesthetic-log
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start the development server**:
   ```bash
   bun run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## Usage

### Getting Started
1. Select a patient from the database or create a new manual entry
2. Review patient history (for existing patients)
3. Generate a testing plan based on clinical requirements
4. Proceed to the testing session to record procedures
5. Generate clinical reports and patient handouts

### Data Management
- The application includes demo patient data for testing
- Upload a custom patient database using CSV (REDCap export format)
- All testing logs are stored locally in the browser

### Printing & Export
- Clinical reports and patient handouts are optimised for printing
- Use your browser's print function (Ctrl/Cmd + P) for best results

## Project Structure

```
src/
├── features/            # Feature modules
│   ├── patients/        # Patient selection & management
│   ├── testing/         # Testing session & forms
│   ├── reports/         # Clinical reports & handouts
│   ├── dashboard/       # Clinical dashboard & CSV upload
│   ├── research/        # Research database
│   └── info-pages/      # About, FAQ, Contact, Legal pages
├── core/                # App shell
│   ├── components/      # ScreenLayout, Footer, HelpModal, etc.
│   └── routes/          # Screen routing logic
├── shared/              # Cross-feature utilities
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── data/
└── App.tsx              # Main application component
```

## Development

### Available Scripts

- `bun run dev` — Start development server
- `bun run build` — Build for production
- `bun run preview` — Preview production build
- `bun run lint` — Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for styling
- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`)

## Deployment

Hosted on Cloudflare Pages at [allergy.yuson.au](https://allergy.yuson.au).

## License

For use within the RPAH Department of Clinical Immunology & Allergy. Contact the development team for licensing inquiries.

## Contact

For technical support or feature requests, contact the development team at the Royal Prince Alfred Hospital Department of Clinical Immunology & Allergy.
