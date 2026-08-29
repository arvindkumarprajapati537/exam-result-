import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Send,
  AlertTriangle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { updatePageSEO } from '../lib/seo';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    updatePageSEO('About Us – EXAM RESULT', 'Learn more about EXAM RESULT, our mission, and our verified examination information service.');
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-8 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
        <div className="border-b border-slate-200 pb-3 sm:pb-4">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
            Information Portal
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-950 font-serif mt-2">
            About EXAM RESULT
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Dedicated to empowering Indian candidates with accurate, prompt, and organized examination information.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            <strong>EXAM RESULT</strong> is a comprehensive, independently operated educational and career information platform founded to simplify government recruitment notices, examination schedules, admit cards, answer keys, and scorecards for millions of candidates across India.
          </p>

          <h2 className="text-lg font-bold text-slate-900 font-serif pt-2">Our Mission</h2>
          <p>
            To provide a clutter-free, high-speed, and reliable single window where aspirants can discover verified information regarding central government jobs (UPSC, SSC, Railways, Banking, Defense) and state public service commissions (UP, Bihar, Rajasthan, MP, Haryana, Delhi, and more).
          </p>

          <h2 className="text-lg font-bold text-slate-900 font-serif pt-2">Key Features We Deliver</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">✓ Instant Real-time Alerts</h3>
              <p className="text-xs text-slate-600">Daily updates on newly published advertisements, vacancy counts, and online registration dates.</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">✓ Structured Post Details</h3>
              <p className="text-xs text-slate-600">Direct breakdown of age criteria, fee categories, syllabus pattern, and direct official PDF downloads.</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">✓ Smart Age Calculator</h3>
              <p className="text-xs text-slate-600">Built-in interactive tool for candidates to verify eligibility against cut-off dates.</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">✓ Mobile & Screen-Reader Accessible</h3>
              <p className="text-xs text-slate-600">Ultra-fast loading speed and full high-contrast accessibility controls for all devices.</p>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-500 text-xs text-amber-950 mt-4">
            <p className="font-bold flex items-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Non-Government Affiliation Statement
            </p>
            <p>
              EXAM RESULT is an independent educational aggregator and is NOT affiliated with, sponsored by, or endorsed by any government entity or commission. We always provide references to official websites for independent candidate verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    updatePageSEO('Contact Support – EXAM RESULT', 'Contact EXAM RESULT candidate helpdesk and editorial team for queries and corrections.');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-8 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
        <div className="border-b border-slate-200 pb-3 sm:pb-4">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
            Helpdesk & Support
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-950 font-serif mt-2">
            Contact Candidate Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Have a question about an exam notification, correction notice, or website feedback? Write to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info cards */}
          <div className="space-y-4 md:col-span-1">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs uppercase text-slate-500">Email Inquiry</h3>
              <p className="text-xs font-bold text-slate-900">support@examresult.gov.in</p>
              <p className="text-[11px] text-slate-500">Average response within 24 hours</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs uppercase text-slate-500">Candidate Helpdesk</h3>
              <p className="text-xs font-bold text-slate-900">+91 (011) 2345-6789</p>
              <p className="text-[11px] text-slate-500">Mon - Fri (10:00 AM - 5:00 PM IST)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs uppercase text-slate-500">Editorial Desk</h3>
              <p className="text-xs font-medium text-slate-800">
                EXAM RESULT Media Portal<br />
                Connaught Place, New Delhi 110001
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 p-6 sm:p-8 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-950 font-serif">Message Received</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Thank you for contacting EXAM RESULT support desk. Our team will review your message and reply to <strong>{email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setSubject('');
                    setMessage('');
                  }}
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Exam / Topic Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Query regarding SSC CGL 2026 Admit Card Link"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe your question or feedback..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    updatePageSEO('Privacy Policy – EXAM RESULT', 'Read the privacy and data security policies of EXAM RESULT.');
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-8 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
        <div className="border-b border-slate-200 pb-3 sm:pb-4">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Legal & Compliance
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-950 font-serif mt-2">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last Updated: January 2026 • Effective for all EXAM RESULT visitors
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            At <strong>EXAM RESULT</strong>, we respect candidate privacy and are committed to protecting any information shared with our website. This Privacy Policy explains our data collection, use, and security practices.
          </p>

          <h2 className="text-base font-bold text-slate-900 font-serif pt-2">1. Information We Collect</h2>
          <p>
            We collect standard non-personally identifiable log information (browser type, device type, pages visited, and timestamps) solely to analyze web traffic, server performance, and enhance page loading speeds. If you create an account to bookmark exams, we store your name, email, and encrypted password.
          </p>

          <h2 className="text-base font-bold text-slate-900 font-serif pt-2">2. Cookies and Local Storage</h2>
          <p>
            We use client cookies and local browser storage strictly to remember your preferences (such as high-contrast display mode, font size zoom settings, and saved bookmarks). We do NOT use tracking cookies to sell your data to third-party telemarketers.
          </p>

          <h2 className="text-base font-bold text-slate-900 font-serif pt-2">3. Third-Party Links & Official Portals</h2>
          <p>
            Our portal contains hyperlinks to third-party official websites (e.g., upsc.gov.in, ssc.gov.in, nta.ac.in). When you click an external link, you are governed by the privacy practices of that respective government agency. We encourage candidates to review their respective policies.
          </p>

          <h2 className="text-base font-bold text-slate-900 font-serif pt-2">4. Data Security</h2>
          <p>
            We employ modern industry-standard TLS encryption, secured servers, and firewall safeguards to ensure your interaction with EXAM RESULT remains protected.
          </p>
        </div>
      </div>
    </div>
  );
};

export const DisclaimerPage: React.FC = () => {
  useEffect(() => {
    updatePageSEO('Disclaimer & Terms – EXAM RESULT', 'Disclaimer of government affiliation and terms of use for EXAM RESULT portal.');
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-8 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
        <div className="border-b border-slate-200 pb-3 sm:pb-4">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-50 px-3 py-1 rounded-full">
            Official Advisory
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-950 font-serif mt-2">
            Legal Disclaimer & Terms of Use
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Important Terms for All Candidates and Portal Users
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="bg-rose-50 border-l-4 border-rose-600 p-3.5 sm:p-4 rounded-r-xl text-rose-950">
            <h3 className="font-bold flex items-center gap-1.5 mb-1 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              Not a Government Entity
            </h3>
            <p>
              <strong>EXAM RESULT</strong> (examresult.gov.in mockup portal) is an independent informative portal created for candidate guidance and general educational knowledge only. We are NOT associated with any Central/State Government body, Union Public Service Commission, Staff Selection Commission, Railway Recruitment Board, or State Public Service Commission.
            </p>
          </div>

          <h2 className="text-base font-bold text-slate-900 font-serif pt-2">Accuracy of Examination Data</h2>
          <p>
            While every endeavor is made to provide authentic, up-to-date, and accurate examination dates, vacancies, eligibility criteria, and results:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
            <li>We do not warrant or guarantee that all notices or details are completely error-free.</li>
            <li>Government commissions may revise examination schedules, vacancies, or cut-offs without prior notice.</li>
            <li>Candidates are strictly advised to cross-verify all details, fee requirements, and deadlines from the original advertisement published on the official department portal before applying or paying fees.</li>
          </ul>

          <h2 className="text-base font-bold text-slate-900 font-serif pt-2">No Financial Transactions</h2>
          <p>
            EXAM RESULT never charges fees for job applications or registration forms. All fee payments are processed directly on official government servers via external portals.
          </p>
        </div>
      </div>
    </div>
  );
};
