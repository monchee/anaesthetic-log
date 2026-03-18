import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { ShieldCheck, Users, Award, AlertTriangle, Home, FileCheck, Hospital } from 'lucide-react';
import { Screen } from '@shared/types';

interface ClinicalGovernancePageProps {
  setScreen: (screen: Screen) => void;
}

const ClinicalGovernancePage: React.FC<ClinicalGovernancePageProps> = ({ setScreen }) => {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
              <ShieldCheck className="w-6 h-6 text-white dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Clinical Governance</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Our commitment to clinical safety and quality
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

          {/* Introduction */}
          <div className="bg-gradient-to-r from-slate-900/5 to-primary/5 dark:from-slate-900/20 dark:to-slate-800/10 rounded-none p-6 border border-slate-900/10 dark:border-primary/30">
            <div className="flex items-start gap-4">
              <Hospital className="w-8 h-8 text-slate-900 dark:text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">RPAH Clinical Governance Framework</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  This application operates under the clinical governance framework of the Royal Prince Alfred Hospital (RPAH) Department of Clinical Immunology & Allergy, within the Sydney Local Health District (SLHD). Our governance practices align with the National Safety and Quality Health Service (NSQHS) Standards and the Australian Digital Health Agency's Clinical Governance Framework for digital health solutions.
                </p>
              </div>
            </div>
          </div>

          {/* Governance Structure */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Governance Structure</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>The application is developed and maintained under the oversight of:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>RPAH Department of Clinical Immunology & Allergy</strong> — Clinical leadership and direction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Sydney Local Health District (SLHD)</strong> — Organisational governance and accountability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>eHealth NSW</strong> — Digital health standards and compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Clinical Director — Immunology & Allergy</strong> — Clinical governance accountability</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Clinical Safety and Risk Management */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Clinical Safety and Risk Management</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>We maintain clinical safety through:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Clinician-led Design:</strong> Developed by clinicians for clinical use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Peer Review:</strong> Clinical workflows reviewed by specialist immunologists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Risk Assessment:</strong> Regular clinical risk assessments for digital tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Incident Reporting:</strong> Integrated with SLHD incident management processes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Clinical Judgment:</strong> The app supports, not replaces, clinical decision-making</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Partnership with Consumers */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Partnership with Consumers</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>We engage with patients and consumers to ensure our services meet their needs:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Patient feedback informs ongoing improvements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Clear, accessible patient handouts and information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Transparent about the purpose and limitations of the service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Respect for patient privacy and autonomy</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Clinical Effectiveness */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Clinical Effectiveness and Quality Improvement</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>We are committed to continuous improvement and evidence-based practice:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Evidence-Based:</strong> Aligned with current Australasian Society of Clinical Immunology and Allergy (ASCIA) guidelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Audit and Review:</strong> Regular clinical audit of testing outcomes and patient pathways</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Outcome Monitoring:</strong> Tracking of clinical outcomes for quality assurance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Professional Development:</strong> Team members maintain up-to-date knowledge and skills</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Alignment with Standards */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-none p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Alignment with National Standards</h4>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>This application aligns with the following frameworks:</p>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                  <p className="font-medium text-slate-800 dark:text-slate-200">NSQHS Standard 1</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Clinical Governance</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                  <p className="font-medium text-slate-800 dark:text-slate-200">NSQHS Standard 2</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Partnering with Consumers</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                  <p className="font-medium text-slate-800 dark:text-slate-200">ADHA Framework</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Digital Health Clinical Governance</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                  <p className="font-medium text-slate-800 dark:text-slate-200">NSW Health Policy</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Privacy & Security</p>
                </div>
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

export default ClinicalGovernancePage;
