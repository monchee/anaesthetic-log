import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';
import { Link2, Home, ExternalLink, Database, BookOpen, Globe } from 'lucide-react';
import { Screen } from '../types';

interface ResourcesPageProps {
  setScreen: (screen: Screen) => void;
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({ setScreen }) => {
  const resources = [
    {
      category: "Clinical Resources",
      items: [
        {
          title: "ANZAAG - Australian & New Zealand Anaesthetic Allergy Group",
          description: "Guidelines, resources, and educational materials for anaesthetic allergy investigation.",
          url: "https://www.anzaag.com",
          icon: <Globe className="w-5 h-5 text-blue-500" />
        },
        {
          title: "ASCIA - Australasian Society of Clinical Immunology and Allergy",
          description: "Information on drug allergy and clinical immunology resources.",
          url: "https://www.allergy.org.au",
          icon: <BookOpen className="w-5 h-5 text-green-500" />
        }
      ]
    },
    {
      category: "Data Management",
      items: [
        {
          title: "REDCap",
          description: "Access the REDCap database to view and manage patient records directly.",
          url: "https://redcap.slhd.nsw.gov.au",
          icon: <Database className="w-5 h-5 text-red-500" />
        }
      ]
    },
    {
      category: "Guidelines",
      items: [
        {
          title: "ANZCA - Australian and New Zealand College of Anaesthetists",
          description: "Professional standards and guidelines for anaesthetic practice.",
          url: "https://www.anzca.edu.au",
          icon: <BookOpen className="w-5 h-5 text-primary" />
        },
        {
          title: "NAP6 - 6th National Audit Project",
          description: "UK national audit on perioperative anaphylaxis - comprehensive guidelines and data.",
          url: "https://www.nationalauditprojects.org.uk/NAP6home",
          icon: <Globe className="w-5 h-5 text-amber-500" />
        }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
              <Link2 className="w-6 h-6 text-primary dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Resources & Links</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Useful external resources and guidelines</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {resources.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">
                {section.category}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-slate-50 dark:bg-slate-900 rounded-none p-4 border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary dark:group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Disclaimer */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-none p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              These links are provided for informational purposes. We are not responsible for the content 
              of external websites. Links were verified at the time of publication but may change.
            </p>
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

export default ResourcesPage;
