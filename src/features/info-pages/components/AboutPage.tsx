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
      <Card className="border-border">
        <CardContent className="space-y-6">

          {/* Introduction */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-none p-5 sm:p-6 border border-primary/20">
            <div className="flex items-start gap-4">
              <Stethoscope className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3>The DREAM App</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Royal Prince Alfred Hospital (RPAH) Anaesthetic Allergy Clinic is a specialist service
                  for patients who have experienced a suspected allergic reaction during an anaesthetic.
                  Our team investigates these reactions to identify the drug responsible and help plan
                  safe anaesthesia for future procedures.
                </p>
              </div>
            </div>
          </div>

          {/* Purpose & Data Privacy */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card rounded-none p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h4 className="mb-0">Purpose</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This tool helps clinicians prepare for allergy clinic appointments — quickly reviewing
                patient histories, recording skin test and drug challenge results, and generating
                professional reports and testing plans.
              </p>
            </div>

            <div className="bg-card rounded-none p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h4 className="mb-0">Data Privacy</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                During normal clinical use, patient data is processed in your browser from local
                REDCap exports. Optional research submission sends only the deidentified research
                payload to the configured Supabase project.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h4 className="mb-0">Key Features</h4>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                "Dashboard showing patient statistics at a glance",
                "Search and filter patients by name, reaction grade, date, and more",
                "Detailed patient history and timeline views",
                "Skin test and drug challenge result recording",
                "Drug reference guide with non-irritating test concentrations and cross-reactivity notes",
                "Three report types: clinical report, patient handout, and Powerchart Letter",
                "Create and print testing plan request forms for nursing staff",
                "Print-optimised layouts for all documents",
                "Import patient records from your clinic database",
                "Export anonymised testing data for research and audit",
                "Adjustable appearance — dark mode and font size options",
                "PIN screen lock to shield patient details on shared workstations",
                "Works offline — use the app without internet access",
                "Research database for contributing to cross-patient studies"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5 select-none">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
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

export default AboutPage;
