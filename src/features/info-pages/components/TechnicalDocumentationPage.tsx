import React from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { Lock, Smartphone, Home, Database, Globe, Code, Cpu } from 'lucide-react';
import { Screen } from '@shared/types';

interface TechnicalDocumentationPageProps {
  setScreen: (screen: Screen) => void;
}

const TechnicalDocumentationPage: React.FC<TechnicalDocumentationPageProps> = ({ setScreen }) => {
  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">

          {/* Introduction */}
          <div className="bg-gradient-to-r from-slate-900/5 to-primary/5 dark:from-slate-900/20 dark:to-slate-800/10 rounded-none p-6 border border-slate-900/10 dark:border-primary/30">
            <div className="flex items-start gap-4">
              <Cpu className="w-8 h-8 text-slate-900 dark:text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Technical Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The DREAM App is a Progressive Web App (PWA) built with modern web technologies. It is designed for local-first data processing, so patient data remains on the user's device during normal operation.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Technology Stack</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="bg-card p-3 rounded border border-border">
                <p className="font-medium text-foreground/90">Frontend Framework</p>
                <p className="text-xs text-muted-foreground">React 19 with TypeScript</p>
              </div>
              <div className="bg-card p-3 rounded border border-border">
                <p className="font-medium text-foreground/90">Build Tool</p>
                <p className="text-xs text-muted-foreground">Vite</p>
              </div>
              <div className="bg-card p-3 rounded border border-border">
                <p className="font-medium text-foreground/90">Styling</p>
                <p className="text-xs text-muted-foreground">Tailwind CSS + shadcn/ui</p>
              </div>
              <div className="bg-card p-3 rounded border border-border">
                <p className="font-medium text-foreground/90">Testing</p>
                <p className="text-xs text-muted-foreground">Vitest + Playwright</p>
              </div>
              <div className="bg-card p-3 rounded border border-border">
                <p className="font-medium text-foreground/90">Deployment</p>
                <p className="text-xs text-muted-foreground">Cloudflare Pages</p>
              </div>
              <div className="bg-card p-3 rounded border border-border">
                <p className="font-medium text-foreground/90">Application Type</p>
                <p className="text-xs text-muted-foreground">Progressive Web App (PWA)</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Security Architecture</h4>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>The application follows a privacy-by-design approach with the following security features:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Local-First Processing:</strong> During normal use, patient data is processed in the browser without backend server transmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Research Submission Exception:</strong> If a clinician chooses to save to the research database, only the deidentified research payload is sent to the configured Supabase project</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>HTTPS Only:</strong> The application is served exclusively over HTTPS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Client-Side Validation:</strong> Input validation occurs before any data processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Content Security Policy:</strong> Strict CSP headers prevent XSS attacks</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Flow */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Data Flow</h4>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>The application follows this data workflow:</p>
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Clinician exports patient data from REDCap (CSV format)</li>
                <li>Data file is uploaded to the application (local browser processing only)</li>
                <li>Data is parsed and displayed within the application</li>
                <li>Clinician interacts with data (viewing, testing, report generation)</li>
                <li>Reports are generated locally and can be printed or saved as PDF</li>
                <li><strong>No identifiable patient data leaves the browser during normal local-only use</strong></li>
                <li>Optional research database submission sends only the deidentified research payload to the configured Supabase project</li>
              </ol>
            </div>
          </div>

          {/* Offline Functionality */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Offline Functionality (PWA)</h4>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>As a Progressive Web App, the application supports offline usage:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Installable on desktop and mobile devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Service worker caching for offline access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Responsive design for all screen sizes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Print-optimised layouts for clinical documentation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Browser Compatibility */}
          <div className="bg-card rounded-none p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Browser Compatibility</h4>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>The application supports modern browsers with JavaScript enabled:</p>
              <ul className="grid grid-cols-2 gap-2 mt-3 ml-4">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-none"></span>
                  Chrome/Edge (latest)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-none"></span>
                  Firefox (latest)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-none"></span>
                  Safari (latest)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-none"></span>
                  Mobile browsers
                </li>
              </ul>
            </div>
          </div>

          {/* Accessibility */}
          <div className="bg-card rounded-none p-5 border border-border">
            <h4 className="font-semibold text-foreground mb-4">Accessibility Features</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>The application includes accessibility features to support diverse user needs:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Dark/light theme toggle</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Adjustable font size (3 levels)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Semantic HTML structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Keyboard navigation support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Print-optimised views</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Version History */}
          <div className="bg-card rounded-none p-5 border border-border">
            <h4 className="font-semibold text-foreground mb-4">Version History</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between py-2 border-b border-border">
                <span>Current Version</span>
                <span className="font-mono">v0.34.0 (Suxamethonium)</span>
              </div>
              <p className="text-xs mt-2">
                For detailed changelog information, see the <button onClick={() => setScreen(Screen.CHANGELOG)} className="text-primary hover:underline">Changelog page</button>.
              </p>
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

export default TechnicalDocumentationPage;
