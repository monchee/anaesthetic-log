import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { Shield, Eye, Lock, Home, AlertCircle, Mail } from 'lucide-react';
import { Screen } from '../types';

interface PrivacyPolicyPageProps {
  setScreen: (screen: Screen) => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ setScreen }) => {
  const lastUpdated = 'December 2025';

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
              <Shield className="w-6 h-6 text-primary dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-primary">Privacy Policy</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                How we protect your health information
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

          {/* Introduction */}
          <div className="bg-gradient-to-r from-slate-900/5 to-primary/5 dark:from-slate-900/20 dark:to-slate-800/10 rounded-none p-6 border border-slate-900/10 dark:border-primary/30">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Royal Prince Alfred Hospital (RPAH) Anaesthetic Allergy Clinic</strong> is committed to protecting the privacy and confidentiality of your personal and health information. This Privacy Policy explains how we collect, use, store, and safeguard information through this application.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Local Processing Notice */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-none p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">Local-Only Processing</h3>
                <p className="text-sm text-green-800 dark:text-green-300">
                  All patient data is processed <strong>locally in your browser</strong>. No data is transmitted to external servers. The application uses your local REDCap export files and does not store or transmit any patient information outside of your local device.
                </p>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Information We Collect</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>The application may process the following types of information when you use REDCap data exports:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Personal Information:</strong> Name, date of birth, MRN/hospital ID, city or suburb</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Health Information:</strong> Allergy history, test results, clinical notes, reaction details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Clinical Data:</strong> Testing plans, skin prick test results, intradermal test results, challenge outcomes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">How We Use Your Information</h4>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>Your information is used solely for:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Clinical assessment and management of anaesthetic allergies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Generating clinical reports and patient handouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Tracking testing workflows and outcomes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Clinical audit and quality improvement activities</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Storage and Security */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Data Storage and Security</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>We implement appropriate security measures to protect your information:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Local Processing:</strong> All data remains on your device; no server transmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Browser Security:</strong> Utilises your browser's built-in security features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>No Persistent Storage:</strong> Data is cleared when the session ends (unless explicitly saved locally)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>REDCap Compliance:</strong> Original data remains secure within the REDCap system</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Your Rights</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>Under the <strong>Health Records and Information Privacy Act 2002 (NSW)</strong> and the <strong>Privacy Act 1988 (Cth)</strong>, you have the right to:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Access your personal and health information held by RPAH</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Request correction of inaccurate or incomplete information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Make a complaint about how your information is handled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Choose not to identify yourself (where practicable)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Cookies and Tracking */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Cookies and Tracking</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>This application does not use tracking cookies or third-party analytics. Any browser storage (localStorage) is used solely for:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Theme preference (light/dark mode)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Font size accessibility settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>PWA installation status</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-none p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Privacy Contact</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  For privacy-related enquiries or complaints, please contact the RPAH Department of Clinical Immunology & Allergy or the Sydney Local Health District Privacy Officer.
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  General enquiries can be made through the <button onClick={() => setScreen(Screen.CONTACT)} className="underline hover:text-blue-900 dark:hover:text-blue-200">Contact page</button>.
                </p>
              </div>
            </div>
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

export default PrivacyPolicyPage;
