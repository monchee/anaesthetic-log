import React from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { Home, Stethoscope, Users, Target, Shield } from 'lucide-react';
import { Screen } from '@shared/types';

interface AboutPageProps {
  setScreen: (screen: Screen) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ setScreen }) => {
  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          
          {/* Introduction */}
          <div className="bg-gradient-to-r from-slate-900/5 to-primary/5 dark:from-slate-900/20 dark:to-slate-800/10 rounded-none p-6 border border-slate-900/10 dark:border-primary/30">
            <div className="flex items-start gap-4">
              <Stethoscope className="w-8 h-8 text-slate-900 dark:text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">RPAH Anaesthetic Allergy Clinic</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  The Royal Prince Alfred Hospital (RPAH) Anaesthetic Allergy Clinic is a specialised service 
                  investigating patients who have experienced suspected allergic reactions during anaesthesia. 
                  Our multidisciplinary team works to identify the causative agent and provide safe alternatives 
                  for future procedures.
                </p>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Purpose</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                This tool streamlines the management of patient data from REDCap, enabling clinicians to 
                quickly search, filter, and review patient histories before clinic appointments.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Data Privacy</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                All patient data is processed locally in your browser. No data is transmitted to external 
                servers. The application uses your local REDCap export files.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Key Features</h4>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                "Dashboard with patient statistics and analytics",
                "Advanced search and filtering with multiple criteria",
                "Detailed patient history and timeline views",
                "Skin test and drug challenge result recording",
                "Three professional clinical report formats",
                "Patient handout and Powerchart letter generation",
                "Testing plan request form creation and management",
                "Print-optimised layouts for all documents",
                "REDCap data import and management",
                "Dark/light theme and font size customisation",
                "De-identified audit data export (CSV)",
                "Offline access via Progressive Web App (PWA)"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-primary mt-0.5">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={() => setScreen(Screen.LOG)}
          size="lg"
          className="bg-slate-900 hover:bg-[var(--primary)] text-white px-8"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default AboutPage;
