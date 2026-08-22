import React from 'react';
import { Screen, Patient } from '@shared/types';
import { Database } from 'lucide-react';
import { FOOTER_LEGAL_ITEMS, pathFromScreen } from '@core/navigation/navigationConfig';
import { shouldHandleNavigation } from '@core/navigation/shouldHandleNavigation';

const APP_VERSION = __APP_VERSION__;

export interface FooterProps {
  setScreen?: (screen: Screen) => void;
  onNavigate?: (screen: Screen) => void;
  hrefFor?: (screen: Screen) => string;
  currentScreen?: Screen;
  databaseDate: string;
  onUploadPatients?: (patients: Patient[]) => void;
  isCustomData?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  setScreen,
  onNavigate,
  hrefFor = pathFromScreen,
  currentScreen,
  databaseDate,
  isCustomData = false,
}) => {
  const navigate = onNavigate || setScreen;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, screen: Screen) => {
    if (navigate && shouldHandleNavigation(e)) {
      e.preventDefault();
      navigate(screen);
    }
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Application footer"
      className="border-t border-border bg-muted/50 dark:bg-card/40 no-print mt-auto"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6 py-4">
        <div className="flex flex-col gap-3">
          {/* Legal / Governance Links */}
          <nav aria-label="Footer legal and governance navigation" className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-1 text-xs">
            {FOOTER_LEGAL_ITEMS.map((link) => {
              const isActive = currentScreen === link.screen;
              const href = hrefFor(link.screen);
              return (
                <a
                  key={link.screen}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => handleLinkClick(e, link.screen)}
                  className={`min-h-[44px] sm:min-h-[auto] px-2 inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
            <div className="text-center sm:text-left">
              <span className="font-semibold text-primary whitespace-nowrap">RPAH Anaesthetic Allergy Clinic</span>
              {' '}
              <span className="text-muted-foreground mx-1.5" aria-hidden="true">·</span>
              {' '}
              <span className="text-muted-foreground whitespace-nowrap">Safe sleep, clear answers</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted dark:bg-card px-3 py-1.5 rounded-none border border-border">
                <Database className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Dataset: <span className="font-mono">{isCustomData ? databaseDate : 'Demo'}</span>
                </span>
              </div>

              <a
                href={hrefFor(Screen.CHANGELOG)}
                aria-current={currentScreen === Screen.CHANGELOG ? 'page' : undefined}
                onClick={(e) => handleLinkClick(e, Screen.CHANGELOG)}
                className="hover:text-primary transition-colors font-semibold min-h-[44px] sm:min-h-[auto] inline-flex items-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                aria-label={`Application version ${APP_VERSION}, view changelog`}
              >
                v{APP_VERSION}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
