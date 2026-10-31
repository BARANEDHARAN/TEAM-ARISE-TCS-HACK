import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Cpu,
  Scale,
  Network,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Layers,
  Lock,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide">CLAIMMIND AI</span>
            <span className="text-xs text-blue-400 block font-medium">Multimodal Insurance Claims Investigator</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
          >
            Launch Investigation Platform <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>AI Hackathon Challenge: Multimodal Autonomous Insurance Claims Investigator</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-100 mb-6 leading-tight">
          Evidence Intelligence. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            Counterfactual Reasoning.
          </span>{' '}
          Fair Settlements.
        </h1>
        <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          CLAIMMIND AI connects fragmented accident photographs, repair invoices, claimant statements,
          and telematics records. It identifies physical contradictions, simulates plausible accident
          scenarios, and predicts the next best evidence to eliminate investigative blind spots.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
          >
            Explore Investigator Workspace <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/workspace/CLM-2026-001')}
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-all"
          >
            View Sample Claim A (Contradiction Dossier)
          </button>
        </div>
      </section>

      {/* The Five Fundamental Questions */}
      <section className="px-6 py-16 bg-slate-950/70 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Core Purpose</h2>
            <p className="text-2xl font-bold text-slate-100">The Five Questions CLAIMMIND AI Answers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                q: '1. What does the evidence show?',
                desc: 'Computer vision identifies damage regions and stamps an unforgeable Damage Fingerprint.',
                icon: Eye,
              },
              {
                q: '2. Does evidence agree with statement?',
                desc: 'Cross-modal NLP compares impact dynamics against visual damage patterns.',
                icon: Scale,
              },
              {
                q: '3. What explains inconsistencies?',
                desc: 'Counterfactual reasoning engine simulates alternative collision mechanisms.',
                icon: Cpu,
              },
              {
                q: '4. What additional evidence is needed?',
                desc: 'Next-Best-Evidence AI pinpoints decisive missing documents with formal requests.',
                icon: FileCheck2,
              },
              {
                q: '5. What should the investigator do?',
                desc: 'Explainable settlement breakdowns empower human review without autonomous denial.',
                icon: CheckCircle2,
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-600/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-900/40 text-blue-400 flex items-center justify-center mb-4">
                    <card.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-200 mb-2">{card.q}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Three Signature Innovations */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Differentiating Technology</h2>
          <p className="text-3xl font-bold text-slate-100">Three Signature Innovations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dynamic Evidence Intelligence Graph</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              A topological knowledge graph mapping claims, statements, damage fingerprints, policy clauses,
              and invoices using React Flow with interactive cross-modal evidence inspection.
            </p>
            <span className="text-[11px] font-semibold text-indigo-400">Interactive Visual Topology &rarr;</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Counterfactual Accident Reasoning Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Instead of rushing to fraud suspicion, tests competing hypotheses (e.g. sandwich collision vs.
              statement inaccuracy vs. prior damage) with explicit supporting and contradicting evidence matrices.
            </p>
            <span className="text-[11px] font-semibold text-blue-400">Multi-Hypothesis Simulation &rarr;</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-5">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Next-Best-Evidence Intelligence</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Avoids generic document checklists. Explains specifically what is missing, which uncertainty it
              resolves, and auto-generates a formal request letter for policyholders.
            </p>
            <span className="text-[11px] font-semibold text-teal-400">Actionable Gap Elimination &rarr;</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-400 max-w-7xl mx-auto">
        <p>CLAIMMIND AI &bull; Autonomous Multimodal Insurance Claims Investigator &bull; AI for Business Hackathon</p>
      </footer>
    </div>
  );
};
