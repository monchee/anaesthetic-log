import React from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { Users, Award, AlertTriangle, Home, FileCheck, Hospital } from 'lucide-react';
import { Screen } from '@shared/types';

interface ClinicalGovernancePageProps {
  setScreen: (screen: Screen) => void;
}

const ClinicalGovernancePage: React.FC<ClinicalGovernancePageProps> = ({ setScreen }) => {
  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">

          {/* Introduction */}
          <div className="bg-gradient-to-r from-slate-900/5 to-primary/5 dark:from-slate-900/20 dark:to-slate-800/10 rounded-none p-6 border border-slate-900/10 dark:border-primary/30">
            <div className="flex items-start gap-4">
              <Hospital className="w-8 h-8 text-slate-900 dark:text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">RPAH Clinical Governance Framework</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This application operates under the clinical governance framework of the Royal Prince Alfred Hospital (RPAH) Department of Clinical Immunology & Allergy, within the Sydney Local Health District (SLHD). Our governance practices align with the National Safety and Quality Health Service (NSQHS) Standards and the Australian Digital Health Agency's Clinical Governance Framework for digital health solutions.
                </p>
              </div>
            </div>
          </div>

          {/* Governance Structure */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Governance Structure</h4>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
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
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Clinical Safety and Risk Management</h4>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
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
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Partnership with Consumers</h4>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
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
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Clinical Effectiveness and Quality Improvement</h4>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
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
          <div className="bg-card rounded-none p-5 border border-border">
            <h4 className="font-semibold text-foreground mb-4">Alignment with National Standards</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>This application aligns with the following frameworks:</p>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <div className="bg-card p-3 rounded border border-border">
                  <p className="font-medium text-foreground/90">NSQHS Standard 1</p>
                  <p className="text-xs text-muted-foreground">Clinical Governance</p>
                </div>
                <div className="bg-card p-3 rounded border border-border">
                  <p className="font-medium text-foreground/90">NSQHS Standard 2</p>
                  <p className="text-xs text-muted-foreground">Partnering with Consumers</p>
                </div>
                <div className="bg-card p-3 rounded border border-border">
                  <p className="font-medium text-foreground/90">ADHA Framework</p>
                  <p className="text-xs text-muted-foreground">Digital Health Clinical Governance</p>
                </div>
                <div className="bg-card p-3 rounded border border-border">
                  <p className="font-medium text-foreground/90">NSW Health Policy</p>
                  <p className="text-xs text-muted-foreground">Privacy & Security</p>
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
          className="bg-slate-900 dark:bg-primary hover:bg-primary text-white px-8"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default ClinicalGovernancePage;
