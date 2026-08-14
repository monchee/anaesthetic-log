import React from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { AlertTriangle, Phone, Home, Shield } from 'lucide-react';
import { Screen } from '@shared/types';

interface DisclaimerPageProps {
  setScreen: (screen: Screen) => void;
}

const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ setScreen }) => {
  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card className="rounded-none border-border shadow-none">
        <CardContent className="pt-6 space-y-6">

          {/* Medical Disclaimer - Highlighted */}
          <div className="bg-destructive/10 dark:bg-destructive/15 rounded-none p-5 sm:p-6 border-2 border-destructive/30 dark:border-destructive/40">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-destructive mb-3">Medical Disclaimer</h3>
                <div className="text-sm text-foreground/90 space-y-3">
                  <p className="font-medium">
                    This application is intended for use by qualified healthcare professionals ONLY. It is a clinical support tool designed to assist in the assessment and management of patients with suspected or confirmed anaesthetic allergies.
                  </p>
                  <p>
                    The information and recommendations provided by this application are NOT a substitute for professional medical advice, diagnosis, or treatment. All clinical decisions remain the sole responsibility of the treating clinician.
                  </p>
                  <p className="font-medium">
                    Reliance on any information provided by this application is solely at your own risk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Warning */}
          <div className="bg-amber-500/10 dark:bg-amber-500/15 rounded-none p-5 border border-amber-500/30 dark:border-amber-500/40">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Emergency Information</h4>
                <div className="text-sm text-foreground/90 space-y-2">
                  <p>
                    <strong className="text-foreground">This application is NOT suitable for emergency situations.</strong>
                  </p>
                  <p>
                    In the event of a medical emergency, call <strong>000</strong> (Australia) immediately for emergency services.
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    If you or a patient is experiencing a severe allergic reaction (anaphylaxis), follow standard emergency protocols including administering adrenaline (epinephrine) if available and calling for emergency assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Judgment Required */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Clinical Judgment Required</h4>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                This application provides decision support based on established clinical protocols and guidelines. However:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Every patient is unique; individual circumstances may warrant deviation from suggested protocols</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>The application cannot account for all possible clinical scenarios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Users must apply their own clinical expertise and knowledge of the patient</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Recommendations should be verified with current clinical guidelines</span>
                </li>
              </ul>
            </div>
          </div>

          {/* No Warranty */}
          <div className="bg-card rounded-none p-5 border border-border">
            <h4 className="font-semibold text-foreground mb-4">No Warranty</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                This application is provided "as is" and "as available" without warranty of any kind, whether express or implied.
              </p>
              <p>
                While efforts have been made to ensure the accuracy of information, Sydney Local Health District and the Royal Prince Alfred Hospital:
              </p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Make no representation or warranty regarding the completeness, accuracy, reliability, or timeliness of the information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Do not warrant that the application will function uninterrupted or error-free</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Do not warrant that defects will be corrected</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-card rounded-none p-5 border border-border">
            <h4 className="font-semibold text-foreground mb-4">Limitation of Liability</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                To the maximum extent permitted by law, Sydney Local Health District, Royal Prince Alfred Hospital, the Department of Clinical Immunology & Allergy, and their respective officers, employees, and agents:
              </p>
              <ul className="space-y-2 ml-4 mt-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Accept no liability for any loss, injury, or damage resulting from use of this application</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Accept no liability for any clinical decisions made based on application outputs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Accept no liability for any errors or omissions in the information provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1 select-none">•</span>
                  <span>Accept no liability for any inability to use the application</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Professional Use Only */}
          <div className="bg-card rounded-none p-5 border border-border">
            <h4 className="font-semibold text-foreground mb-4">Professional Use Only</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                This application is intended exclusively for use by authorised healthcare professionals within the context of their professional duties. Use by unauthorised individuals or for purposes other than legitimate clinical assessment is strictly prohibited.
              </p>
              <p className="mt-3">
                By using this application, you confirm that you are a qualified healthcare professional authorised to access and use this tool for clinical purposes.
              </p>
            </div>
          </div>

          {/* Guidelines Change */}
          <div className="bg-card rounded-none p-5 border border-border">
            <h4 className="font-semibold text-foreground mb-4">Clinical Guidelines Evolve</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Medical knowledge and clinical guidelines are continuously evolving. This application reflects best practices at the time of development but may not incorporate the most recent guideline changes.
              </p>
              <p>
                Users should verify that recommendations align with current Australasian Society of Clinical Immunology and Allergy (ASCIA) guidelines and other relevant clinical standards.
              </p>
            </div>
          </div>

          {/* Acceptance */}
          <div className="bg-nsw-info-bg/80 dark:bg-nsw-info/10 rounded-none p-5 border border-nsw-info/20 dark:border-nsw-info/30">
            <h4 className="font-semibold text-nsw-info dark:text-nsw-blue mb-3">Use of Application Constitutes Acceptance</h4>
            <div className="text-sm text-foreground/90">
              <p>
                By accessing and using this application, you acknowledge that you have read, understood, and agree to be bound by this disclaimer. If you do not agree with any part of this disclaimer, you must not use this application.
              </p>
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

export default DisclaimerPage;
