import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { Cpu, Lock, Smartphone, Home, Database, Globe, Code } from 'lucide-react';
import { Screen } from '../types';

interface TechnicalDocumentationPageProps {
  setScreen: (screen: Screen) => void;
}

const TechnicalDocumentationPage: React.FC<TechnicalDocumentationPageProps> = ({ setScreen }) => {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e6e1fd] dark:bg-purple-900/40 rounded-full">
              <Code className="w-6 h-6 text-[#8055f1] dark:text-purple-300" />
            </div>
            <div>
              <CardTitle className="text-xl text-[#441170] dark:text-purple-300">Technical Documentation</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Architecture, security, and technical specifications
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

          {/* Introduction */}
          <div className="bg-gradient-to-r from-[#441170]/5 to-purple-500/5 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg p-6 border border-[#441170]/10 dark:border-purple-700/30">
            <div className="flex items-start gap-4">
              <Cpu className="w-8 h-8 text-[#441170] dark:text-purple-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">Technical Overview</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  The RPAH Anaesthetic Allergy Clinic application is a Progressive Web App (PWA) built with modern web technologies. It is designed for local-first data processing, ensuring patient data never leaves the user's device during normal operation.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-[#8055f1]" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Technology Stack</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-800 dark:text-slate-200">Frontend Framework</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">React 19 with TypeScript</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-800 dark:text-slate-200">Build Tool</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vite</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-800 dark:text-slate-200">Styling</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tailwind CSS + shadcn/ui</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-800 dark:text-slate-200">Testing</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vitest + Playwright</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-800 dark:text-slate-200">Deployment</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cloudflare Pages</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-800 dark:text-slate-200">Application Type</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Progressive Web App (PWA)</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-[#8055f1]" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Security Architecture</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>The application follows a privacy-by-design approach with the following security features:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span><strong>Local-Only Processing:</strong> All patient data is processed in the browser; no backend servers receive patient information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span><strong>No Data Transmission:</strong> Patient data is never transmitted over the network during normal use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span><strong>HTTPS Only:</strong> The application is served exclusively over HTTPS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span><strong>Client-Side Validation:</strong> Input validation occurs before any data processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span><strong>Content Security Policy:</strong> Strict CSP headers prevent XSS attacks</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Flow */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-[#8055f1]" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Data Flow</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>The application follows this data workflow:</p>
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Clinician exports patient data from REDCap (CSV format)</li>
                <li>Data file is uploaded to the application (local browser processing only)</li>
                <li>Data is parsed and displayed within the application</li>
                <li>Clinician interacts with data (viewing, testing, report generation)</li>
                <li>Reports are generated locally and can be printed or saved as PDF</li>
                <li><strong>No data leaves the browser at any point</strong></li>
              </ol>
            </div>
          </div>

          {/* Offline Functionality */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-[#8055f1]" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Offline Functionality (PWA)</h4>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>As a Progressive Web App, the application supports offline usage:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span>Installable on desktop and mobile devices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span>Service worker caching for offline access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span>Responsive design for all screen sizes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span>Print-optimised layouts for clinical documentation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Browser Compatibility */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-[#8055f1]" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Browser Compatibility</h4>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>The application supports modern browsers with JavaScript enabled:</p>
              <ul className="grid grid-cols-2 gap-2 mt-3 ml-4">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Chrome/Edge (latest)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Firefox (latest)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Safari (latest)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Mobile browsers
                </li>
              </ul>
            </div>
          </div>

          {/* Accessibility */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Accessibility Features</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>The application includes accessibility features to support diverse user needs:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span>Dark/light theme toggle</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span>Adjustable font size (3 levels)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span>Semantic HTML structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span>Keyboard navigation support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8055f1] mt-1">•</span>
                  <span>Print-optimised views</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Version History */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Version History</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span>Current Version</span>
                <span className="font-mono">v0.12.0</span>
              </div>
              <p className="text-xs mt-2">
                For detailed changelog information, see the <button onClick={() => setScreen(Screen.CHANGELOG)} className="text-[#8055f1] hover:underline">Changelog page</button>.
              </p>
            </div>
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

export default TechnicalDocumentationPage;
