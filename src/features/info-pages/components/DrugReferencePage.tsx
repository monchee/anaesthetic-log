import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui';
import { Pill, Home, AlertTriangle, ArrowRight } from 'lucide-react';
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
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
              <Pill className="w-6 h-6 text-white dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Drug Reference</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Drug categories, cross-reactivity, and alternatives</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

          {/* Clinical Guidance */}
          <div className="bg-gradient-to-r from-slate-900/5 to-primary/5 dark:from-slate-900/20 dark:to-slate-800/10 rounded-none p-6 border border-slate-900/10 dark:border-primary/30">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">How to Use This Reference</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
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
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">
              Drug Categories
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(DRUG_CATEGORIES).map(([category, drugs]) => {
                const theme = CATEGORY_THEMES[category];
                return (
                  <div 
                    key={category}
                    className="bg-slate-50 dark:bg-slate-900 rounded-none p-4 border border-slate-200 dark:border-slate-800"
                  >
                    <h4 className={`font-semibold mb-2 ${theme?.headerText || 'text-slate-900 dark:text-white'}`}>
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {drugs.map(drug => (
                        <span 
                          key={drug}
                          className="px-2 py-0.5 text-xs rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
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
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">
              Cross-Reactivity & Alternatives
            </h3>
            <Accordion type="multiple" className="bg-slate-50 dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 px-4">
              {crossReactivityInfo.map((item, idx) => (
                <AccordionItem 
                  key={idx}
                  value={`item-${idx}`}
                  className="border-b border-slate-200 dark:border-slate-800 last:border-0"
                >
                  <AccordionTrigger className="text-slate-900 dark:text-white font-medium hover:no-underline">
                      {item.category}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pb-4 space-y-3">
                    <div className="flex items-start gap-2 pt-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.info}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
                        <strong>Alternatives:</strong> {item.alternatives}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-none p-4 border border-amber-200 dark:border-amber-800/40">
            <p className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <strong>Important:</strong> This reference is for general guidance only. Always consult current clinical guidelines
              (particularly ASCIA recommendations on drug allergy investigation) and consider individual patient factors when making
              clinical decisions. Interpretation of test results must be performed in context with clinical history and should follow
              established protocols for drug allergy testing.
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

export default DrugReferencePage;
