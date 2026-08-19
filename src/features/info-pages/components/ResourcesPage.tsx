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
          icon: <Globe className="w-5 h-5 text-primary" />
        },
        {
          title: "ASCIA - Australasian Society of Clinical Immunology and Allergy",
          description: "Drug allergy testing and management guidelines for clinical immunology.",
          url: "https://www.allergy.org.au",
          icon: <BookOpen className="w-5 h-5 text-status-success" />
        },
        {
          title: "NHMRC - National Health & Medical Research Council",
          description: "Australian health and medical research guidelines and evidence-based resources.",
          url: "https://www.nhmrc.gov.au",
          icon: <Globe className="w-5 h-5 text-primary" />
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
          icon: <Database className="w-5 h-5 text-destructive" />
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
          icon: <Globe className="w-5 h-5 text-status-warning" />
        },
        {
          title: "TGA - Therapeutic Goods Administration",
          description: "Australian medicines regulation, adverse event reporting, and therapeutic safety information.",
          url: "https://www.tga.gov.au",
          icon: <BookOpen className="w-5 h-5 text-primary" />
        }
      ]
    }
  ];

  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card className="border-border">
        <CardContent className="space-y-6">
          
          {resources.map((section, idx) => (
            <div key={idx}>
              <h3 className="section-label mb-3">
                {section.category}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-card rounded-none p-4 border border-border hover:border-primary dark:hover:border-primary transition-[border-color,background-color] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-muted/60 rounded-none border border-border shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="group-hover:text-primary dark:group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
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
          <div className="bg-muted/50 rounded-none p-4 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              These links are provided for informational purposes. We are not responsible for the content 
              of external websites. Links were verified at the time of publication but may change.
            </p>
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

export default ResourcesPage;
