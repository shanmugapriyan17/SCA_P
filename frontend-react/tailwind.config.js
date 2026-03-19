/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                /* ── Soft UI Palette ── */
                "primary": "#cb0c9f",   /* Soft UI pink accent */
                "primary-dark": "#a0097d",
                "primary-hover": "#8e0870",
                "primary-light": "#fce4ec",
                "primary-glow": "#f48fb1",

                "dark": "#344767",   /* Soft UI primary text dark */
                "dark-secondary": "#67748e",   /* Soft UI muted text */
                "dark-body": "#7b809a",

                "info": "#17c1e8",   /* Soft UI info cyan */
                "info-dark": "#0da5c0",
                "success": "#82d616",   /* Soft UI success green */
                "success-dark": "#66a80f",
                "warning": "#fbcf33",   /* Soft UI warning yellow */
                "warning-dark": "#e6b800",
                "danger": "#ea0606",   /* Soft UI danger red */

                "off-white": "#f8f9fa",   /* Soft UI page background */
                "slate-base": "#f0f2f5",
                "surface": "#ffffff",
                "surface-highlight": "#f8f9fa",

                "text-main": "#344767",
                "text-muted": "#67748e",
                "text-sub": "#7b809a",

                "secondary-accent": "#e9ecef",
                "background-light": "#f0f2f5",
            },
            fontFamily: {
                "display": ["Inter", "Helvetica", "Arial", "sans-serif"],
                "body": ["Inter", "Helvetica", "Arial", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "0.75rem",
                "xl": "1rem",
                "2xl": "1.25rem",
                "3xl": "1.5rem",
                "pill": "1.875rem",
                "full": "9999px",
            },
            boxShadow: {
                /* ── Soft UI neumorphic shadows ── */
                'soft-xxs': '0 1px 5px 1px rgba(0,0,0,.03)',
                'soft-xs': '0 3px 5px -1px rgba(0,0,0,.09), 0 2px 3px -1px rgba(0,0,0,.07)',
                'soft-sm': '0 .25rem .375rem -.0625rem rgba(20,20,20,.12), 0 .125rem .25rem -.0625rem rgba(20,20,20,.07)',
                'soft-md': '0 4px 7px -1px rgba(0,0,0,.11), 0 2px 4px -1px rgba(0,0,0,.07)',
                'soft-lg': '0 8px 26px -4px rgba(20,20,20,.15), 0 8px 9px -5px rgba(20,20,20,.06)',
                'soft-xl': '0 23px 45px -11px rgba(20,20,20,.25)',
                'soft-dark': '0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12)',

                /* keep old tokens for compatibility */
                'soft': '0 4px 6px -1px rgba(0,0,0,.05), 0 2px 4px -1px rgba(0,0,0,.03)',
                'card': '0 4px 7px -1px rgba(0,0,0,.11), 0 2px 4px -1px rgba(0,0,0,.07)',
                'glow': '0 0 20px -5px rgba(203,12,159,.15)',
                'float': '0 20px 25px -5px rgba(0,0,0,.05), 0 10px 10px -5px rgba(0,0,0,.01)',
            },
            keyframes: {
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                breathe: {
                    '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 15px rgba(203,12,159,.3)' },
                    '50%': { transform: 'scale(1.1)', boxShadow: '0 0 25px rgba(203,12,159,.5)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                softPulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '.6' },
                },
            },
            animation: {
                scroll: 'scroll 30s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
                'orb-breathe': 'breathe 4s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'soft-pulse': 'softPulse 2s ease-in-out infinite',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(310deg, #7928ca 0%, #ff0080 100%)',
                'gradient-dark': 'linear-gradient(310deg, #141727 0%, #3a416f 100%)',
                'gradient-info': 'linear-gradient(310deg, #2152ff 0%, #21d4fd 100%)',
                'gradient-success': 'linear-gradient(310deg, #17ad37 0%, #98ec2d 100%)',
                'gradient-warning': 'linear-gradient(310deg, #f53939 0%, #fbcf33 100%)',
                'gradient-danger': 'linear-gradient(310deg, #ea0606 0%, #ff667c 100%)',
            },
        },
    },
    plugins: [],
}
