import React from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { Eye, Lock, Home, AlertCircle, Mail, Shield } from 'lucide-react';
import { Screen } from '@shared/types';

interface PrivacyPolicyPageProps {
  setScreen: (screen: Screen) => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ setScreen }) => {
  const lastUpdated = 'March 2026';

  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card className="border-border">
        <CardContent className="space-y-6">

          {/* Introduction */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-none p-5 sm:p-6 border border-primary/20">
            <p className="text-foreground/90 leading-relaxed">
              <strong className="text-foreground">Royal Prince Alfred Hospital (RPAH) Anaesthetic Allergy Clinic</strong> is committed to protecting the privacy and confidentiality of your personal and health information. This Privacy Policy explains how we collect, use, store, and safeguard information through this application.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Local Processing Notice */}
          <div className="bg-status-success/10 rounded-none p-5 border border-status-success/30">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-status-success mb-2">Local-First Processing</p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  During normal local-only use, patient data is processed <strong>on this device in your browser</strong>. The application uses your local REDCap export files and does not transmit identifiable patient information to external servers. If a clinician chooses to save to the research database, only the deidentified research submission payload is sent to the configured Supabase project.
                </p>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="heading-section">Information We Collect</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>The application may process the following types of information when you use REDCap data exports:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span><strong className="text-foreground">Personal Information:</strong> Name, date of birth, MRN/hospital ID, city or suburb</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span><strong className="text-foreground">Health Information:</strong> Allergy history, test results, clinical notes, reaction details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span><strong className="text-foreground">Clinical Data:</strong> Testing plans, skin prick test results, intradermal test results, challenge outcomes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="heading-section">How We Use Your Information</h2>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Your information is used solely for:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Clinical assessment and management of anaesthetic allergies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Generating clinical reports and patient handouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Tracking testing workflows and outcomes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Clinical audit and quality improvement activities</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Storage and Security */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="heading-section">Data Storage and Security</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>We implement appropriate security measures to protect your information:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span><strong className="text-foreground">Local Processing:</strong> During normal use, patient data remains on your device without server transmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span><strong className="text-foreground">Browser Security:</strong> Utilises your browser's built-in security features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span><strong className="text-foreground">No Persistent Storage:</strong> Data is cleared when the session ends (unless explicitly saved locally)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span><strong className="text-foreground">REDCap Compliance:</strong> Original data remains secure within the REDCap system</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h2 className="heading-section">Your Rights</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Under the <strong className="text-foreground">Health Records and Information Privacy Act 2002 (NSW)</strong> and the <strong className="text-foreground">Privacy Act 1988 (Cth)</strong>, you have the right to:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Access your personal and health information held by RPAH</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Request correction of inaccurate or incomplete information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Make a complaint about how your information is handled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Choose not to identify yourself (where practicable)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Cookies and Tracking */}
          <div className="bg-card rounded-none p-5 border border-border">
            <h2 className="heading-section mb-4">Cookies and Tracking</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>This application does not use tracking cookies or third-party analytics. Browser storage (localStorage) holds only non-identifying preferences:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Theme preference (light/dark mode)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Font size accessibility settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>PWA installation status</span>
                </li>
              </ul>
              <p className="pt-1">Patient and clinical data may be cached temporarily on this device to support an in-progress session (the current report and testing draft). This data is <strong className="text-foreground">automatically deleted after 6 hours</strong> and is removed when you start a new log. Optional research database submission sends only the deidentified research payload to the configured Supabase project.</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-none p-5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="heading-section text-primary mb-2">Privacy Contact</h2>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  For privacy-related enquiries or complaints, please contact the RPAH Department of Clinical Immunology & Allergy or the Sydney Local Health District Privacy Officer.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  General enquiries can be made through the <button type="button" onClick={() => setScreen(Screen.CONTACT)} className="underline text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-none">Contact page</button>.
                </p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-center print:hidden">
        <Button
          onClick={() => setScreen(Screen.LOG)}
          size="lg"
          className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 shadow-sm btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
