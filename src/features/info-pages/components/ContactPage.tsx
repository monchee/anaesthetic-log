import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { Mail, Home, MessageSquare, Bug, Lightbulb, Building2 } from 'lucide-react';
import { Screen } from '@shared/types';

interface ContactPageProps {
  setScreen: (screen: Screen) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ setScreen }) => {
  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
              <Mail className="w-6 h-6 text-white dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Contact & Support</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Get help and provide feedback</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* Clinic Contact */}
          <div className="bg-gradient-to-r from-slate-900/5 to-primary/5 dark:from-slate-900/20 dark:to-slate-800/10 rounded-none p-6 border border-slate-900/10 dark:border-primary/30">
            <div className="flex items-start gap-4">
              <Building2 className="w-8 h-8 text-slate-900 dark:text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-3">RPAH Anaesthetic Allergy Clinic</h3>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Department of Clinical Immunology & Allergy</p>
                    <p>Royal Prince Alfred Hospital</p>
                    <p>Missenden Road, Camperdown NSW 2050</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-400">
                    <p><strong>Phone:</strong> (02) 9515 8814</p>
                    <p><strong>Email:</strong> SLHD-RPA-ClinicalImmunology@health.nsw.gov.au</p>
                    <p><strong>Clinic Location:</strong> Level 5, Gloucester House</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-400">
                    <p className="text-xs italic text-slate-500 dark:text-slate-400">Standard business hours: Monday to Friday, 9:00 AM – 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Options */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-slate-900 dark:text-white">General Enquiries</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                For questions about using the application or general support.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Contact your clinic administrator or IT support.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Report an Issue</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Found a bug or something not working correctly?
              </p>
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <p>
                  <strong>Standard issues:</strong> Report to your clinic administrator with steps to reproduce.
                </p>
                <p>
                  <strong>Urgent/Critical issues:</strong> Contact the allergy nursing team directly at <strong>SLHD-RPA-allergynurses@health.nsw.gov.au</strong> if the issue impacts patient care.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Feature Requests</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Have an idea to improve the application?
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We welcome feedback! Share your suggestions with the development team.
              </p>
            </div>
          </div>

          {/* Tips for Reporting Issues */}
          <div className="bg-nsw-info-bg dark:bg-nsw-info/10 rounded-none p-5 border border-nsw-info/20 dark:border-nsw-info/30">
            <h4 className="font-semibold text-nsw-info dark:text-nsw-blue mb-3">Tips for Reporting Issues</h4>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {[
                "Describe what you were trying to do when the issue occurred",
                "Note any error messages that appeared",
                "Include the browser you are using (Chrome, Safari, Edge, etc.)",
                "Specify whether the issue is reproducible or occurred only once"
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-nsw-info dark:text-nsw-blue mt-0.5">•</span>
                  {tip}
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

export default ContactPage;
