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
            <div className="p-2 bg-[#e6e1fd] dark:bg-purple-900/40 rounded-full">
              <Info className="w-6 h-6 text-[#8055f1] dark:text-purple-300" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#441170] dark:text-purple-300">About</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Learn about the RPAH Anaesthetic Allergy Clinic tool</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* Introduction */}
          <div className="bg-gradient-to-r from-[#441170]/5 to-purple-500/5 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg p-6 border border-[#441170]/10 dark:border-purple-700/30">
            <div className="flex items-start gap-4">
              <Stethoscope className="w-8 h-8 text-[#441170] dark:text-purple-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">RPAH Anaesthetic Allergy Clinic</h3>
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
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-[#8055f1]" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Purpose</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                This tool streamlines the management of patient data from REDCap, enabling clinicians to 
                quickly search, filter, and review patient histories before clinic appointments.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[#8055f1]" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Data Privacy</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                All patient data is processed locally in your browser. No data is transmitted to external 
                servers. The application uses your local REDCap export files.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#8055f1]" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Key Features</h4>
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
                  <span className="text-[#8055f1] mt-0.5">•</span>
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
          className="bg-[#441170] hover:bg-[#5a1a8a] text-white px-8"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default AboutPage;
