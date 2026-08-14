import React from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { Home, MessageSquare, Bug, Lightbulb, Building2 } from 'lucide-react';
import { Screen } from '@shared/types';

interface ContactPageProps {
  setScreen: (screen: Screen) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ setScreen }) => {
  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card className="rounded-none border-border shadow-none">
        <CardContent className="pt-6 space-y-6">
          
          {/* Clinic Contact */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-none p-5 sm:p-6 border border-primary/20">
            <div className="flex items-start gap-4">
              <Building2 className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-3">The DREAM App</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Department of Clinical Immunology & Allergy</p>
                    <p>Royal Prince Alfred Hospital</p>
                    <p>Missenden Road, Camperdown NSW 2050</p>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p><strong className="text-foreground">Phone:</strong> (02) 9515 7586</p>
                    <p><strong className="text-foreground">Email:</strong>{' '}
                      <a
                        href="mailto:SLHD-RPA-ClinicalImmunology@health.nsw.gov.au"
                        className="text-primary hover:text-primary/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-none transition-colors"
                      >
                        SLHD-RPA-ClinicalImmunology@health.nsw.gov.au
                      </a>
                    </p>
                    <p><strong className="text-foreground">Clinic Location:</strong> Level 5, Gloucester House</p>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs italic text-muted-foreground">Standard business hours: Monday to Friday, 9:00 AM – 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Options */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card rounded-none p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">General Enquiries</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                For questions about using the application or general support.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact your clinic administrator or IT support.
              </p>
            </div>

            <div className="bg-card rounded-none p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="w-5 h-5 text-destructive" />
                <h4 className="font-semibold text-foreground">Report an Issue</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Found a bug or something not working correctly?
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Standard issues:</strong> Report to your clinic administrator with steps to reproduce.
                </p>
                <p>
                  <strong className="text-foreground">Urgent/Critical issues:</strong> Contact the allergy nursing team directly at{' '}
                  <a
                    href="mailto:SLHD-RPA-allergynurses@health.nsw.gov.au"
                    className="font-semibold text-primary hover:text-primary/80 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-none transition-colors"
                  >
                    SLHD-RPA-allergynurses@health.nsw.gov.au
                  </a>{' '}
                  if the issue impacts patient care.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-none p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-status-warning" />
                <h4 className="font-semibold text-foreground">Feature Requests</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Have an idea to improve the application?
              </p>
              <p className="text-sm text-muted-foreground">
                We welcome feedback! Share your suggestions with the development team.
              </p>
            </div>
          </div>

          {/* Tips for Reporting Issues */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-none p-5 border border-primary/20">
            <h4 className="font-semibold text-primary mb-3">Tips for Reporting Issues</h4>
            <ul className="space-y-2 text-sm text-foreground/90">
              {[
                "Describe what you were trying to do when the issue occurred",
                "Note any error messages that appeared",
                "Include the browser you are using (Chrome, Safari, Edge, etc.)",
                "Specify whether the issue is reproducible or occurred only once"
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 select-none">•</span>
                  <span>{tip}</span>
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

export default ContactPage;
