import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
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
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				danger: {
					DEFAULT: 'hsl(var(--danger))',
					foreground: 'hsl(var(--danger-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				flame: {
					core: 'hsl(var(--flame-core))',
					hot: 'hsl(var(--flame-hot))',
					warm: 'hsl(var(--flame-warm))',
					ember: 'hsl(var(--flame-ember))',
					spark: 'hsl(var(--flame-spark))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'glow': {
					'0%': { 
						filter: 'drop-shadow(0 0 6px hsl(var(--flame-core) / 0.6)) drop-shadow(0 0 14px hsl(var(--flame-hot) / 0.3))'
					},
					'100%': { 
						filter: 'drop-shadow(0 0 12px hsl(var(--flame-core) / 0.9)) drop-shadow(0 0 26px hsl(var(--flame-hot) / 0.5))'
					}
				},
				'ember-rise': {
					'0%': { 
						transform: 'translate3d(var(--x, 0px), 0, 0) scale(var(--s, 1))', 
						opacity: '0' 
					},
					'10%': { opacity: '0.95' },
					'100%': { 
						transform: 'translate3d(var(--xEnd, 0px), -110%, 0) scale(var(--s, 1))', 
						opacity: '0' 
					}
				},
				'pulse-flame': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(var(--flame-core) / 0.6), 0 0 40px hsl(var(--flame-hot) / 0.4)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 30px hsl(var(--flame-core) / 0.8), 0 0 60px hsl(var(--flame-hot) / 0.6)',
						transform: 'scale(1.02)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow': 'glow 0.9s ease-in-out infinite alternate',
				'ember-rise': 'ember-rise 3s linear forwards',
				'pulse-flame': 'pulse-flame 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
