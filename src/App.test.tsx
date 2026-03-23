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
    expect(document.querySelector('.min-h-svh')).toBeTruthy();
  });

  it('displays initial screen', () => {
    render(<App />);
    // Should show the password gate screen with the app name
    const headings = screen.getAllByText(/DREAM/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toBeInTheDocument();
  });
});
