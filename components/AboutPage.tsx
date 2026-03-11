import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { Info, Home, Stethoscope, Users, Target, Shield } from 'lucide-react';
import { Screen } from '../types';

interface AboutPageProps {
  setScreen: (screen: Screen) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ setScreen }) => {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
              <Info className="w-6 h-6 text-primary dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-primary dark:text-primary-foreground">About</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">RPAH Anaesthetic Allergy Clinic Tool</p>
            </div>
          </div>
        </CardHeader>
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
                "Advanced search and filtering capabilities",
                "Detailed patient history and timeline views",
                "Skin test and drug challenge result recording",
                "Clinical report generation",
                "REDCap data import and management"
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
