/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", "class"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Public Sans',
  				'Inter',
  				'sans-serif'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			status: {
  				grade1: 'hsl(var(--status-grade1))',
  				grade2: 'hsl(var(--status-grade2))',
  				grade3: 'hsl(var(--status-grade3))',
  				grade4: 'hsl(var(--status-grade4))'
  			},
  			'nsw-blue': {
  				DEFAULT: 'hsl(var(--nsw-blue))',
  				light: 'hsl(var(--nsw-blue-light))'
  			},
  			'nsw-info': {
  				DEFAULT: 'hsl(var(--nsw-info))',
  				bg: 'hsl(var(--nsw-info-bg))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0', opacity: '0' },
  				to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
  				to: { height: '0', opacity: '0' }
  			},
  			'content-enter': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'content-enter-subtle': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(2px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-1000px 0'
  				},
  				'100%': {
  					backgroundPosition: '1000px 0'
  				}
  			},
  			'screen-enter': {
  				'0%': { opacity: '0', transform: 'translateY(8px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'row-enter': {
  				'0%': { opacity: '0', transform: 'translateY(4px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'section-reveal': {
  				'0%': { opacity: '0', transform: 'translateY(6px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'gate-exit': {
  				'0%': { opacity: '1', transform: 'scale(1)' },
  				'100%': { opacity: '0', transform: 'scale(0.97)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'content-enter': 'content-enter 0.2s ease-out forwards',
  			'content-enter-subtle': 'content-enter-subtle 0.15s ease-out forwards',
  			shimmer: 'shimmer 2s linear infinite',
  			'screen-enter': 'screen-enter 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'row-enter': 'row-enter 0.2s cubic-bezier(0.4, 0, 0.2, 1) both',
  			'section-reveal': 'section-reveal 0.25s cubic-bezier(0.4, 0, 0.2, 1) both',
  			'gate-exit': 'gate-exit 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  		},
  		borderRadius: {
  			lg: '0',
  			md: '0',
  			sm: '0',
  			xl: '0',
  			'2xl': '0',
  			'3xl': '0'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
