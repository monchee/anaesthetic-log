// Subtle professional animations for medical application
// Duration: 150-300ms for micro-interactions, 300-500ms for transitions

export const animationConfig = {
  // Screen transitions - gentle fade + slide
  screenTransition: {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1] // Material Design standard
  },

  // Micro-interactions - quick spring
  microInteraction: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1]
  },

  // Form feedback - subtle spring
  formFeedback: {
    duration: 0.2,
    ease: [0.4, 0, 0.6, 1]
  },

  // Content reveal - gentle fade
  contentReveal: {
    duration: 0.3,
    ease: "easeOut"
  }
};

// CSS transition strings for inline styles
export const transitions = {
  screen: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
  micro: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  form: "all 200ms cubic-bezier(0.4, 0, 0.6, 1)",
  content: "all 300ms ease-out"
};
