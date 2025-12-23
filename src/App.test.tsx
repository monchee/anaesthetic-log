import { describe, it, expect } from 'vitest';
import { render, screen } from './test/helpers';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it('renders with theme provider', () => {
    render(<App />);
    // App should render the main layout
    expect(document.querySelector('.min-h-screen')).toBeTruthy();
  });

  it('displays initial screen', () => {
    render(<App />);
    // Should show the patient selection screen by default - there are multiple instances of this text
    const headings = screen.getAllByText(/Anaesthetic Allergy Clinic/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toBeInTheDocument();
  });
});
