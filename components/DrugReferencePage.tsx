import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, AccordionItem } from './ui';
import { Pill, Home, AlertTriangle, ArrowRight } from 'lucide-react';
import { Screen } from '../types';
import { DRUG_CATEGORIES, CATEGORY_THEMES } from '../lib/constants';

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
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-full">
              <Pill className="w-6 h-6 text-primary dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-primary">Drug Reference</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Drug categories, cross-reactivity, and alternatives</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {/* Drug Categories */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-primary uppercase tracking-wide mb-3">
              Drug Categories
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(DRUG_CATEGORIES).map(([category, drugs]) => {
                const theme = CATEGORY_THEMES[category];
                return (
                  <div 
                    key={category}
                    className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800"
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
            <h3 className="text-sm font-semibold text-slate-900 dark:text-primary uppercase tracking-wide mb-3">
              Cross-Reactivity & Alternatives
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              {crossReactivityInfo.map((item, idx) => (
                <AccordionItem 
                  key={idx}
                  title={<span className="text-slate-900 dark:text-white">{item.category}</span>}
                >
                  <div className="px-5 pb-4 space-y-3">
                    <div className="flex items-start gap-2">
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
                  </div>
                </AccordionItem>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800/40">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> This reference is for general guidance only. Always consult current guidelines 
              and consider individual patient factors when making clinical decisions.
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
