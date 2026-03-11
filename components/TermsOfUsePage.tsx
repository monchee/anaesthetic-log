import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { FileText, UserCheck, AlertCircle, Copyright, Home, Gavel } from 'lucide-react';
import { Screen } from '../types';

interface TermsOfUsePageProps {
  setScreen: (screen: Screen) => void;
}

const TermsOfUsePage: React.FC<TermsOfUsePageProps> = ({ setScreen }) => {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
              <FileText className="w-6 h-6 text-primary dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-primary">Terms of Use</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Legal terms for using this application
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

          {/* Introduction */}
          <div className="bg-gradient-to-r from-slate-900/5 to-primary/5 dark:from-slate-900/20 dark:to-slate-800/10 rounded-none p-6 border border-slate-900/10 dark:border-primary/30">
            <div className="flex items-start gap-4">
              <Gavel className="w-8 h-8 text-slate-900 dark:text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">Terms of Use</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Welcome to the RPAH Anaesthetic Allergy Clinic application. By accessing or using this application, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this application.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                  Last updated: December 2025
                </p>
              </div>
            </div>
          </div>

          {/* Acceptance of Terms */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">1. Acceptance of Terms</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>
                By accessing, browsing, or using this application, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use this application.
              </p>
              <p>
                These Terms of Use may be updated from time to time. Your continued use of the application following any changes constitutes acceptance of those changes.
              </p>
            </div>
          </div>

          {/* Permitted Use */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">2. Permitted Use</h4>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>This application is intended for use by:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Authorised healthcare professionals</strong> involved in the assessment and management of patients with suspected or confirmed anaesthetic allergies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Clinical staff</strong> of the Royal Prince Alfred Hospital Department of Clinical Immunology & Allergy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Authorised users</strong> within the Sydney Local Health District for legitimate clinical purposes</span>
                </li>
              </ul>
              <p className="mt-3 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-800">
                <strong>Unauthorised use:</strong> Use of this application for any purpose other than legitimate clinical assessment and management is prohibited.
              </p>
            </div>
          </div>

          {/* User Responsibilities */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">3. User Responsibilities</h4>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>As a user of this application, you agree to:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Use the application only for authorised clinical purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Maintain the confidentiality of patient information accessed through the application</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Exercise your own clinical judgment when interpreting application outputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Report any technical issues or concerns to the appropriate governance body</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Comply with all applicable NSW Health policies and guidelines</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Copyright className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">4. Intellectual Property</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>
                This application and its content, including but not limited to text, graphics, layout, and code, are owned by Sydney Local Health District and the Royal Prince Alfred Hospital Department of Clinical Immunology & Allergy.
              </p>
              <p>
                All intellectual property rights are reserved. You may not reproduce, modify, distribute, or create derivative works without explicit written permission from the appropriate authority.
              </p>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-none p-5 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">5. Medical Disclaimer</h4>
                <div className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
                  <p>
                    This application is a clinical support tool designed to assist healthcare professionals. It does not provide medical advice and should not replace professional clinical judgment.
                  </p>
                  <p>
                    All clinical decisions remain the responsibility of the treating clinician. The developers and Sydney Local Health District accept no liability for clinical outcomes resulting from use of this application.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* No Warranty */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">6. No Warranty</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>
                This application is provided "as is" without warranty of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p>
                Sydney Local Health District does not warrant that the application will be uninterrupted, error-free, or meet your specific requirements.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">7. Limitation of Liability</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>
                To the fullest extent permitted by law, Sydney Local Health District, RPAH, and their officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the application.
              </p>
              <p>
                This includes but is not limited to damages for loss of profits, goodwill, use, data, or other intangible losses.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">8. Termination</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>
                Sydney Local Health District reserves the right to suspend or terminate access to this application at any time, with or without notice, for any reason, including but not limited to breach of these Terms of Use.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">9. Governing Law</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>
                These Terms of Use are governed by and construed in accordance with the laws of New South Wales, Australia. You agree to submit to the exclusive jurisdiction of the courts of New South Wales.
              </p>
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

export default TermsOfUsePage;
