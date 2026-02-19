import React from 'react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  return (
    <div className="bg-[#fcfcfd] min-h-screen selection:bg-indigo-100">
      {/* Header Section */}
      <header className="pt-24 pb-20 px-6 bg-white border-b border-slate-100 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] -mr-64 -mt-64"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-8 inline-flex items-center gap-2 group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
            Back to Home
          </Link>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-6 italic font-['Bangers']">
            Transparent <span className="text-indigo-600">Licensing</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Investment in compliance pays the best interest. Choose a tier that fits your organization’s workforce size and regulatory needs.
          </p>
        </div>
      </header>

      {/* Main Pricing Cards */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Startup */}
          <div className="p-12 rounded-[56px] border-2 border-slate-100 bg-white flex flex-col hover:border-indigo-100 transition-all duration-500 shadow-sm">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">Starter</p>
             <div className="flex items-baseline gap-2 mb-10">
                <span className="text-5xl font-black text-slate-900">₹999</span>
                <span className="text-slate-400 font-bold">/year</span>
             </div>
             <p className="text-sm text-slate-500 font-medium mb-12 leading-relaxed">Ideal for startups and small business units requiring basic mandatory certifications.</p>
             <ul className="space-y-6 mb-16 text-sm font-bold text-slate-600 flex-grow">
                <li className="flex items-center gap-4"><span className="text-emerald-500 text-lg">✓</span> Up to 50 employees</li>
                <li className="flex items-center gap-4"><span className="text-emerald-500 text-lg">✓</span> Core Statutory Library</li>
                <li className="flex items-center gap-4"><span className="text-emerald-500 text-lg">✓</span> Verified PDF Transcripts</li>
                <li className="flex items-center gap-4 opacity-30"><span className="text-slate-300 text-lg">✗</span> API Integration</li>
             </ul>
             <button className="w-full py-6 rounded-[32px] bg-slate-900 text-white font-black uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Get Started</button>
          </div>

          {/* Business - Recommended */}
          <div className="p-14 rounded-[64px] bg-slate-900 text-white shadow-[0_40px_80px_-20px_rgba(79,70,229,0.3)] relative transform lg:scale-105 overflow-hidden">
             <div className="absolute top-0 right-0 p-8">
                <span className="bg-indigo-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Most Popular</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4">Growth</p>
             <div className="flex items-baseline gap-2 mb-10">
                <span className="text-5xl font-black text-white">₹2,499</span>
                <span className="text-slate-400 font-bold">/year</span>
             </div>
             <p className="text-sm text-slate-400 font-medium mb-12 leading-relaxed">Comprehensive compliance suite for growing mid-market enterprises.</p>
             <ul className="space-y-6 mb-16 text-sm font-bold flex-grow">
                <li className="flex items-center gap-4"><span className="text-indigo-400 text-lg">✓</span> Up to 250 employees</li>
                <li className="flex items-center gap-4"><span className="text-indigo-400 text-lg">✓</span> Full Course Catalog Access</li>
                <li className="flex items-center gap-4"><span className="text-indigo-400 text-lg">✓</span> Advanced Admin Analytics</li>
                <li className="flex items-center gap-4"><span className="text-indigo-400 text-lg">✓</span> Multi-unit Reporting</li>
             </ul>
             <button className="w-full py-6 rounded-[32px] bg-indigo-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-indigo-500 transition-all shadow-2xl">Start Growth Plan</button>
          </div>

          {/* Enterprise */}
          <div className="p-12 rounded-[56px] border-2 border-slate-100 bg-white flex flex-col hover:border-rose-100 transition-all duration-500 shadow-sm">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-4">Enterprise</p>
             <div className="flex items-baseline gap-2 mb-10">
                <span className="text-5xl font-black text-slate-900">Custom</span>
             </div>
             <p className="text-sm text-slate-500 font-medium mb-12 leading-relaxed">Tailored global compliance solutions with deep system integration.</p>
             <ul className="space-y-6 mb-16 text-sm font-bold text-slate-600 flex-grow">
                <li className="flex items-center gap-4"><span className="text-rose-500 text-lg">✓</span> Unlimited Workforce</li>
                <li className="flex items-center gap-4"><span className="text-rose-500 text-lg">✓</span> SSO & API Integrations</li>
                <li className="flex items-center gap-4"><span className="text-rose-500 text-lg">✓</span> White-Label Branding</li>
                <li className="flex items-center gap-4"><span className="text-rose-500 text-lg">✓</span> 24/7 Priority Success Team</li>
             </ul>
             <button className="w-full py-6 rounded-[32px] border-4 border-slate-100 text-slate-900 font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 transition-all">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
           <h2 className="text-4xl font-black text-slate-900 mb-16 tracking-tight text-center">Feature Comparison</h2>
           <div className="bg-white border border-slate-200 rounded-[48px] overflow-hidden shadow-xl">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-900 text-white">
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest">Platform Capability</th>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-center">Starter</th>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-center">Growth</th>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-center">Enterprise</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                       <td className="p-8 font-bold text-slate-900">Visual Narrative Modules</td>
                       <td className="p-8 text-center text-emerald-500 font-black text-xl">●</td>
                       <td className="p-8 text-center text-emerald-500 font-black text-xl">●</td>
                       <td className="p-8 text-center text-emerald-500 font-black text-xl">●</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                       <td className="p-8 font-bold text-slate-900">Knowledge Audits & Exams</td>
                       <td className="p-8 text-center text-emerald-500 font-black text-xl">●</td>
                       <td className="p-8 text-center text-emerald-500 font-black text-xl">●</td>
                       <td className="p-8 text-center text-emerald-500 font-black text-xl">●</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                       <td className="p-8 font-bold text-slate-900">Admin Dashboard</td>
                       <td className="p-8 text-center text-slate-300">Basic</td>
                       <td className="p-8 text-center text-indigo-600 font-black">Advanced</td>
                       <td className="p-8 text-center text-rose-500 font-black">Full Insight</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                       <td className="p-8 font-bold text-slate-900">SCORM/LMS API</td>
                       <td className="p-8 text-center text-slate-200">○</td>
                       <td className="p-8 text-center text-slate-200">○</td>
                       <td className="p-8 text-center text-emerald-500 font-black text-xl">●</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-slate-900 mb-16 tracking-tight text-center italic font-['Bangers'] underline decoration-indigo-600 underline-offset-8">Common Questions</h2>
            <div className="space-y-12">
               <div>
                  <h4 className="text-xl font-black text-slate-900 mb-4">Can we switch plans mid-year?</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">Yes, you can upgrade at any time. We will pro-rate the difference based on your remaining subscription period.</p>
               </div>
               <div>
                  <h4 className="text-xl font-black text-slate-900 mb-4">Are certifications government-recognized?</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">Our content is strictly aligned with global statutory requirements (POSH, OHS, ABC). However, official recognition depends on your local legal jurisdiction's specific audit requirements.</p>
               </div>
               <div>
                  <h4 className="text-xl font-black text-slate-900 mb-4">Do you offer non-profit discounts?</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">We believe integrity is for everyone. Reach out to our sales team for special non-profit and educational pricing.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-900 text-white text-center">
         <div className="max-w-7xl mx-auto px-6">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-10">© 2024 Etiquette Intelligence Inc. ISO 27001 Certified.</p>
            <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
               <Link to="/" className="hover:text-white transition-colors">Legal</Link>
               <Link to="/" className="hover:text-white transition-colors">Privacy</Link>
               <Link to="/" className="hover:text-white transition-colors">Security</Link>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Pricing;