/** @type {import('tailwindcss').Config} */

// Design tokens for the editorial redesign.
//
// Palette: ink on paper with a single sage accent. Neutrals are tinted a
// few thousandths toward the accent hue so the greys sit on the same family
// as the accent instead of reading as flat browser grey.
//
// Every text colour below has been contrast-checked against `paper`:
//   ink        15.4:1   headings, primary text
//   ink-body    9.1:1   body copy
//   ink-muted   5.4:1   metadata, captions (passes 4.5:1)
//   accent      6.3:1   links, active states
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				paper: {
					DEFAULT: "#FBF9F7",
					// Legible on the ink band, 5.9:1.
					muted: "#A39B96",
				},
				surface: {
					DEFAULT: "#F4F1ED",
					// A third step so sections can layer instead of every
					// panel sitting on the same single tone.
					deep: "#EBE5DD",
				},
				rule: {
					DEFAULT: "#E4DED8",
					// Hairlines that read on the dark band.
					dark: "#3D3836",
				},
				ink: {
					DEFAULT: "#232020",
					deep: "#1A1817",
					body: "#453F3C",
					muted: "#6E6662",
				},
				// One accent carries interaction across the whole site: a muted
				// sage, not a bright green. Contrast on paper is 6.3:1 for the
				// default and 9.0:1 for the hover, so it is safe down to the
				// small mono labels. `light` is for the dark ink band, 7.5:1
				// on ink, and `deep` is the hero panel, 9.4:1 behind paper.
				accent: {
					DEFAULT: "#4F6152",
					hover: "#3A4A3E",
					wash: "#E7EBE4",
					light: "#A3B5A5",
					deep: "#2F4739",
				},

				// The About page's accent, and only that page's. It is a muted
				// burgundy drawn from Korea University, used there the way a
				// magazine gives a feature its own section colour: About runs
				// on crimson end to end, every other route stays on sage, and
				// the two never appear as rival accents in one view. 8.7:1 on
				// paper, so it is safe down to the small mono labels.
				crimson: {
					DEFAULT: "#7A2F3A",
					hover: "#5E232C",
					line: "#D8C2C6",
				},

				// Project category coding only, never interaction. `sea` was a
				// teal, which sat too close to the sage accent to read as a
				// separate signal, so it moved to a definite blue. Both are
				// contrast checked on paper: 8.7:1 and 4.8:1.
				sea: "#2B4A6F",
				ochre: "#8A6A2F",
			},

			boxShadow: {
				// Two steps, both tinted with the ink hue rather than neutral
				// black. Anything carrying these drops its border: a hairline
				// and a soft shadow together are the "ghost card" look.
				plate: "0 1px 2px rgba(35, 32, 32, 0.05), 0 10px 24px -14px rgba(35, 32, 32, 0.30)",
				lift: "0 2px 4px rgba(35, 32, 32, 0.06), 0 18px 36px -16px rgba(35, 32, 32, 0.40)",
				// The masthead once it has left the top of the page. Shallow and
				// wide, so it separates the bar from what scrolls under it
				// without looking like a raised card.
				nav: "0 1px 2px rgba(35, 32, 32, 0.04), 0 8px 20px -12px rgba(35, 32, 32, 0.24)",
				// The stack window. Three stacked layers rather than one blur:
				// a tight contact shadow, a mid falloff and a wide ambient one
				// is what makes a floating window read as lifted instead of
				// smudged. The inset ring gives it a crisp edge against the
				// page, which a light panel on a light ground needs; it is a
				// shadow rather than a border so the pair is not the "ghost
				// card" combination.
				window:
					"inset 0 0 0 1px rgba(35, 32, 32, 0.09), 0 1px 2px rgba(35, 32, 32, 0.06), 0 12px 24px -10px rgba(35, 32, 32, 0.16), 0 40px 70px -30px rgba(35, 32, 32, 0.30)",
			},

			fontFamily: {
				// Newsreader for display, Plex Sans for text, Plex Mono for data.
				// Fallbacks are same-genre so a slow font load does not reflow badly.
				display: ['Newsreader', 'Georgia', 'Times New Roman', 'serif'],
				sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
				mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
			},

			fontSize: {
				// Editorial scale, ratio ~1.25 with a wider jump into display sizes.
				'meta': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
				'sm': ['0.875rem', { lineHeight: '1.55' }],
				'base': ['1rem', { lineHeight: '1.6' }],
				'lg': ['1.125rem', { lineHeight: '1.6' }],
				'xl': ['1.375rem', { lineHeight: '1.4' }],
				'2xl': ['1.75rem', { lineHeight: '1.25' }],
				'3xl': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
				'4xl': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
				'5xl': ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
				// The stacked name. Capped at 6rem and held at the -0.04em
				// tracking floor: any tighter and the letters start to touch.
				'hero': ['clamp(2.5rem, 7.4vw, 6rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
			},

			maxWidth: {
				prose: '68ch',   // body copy cap, inside the 65-75ch band
				page: '1200px',
			},

			borderRadius: {
				// Editorial work is square. Two steps only, both small.
				DEFAULT: '2px',
				md: '4px',
				// The exception, and it is deliberate: the stack panel is a
				// window, not a card, and a window with 2px corners does not
				// read as one. Nothing else on the site may use this.
				window: '11px',
			},

			transitionTimingFunction: {
				out: 'cubic-bezier(0.23, 1, 0.32, 1)',
			},

			keyframes: {
				reveal: {
					from: { opacity: '0', transform: 'translateY(12px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				caret: {
					'0%, 45%': { opacity: '1' },
					'50%, 95%': { opacity: '0' },
				},
				// The track holds the item list twice, so travelling exactly
				// half its width lands on an identical frame and the loop has
				// no visible jump.
				marquee: {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-50%)' },
				},
			},

			animation: {
				reveal: 'reveal 420ms cubic-bezier(0.23, 1, 0.32, 1) both',
				caret: 'caret 1.1s steps(1) infinite',
				marquee: 'marquee var(--marquee-duration, 60s) linear infinite',
			},
		},
	},
	plugins: [],
}
