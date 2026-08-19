import React from 'react';
import { Card, CardContent, Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui';
import { Home, AlertTriangle, ArrowRight } from 'lucide-react';
import { Screen } from '@shared/types';
import { DRUG_CATEGORIES, CATEGORY_THEMES } from '@shared/utils/constants';

interface DrugReferencePageProps {
  setScreen: (screen: Screen) => void;
}

const DrugReferencePage: React.FC<DrugReferencePageProps> = ({ setScreen }) => {
  const crossReactivityInfo = [
    {
      category: "Muscle Relaxants",
      info: "Quaternary ammonium compounds are thought to be responsible for most reactions. Cross-reactivity between agents is common due to structural similarities.",
      alternatives: "Consider non-depolarising agents with different structures. Cisatracurium may have lower immunogenicity."
    },
    {
      category: "Penicillins",
      info: "Cross-reactivity with cephalosporins depends on side chain similarity. First-generation cephalosporins have higher cross-reactivity (~2%).",
      alternatives: "Cephalosporins with dissimilar side chains, carbapenems (low cross-reactivity), or non-beta-lactams."
    },
    {
      category: "Cephalosporins",
      info: "Cross-reactivity is more related to R1 side chain similarity than the beta-lactam ring. Later generations have different side chains.",
      alternatives: "Cephalosporins with different side chains, carbapenems, aztreonam (minimal cross-reactivity)."
    },
    {
      category: "Local Anaesthetics",
      info: "True allergy is rare (<1%). Most reactions are vasovagal or due to adrenaline. Amide types rarely cross-react with each other.",
      alternatives: "Different amide local anaesthetic, or ester type if amide allergy confirmed."
    },
    {
      category: "Opioids",
      info: "Can cause direct mast cell degranulation (non-IgE mediated). Morphine and codeine are most histamine-releasing.",
      alternatives: "Fentanyl or remifentanil (less histamine release), or non-opioid analgesia."
    },
    {
      category: "Hypnotics",
      info: "Propofol reactions may be to the lipid emulsion or specific to propofol. Egg/soya allergy is not a contraindication.",
      alternatives: "Different induction agent (thiopentone, ketamine, etomidate)."
    }
  ];

  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card className="border-border">
        <CardContent className="space-y-6">

          {/* Clinical Guidance */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-none p-5 sm:p-6 border border-primary/20">
            <div>
              <h3>How to Use This Reference</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                This reference lists the anaesthetic and associated drugs tested in the clinic, organised by pharmacological category.
                For each category, you'll find information on cross-reactivity patterns and suitable alternative drugs. This information
                is intended to support clinical decision-making during allergy testing. Always consider individual patient history,
                reaction severity, and current clinical guidelines (particularly ASCIA recommendations) when planning investigations and
                selecting safe alternatives.
              </p>
            </div>
          </div>

          {/* Drug Categories */}
          <div>
            <h3 className="section-label mb-3">
              Drug Categories
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(DRUG_CATEGORIES).map(([category, drugs]) => {
                const theme = CATEGORY_THEMES[category];
                return (
                  <div 
                    key={category}
                    className="bg-card rounded-none p-4 border border-border"
                  >
                    <h4 className={`mb-2 ${theme?.headerText || ''}`}>
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {drugs.map(drug => (
                        <span 
                          key={drug}
                          className="px-2 py-0.5 text-xs rounded-none bg-muted/60 border border-border text-foreground/90 font-mono"
                        >
                          {drug}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cross-Reactivity & Alternatives */}
          <div>
            <h3 className="section-label mb-3">
              Cross-Reactivity & Alternatives
            </h3>
            <Accordion type="multiple" className="bg-card rounded-none border border-border px-4">
              {crossReactivityInfo.map((item, idx) => (
                <AccordionItem 
                  key={idx}
                  value={`item-${idx}`}
                  className="border-b border-border last:border-0"
                >
                  <AccordionTrigger className="text-foreground font-medium hover:no-underline hover:text-primary transition-colors py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-none">
                    {item.category}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 space-y-3">
                    <div className="flex items-start gap-2 pt-1">
                      <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.info}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        <strong className="text-foreground">Alternatives:</strong> {item.alternatives}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Disclaimer */}
          <div className="bg-status-warning/10 rounded-none p-4 border border-status-warning/30">
            <p className="text-sm text-foreground/90 space-y-2 leading-relaxed">
              <strong className="text-foreground">Important:</strong> This reference is for general guidance only. Always consult current clinical guidelines
              (particularly ASCIA recommendations on drug allergy investigation) and consider individual patient factors when making
              clinical decisions. Interpretation of test results must be performed in context with clinical history and should follow
              established protocols for drug allergy testing.
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

export default DrugReferencePage;
