import type { Metadata } from 'next';
import { Geist, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' });
const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-display-default',
    display: 'swap',
});

export const metadata: Metadata = {
    title: { default: 'Book an Appointment', template: '%s — Book an Appointment' },
    description: 'Online booking for dental clinics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="hr"
            className={`${geist.variable} ${cormorant.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
