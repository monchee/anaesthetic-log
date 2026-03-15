import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui';
import { HelpCircle, Home } from 'lucide-react';
import { Screen } from '../types';

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
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary dark:bg-slate-900/40 rounded-none">
              <HelpCircle className="w-6 h-6 text-primary dark:text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Frequently Asked Questions</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Common questions about using the application</p>
            </div>
          </div>
        </CardHeader>
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
