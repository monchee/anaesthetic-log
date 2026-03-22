import React from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { Home, ExternalLink, Database, BookOpen, Globe } from 'lucide-react';
import { Screen } from '@shared/types';

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
          description: "Drug allergy testing and management guidelines for clinical immunology.",
          url: "https://www.allergy.org.au",
          icon: <BookOpen className="w-5 h-5 text-green-500" />
        },
        {
          title: "NHMRC - National Health & Medical Research Council",
          description: "Australian health and medical research guidelines and evidence-based resources.",
          url: "https://www.nhmrc.gov.au",
          icon: <Globe className="w-5 h-5 text-muted-foreground" />
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
      category: "Guidelines & Standards",
      items: [
        {
          title: "ANZCA - Australian and New Zealand College of Anaesthetists",
          description: "Professional standards and guidelines for anaesthetic practice and perioperative safety.",
          url: "https://www.anzca.edu.au",
          icon: <BookOpen className="w-5 h-5 text-primary" />
        },
        {
          title: "NAP6 - 6th National Audit Project",
          description: "UK national audit on perioperative anaphylaxis - comprehensive guidelines and recommendations.",
          url: "https://www.nationalauditprojects.org.uk/NAP6home",
          icon: <Globe className="w-5 h-5 text-amber-500" />
        },
        {
          title: "TGA - Therapeutic Goods Administration",
          description: "Australian medicines regulation, adverse event reporting, and therapeutic safety information.",
          url: "https://www.tga.gov.au",
          icon: <BookOpen className="w-5 h-5 text-red-500" />
        }
      ]
    }
  ];

  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          
          {resources.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground uppercase tracking-wide mb-3">
                {section.category}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-slate-50 dark:bg-card rounded-none p-4 border border-slate-200 dark:border-border hover:border-primary dark:hover:border-primary transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white dark:bg-card rounded-none border border-slate-200 dark:border-border shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary dark:group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-muted-foreground mt-1">
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
          <div className="bg-slate-100 dark:bg-card rounded-none p-4 border border-slate-200 dark:border-border">
            <p className="text-xs text-slate-500 dark:text-muted-foreground">
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
          className="bg-slate-900 dark:bg-primary hover:bg-primary text-white px-8"
        >
          <Home className="w-5 h-5 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default ResourcesPage;
