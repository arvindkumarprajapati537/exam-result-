import React, { useState } from 'react';
import { X, Calculator, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

interface AgeCalculatorModalProps {
  asOfDate: string;
  minAge?: number | string;
  maxAge?: number | string;
  onClose: () => void;
}

export const AgeCalculatorModal: React.FC<AgeCalculatorModalProps> = ({
  asOfDate,
  minAge,
  maxAge,
  onClose,
}) => {
  const [dob, setDob] = useState<string>('2000-01-01');
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    isEligible: boolean | null;
  } | null>(null);

  const calculateAge = () => {
    if (!dob) return;
    const birthDate = new Date(dob);

    // Parse asOfDate (supports DD/MM/YYYY or YYYY-MM-DD)
    let targetDate = new Date();
    if (asOfDate) {
      if (asOfDate.includes('/')) {
        const parts = asOfDate.split('/');
        if (parts.length === 3) {
          // DD/MM/YYYY
          targetDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      } else {
        targetDate = new Date(asOfDate);
      }
    }

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    let isEligible: boolean | null = null;
    const numMin = typeof minAge === 'number' ? minAge : Number(minAge);
    const numMax = typeof maxAge === 'number' ? maxAge : Number(maxAge);

    if (!isNaN(numMin) && numMin > 0) {
      if (years < numMin) isEligible = false;
      else if (!isNaN(numMax) && numMax > 0 && years > numMax) isEligible = false;
      else isEligible = true;
    }

    setResult({ years, months, days, isEligible });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-300 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-blue-950 font-black text-lg font-serif">
            <Calculator className="w-5 h-5 text-amber-600" />
            <span>Candidate Age Calculator</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs sm:text-sm">
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
            <p className="text-blue-900 font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span>Exam Cut-off Reference Date: <strong>{asOfDate}</strong></span>
            </p>
            {minAge && (
              <p className="text-slate-600 text-xs mt-1">
                Prescribed Age: {minAge} to {maxAge || 'No Upper Limit'} Years
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Select Your Date of Birth (DOB):
            </label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono text-sm"
            />
          </div>

          <button
            onClick={calculateAge}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl shadow-xs transition"
          >
            Calculate Exact Age & Eligibility
          </button>

          {result && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-500 font-medium">Your Calculated Age:</p>
              <div className="text-lg font-extrabold text-blue-950">
                {result.years} Years, {result.months} Months, {result.days} Days
              </div>

              {result.isEligible !== null && (
                <div
                  className={`flex items-center gap-2 text-xs font-bold p-2.5 rounded-lg border ${
                    result.isEligible
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border-rose-300'
                  }`}
                >
                  {result.isEligible ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Eligible according to general age criteria!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        Age out of range for general category. (Check relaxation for OBC/SC/ST/PwD).
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
