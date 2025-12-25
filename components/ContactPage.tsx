import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { Mail, Home, MessageSquare, Bug, Lightbulb, Building2 } from 'lucide-react';
import { Screen } from '../types';

interface ContactPageProps {
  setScreen: (screen: Screen) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ setScreen }) => {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e6e1fd] dark:bg-purple-900/40 rounded-full">
              <Mail className="w-6 h-6 text-[#8055f1] dark:text-purple-300" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#441170] dark:text-purple-300">Contact & Support</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Get help and provide feedback</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* Clinic Contact */}
          <div className="bg-gradient-to-r from-[#441170]/5 to-purple-500/5 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg p-6 border border-[#441170]/10 dark:border-purple-700/30">
            <div className="flex items-start gap-4">
              <Building2 className="w-8 h-8 text-[#441170] dark:text-purple-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">RPAH Anaesthetic Allergy Clinic</h3>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  <p>Royal Prince Alfred Hospital</p>
                  <p>Missenden Road, Camperdown NSW 2050</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Options */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
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

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Report an Issue</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Found a bug or something not working correctly?
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please note the steps to reproduce the issue and report to your administrator.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
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
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-100 dark:border-blue-800/40">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Tips for Reporting Issues</h4>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              {[
                "Describe what you were trying to do when the issue occurred",
                "Note any error messages that appeared",
                "Include the browser you are using (Chrome, Safari, Edge, etc.)",
                "Specify whether the issue is reproducible or occurred only once"
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
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
          className="bg-[#441170] hover:bg-[#5a1a8a] text-white px-8"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default ContactPage;
