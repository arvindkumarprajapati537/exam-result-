import React from 'react';
import { ShieldCheck, Mail, Phone, ExternalLink, Heart, AlertTriangle, Youtube, Send, Instagram, MessageCircle } from 'lucide-react';
import { CATEGORIES } from '../data/categories';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t-4 border-amber-500 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div
              onClick={() => onNavigate('/')}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center text-white font-serif font-black text-sm border-2 border-amber-400">
                ER
              </div>
              <span className="text-xl font-extrabold text-white font-serif tracking-tight">
                EXAM <span className="text-rose-500 font-sans">RESULT</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier independent portal for instant updates on Government Jobs (Sarkari Naukri), Exam Results, Admit Cards, Official Answer Keys, Admissions, and Syllabus 2026.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Recruitment Feed Active</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-serif border-l-2 border-amber-400 pl-2">
              Quick Examination Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-amber-400 transition hover:underline"
                >
                  Home Page
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/latest-jobs')}
                  className="hover:text-amber-400 transition hover:underline"
                >
                  Latest Jobs (Recruitment)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/results')}
                  className="hover:text-amber-400 transition hover:underline"
                >
                  Exam Results & Cut-off
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admit-card')}
                  className="hover:text-amber-400 transition hover:underline"
                >
                  Admit Card & City Slips
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/answer-key')}
                  className="hover:text-amber-400 transition hover:underline"
                >
                  Answer Keys & Challenges
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/syllabus')}
                  className="hover:text-amber-400 transition hover:underline"
                >
                  Detailed Syllabus & Pattern
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admissions')}
                  className="hover:text-amber-400 transition hover:underline"
                >
                  Admission Entrance Tests
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-serif border-l-2 border-blue-400 pl-2">
              Portal Information
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/important-links')}
                  className="hover:text-blue-400 transition hover:underline"
                >
                  Official Government Portals Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/latest-updates')}
                  className="hover:text-blue-400 transition hover:underline"
                >
                  Live Updates Stream
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-blue-400 transition hover:underline"
                >
                  About EXAM RESULT
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-blue-400 transition hover:underline"
                >
                  Candidate Support & Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/privacy-policy')}
                  className="hover:text-blue-400 transition hover:underline"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/disclaimer')}
                  className="hover:text-blue-400 transition hover:underline"
                >
                  Legal Disclaimer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admin/login')}
                  className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                >
                  Admin Control Panel Login
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Candidate Helpdesk & Warning */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-serif border-l-2 border-emerald-400 pl-2">
              Candidate Helpdesk
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stay updated with daily notification alerts. Bookmark this page on your browser or phone for one-tap access to active job forms.
            </p>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400">Join Official Channels:</div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://whatsapp.com/channel/0029VbDExHh8fewu2xmVj03M"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 transition"
                  title="WhatsApp Channel"
                >
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
                <a
                  href="https://t.me/examresult0156"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-600 hover:bg-sky-500 text-white px-2 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 transition"
                  title="Telegram Channel"
                >
                  <Send className="w-3 h-3" /> Telegram
                </a>
                <a
                  href="https://www.youtube.com/@Arvindofficial345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 transition"
                  title="YouTube Channel"
                >
                  <Youtube className="w-3 h-3" /> YouTube
                </a>
                <a
                  href="https://x.com/Arvindk29646455"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-black text-white px-2 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 transition"
                  title="X (Twitter) Handle"
                >
                  <span>𝕏 Twitter</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Important Notice Section */}
        <div className="my-6 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Important Official Notice:</span>
          </p>
          <p className="leading-relaxed">
            <strong>EXAM RESULT is an independent information portal.</strong> Candidates should always verify important information, exam schedules, and application links directly from the official website of the respective organization or department before taking any action or submitting fees.
          </p>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-4 border-t border-slate-900">
          <p>© 2026 EXAM RESULT. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-slate-300">
              Privacy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('/disclaimer')} className="hover:text-slate-300">
              Disclaimer
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('/contact')} className="hover:text-slate-300">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
