import React from 'react';
import { Card, CardContent, Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui';
import { Home } from 'lucide-react';
import { Screen } from '@shared/types';

interface FAQPageProps {
  setScreen: (screen: Screen) => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ setScreen }) => {
  const faqs = [
    {
      category: "Getting Started",
      items: [
        {
          question: "How do I upload patient data?",
          answer: "Click the 'Update DB' button on the dashboard, then follow the instructions to export your data from REDCap in CSV format. Select the exported file to import your patient records."
        },
        {
          question: "What format should the CSV file be in?",
          answer: "Export from REDCap using the 'CSV / Microsoft Excel (labels)' format. This ensures all field labels and values are readable by the application."
        },
        {
          question: "Is my patient data secure?",
          answer: "Yes. All data is processed locally in your browser. Nothing is sent to external servers. Your data remains on your computer."
        }
      ]
    },
    {
      category: "Using the Dashboard",
      items: [
        {
          question: "How do I search for a patient?",
          answer: "Use the search box at the top of the dashboard to find patients by name, MRN, or suspected agent. You can also use the Filters button for advanced filtering."
        },
        {
          question: "What do the reaction grades mean?",
          answer: "Reaction grades follow the Ring & Messmer classification: Grade I (cutaneous), Grade II (cardiovascular/respiratory), Grade III (cardiovascular collapse), Grade IV (cardiac arrest)."
        },
        {
          question: "How do I filter by multiple criteria?",
          answer: "Click the 'Filters' button to expand advanced options. You can filter by reaction grade, date range, hospital, procedure outcome, and suspected agents simultaneously."
        }
      ]
    },
    {
      category: "Patient Records",
      items: [
        {
          question: "How do I view a patient's full history?",
          answer: "Click on any patient row in the dashboard table to view their complete clinical history, timeline, and test results."
        },
        {
          question: "Can I edit patient records?",
          answer: "Patient records are imported from REDCap and are read-only in this application. To make changes, update the record in REDCap and re-import the data."
        },
        {
          question: "How do I record test results?",
          answer: "Navigate to a patient's record and use the testing forms to record skin prick test results, intradermal test results, and drug challenge outcomes."
        }
      ]
    },
    {
      category: "Clinical Reports",
      items: [
        {
          question: "How do I generate a clinical report?",
          answer: "Click on a patient record to view their details. Once you've entered or reviewed their test results, click 'Generate Clinical Report' to create a formal report with all testing outcomes."
        },
        {
          question: "What report formats are available?",
          answer: "The application generates three report types: Clinical Report (detailed test results), Patient Handout (patient-friendly summary), and Powerchart Letter (narrative for medical records). Each can be printed or saved as PDF."
        },
        {
          question: "Can I print reports directly?",
          answer: "Yes. Each report has a 'Print' button that opens a printer-friendly layout. You can then print to paper or save as a PDF file from your browser."
        },
        {
          question: "How do I create a testing plan request?",
          answer: "Navigate to a patient's record and select 'Create Testing Plan Request'. Select the drugs you want to test, note any urgent indicators, list documents to chase, and add clinical notes. This generates a printable request form."
        },
        {
          question: "Can I export or email reports?",
          answer: "You can copy reports as plain text to your clipboard, and testing plans can be emailed to the allergy nursing team. All exports maintain proper formatting for clinical use."
        }
      ]
    },
    {
      category: "Test Interpretation",
      items: [
        {
          question: "What do positive and negative test results mean?",
          answer: "A positive result indicates the patient reacted to that drug (either skin test, intradermal test, or challenge reaction). Negative means no reaction occurred. Test interpretation should be done in context with clinical history."
        },
        {
          question: "How do I interpret skin prick test results?",
          answer: "Skin prick tests measure local reactions. A positive result (wheal and flare) suggests possible IgE-mediated allergy to that drug. Results must be interpreted alongside clinical history and other test results."
        },
        {
          question: "What's the difference between intradermal testing and skin prick testing?",
          answer: "Skin prick testing is less sensitive but safer for initial screening. Intradermal testing is more sensitive but carries higher risk. Intradermal is typically used after negative skin prick tests to investigate delayed or non-IgE-mediated reactions."
        },
        {
          question: "When is a drug challenge test used?",
          answer: "Drug challenge tests are used when skin and intradermal tests are negative, but clinical suspicion remains high. The patient is given graded doses of the suspected drug under controlled medical supervision and monitored for reactions."
        },
        {
          question: "Can I document the clinical reasoning for my test choices?",
          answer: "Yes. Each testing plan includes a 'Clinical Notes' field where you can document your clinical reasoning, relevant history, and why specific drugs are being tested."
        }
      ]
    },
    {
      category: "Troubleshooting",
      items: [
        {
          question: "My CSV file won't upload - what should I do?",
          answer: "Ensure the file is in the correct format (CSV with labels from REDCap). Check that the file is not open in another program. Try re-exporting from REDCap."
        },
        {
          question: "The application is running slowly",
          answer: "Large datasets may take a moment to process. Try refreshing the page. If the issue persists, clear your browser cache and reload."
        },
        {
          question: "I can't find a patient I know exists",
          answer: "Check your search terms and active filters. Try clearing all filters using the 'Clear All' button. Verify the patient record exists in your REDCap export."
        }
      ]
    }
  ];

  return (
    <div className="py-4 sm:p-6 space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {faqs.map((category, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">
                {category.category}
              </h3>
              <Accordion type="multiple" className="bg-slate-50 dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 px-4">
                {category.items.map((item, itemIdx) => (
                  <AccordionItem 
                    key={itemIdx}
                    value={`item-${itemIdx}`}
                    className="border-b border-slate-200 dark:border-slate-800 last:border-0"
                  >
                    <AccordionTrigger className="text-slate-900 dark:text-white font-medium hover:no-underline">
                        {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
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

export default FAQPage;
