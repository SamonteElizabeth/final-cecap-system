import React from 'react';
import { ArrowRight, CreditCard, Zap, BellRing, Headset, ShieldCheck, Signal, Wifi, BatteryFull } from 'lucide-react';
import cecapLogo from '../../assets/cecap-wordmark.png';
import cecapEmblem from '../../assets/cecap-emblem.png';
import substationHero from '../../assets/images/clark_electric_substation_1791368730354.jpg';

interface LandingViewProps {
  onSignIn: () => void;
  onRegister: () => void;
}

const FEATURES = [
  { icon: CreditCard, title: 'Pay Bills', desc: 'E-wallets & cards' },
  { icon: Zap, title: 'Track Usage', desc: 'Monthly kWh history' },
  { icon: BellRing, title: 'Outage Alerts', desc: 'Real-time advisories' },
  { icon: Headset, title: 'Get Support', desc: 'Tickets & FAQs' },
];

const delay = (ms: number): React.CSSProperties => ({ animationDelay: `${ms}ms` });

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

/** Website-only sunlit illustration: sun, skyline, power lines, a home and sweeping energy waves. */
const LandingScene: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMaxYMid slice"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="lsSun" cx="0.5" cy="0.42" r="0.5">
        <stop offset="0" stopColor="#FFF4D6" />
        <stop offset="0.45" stopColor="#FFC879" />
        <stop offset="1" stopColor="#FF9A3D" stopOpacity="0.85" />
      </radialGradient>
      <linearGradient id="lsWaveA" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFD08A" />
        <stop offset="0.55" stopColor="#FF8A2A" />
        <stop offset="1" stopColor="#FF5401" />
      </linearGradient>
      <linearGradient id="lsWaveB" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFF1DA" />
        <stop offset="1" stopColor="#FFB45C" />
      </linearGradient>
      <linearGradient id="lsWindow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE7A8" />
        <stop offset="1" stopColor="#FFB547" />
      </linearGradient>
    </defs>

    {/* Sun */}
    <circle cx="1010" cy="400" r="360" fill="url(#lsSun)" opacity="0.9" />
    <circle className="cecap-glow" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} cx="1010" cy="330" r="110" fill="#FFF7E4" opacity="0.75" />

    {/* Hills */}
    <path d="M600 600 Q 760 500 930 560 T 1260 520 T 1440 540 V900 H600Z" fill="#FFD5A0" opacity="0.75" />
    <path d="M560 650 Q 760 580 980 630 T 1440 610 V900 H560Z" fill="#FFE2B8" opacity="0.8" />

    {/* Skyline */}
    <g fill="#F2A15E" opacity="0.22">
      <rect x="690" y="430" width="34" height="200" rx="3" />
      <rect x="730" y="380" width="44" height="250" rx="3" />
      <rect x="780" y="455" width="30" height="175" rx="3" />
      <rect x="815" y="410" width="38" height="220" rx="3" />
      <rect x="858" y="480" width="28" height="150" rx="3" />
    </g>

    {/* Neighborhood: power lines, home & trees (kept right of the phone) */}
    <g transform="translate(130 10)">
    <g stroke="#7A3E1D" strokeLinecap="round" opacity="0.8">
      <path d="M1300 240 V700" strokeWidth="9" />
      <path d="M1250 270 H1350 M1262 305 H1338" strokeWidth="6" />
      <path d="M1130 360 V660" strokeWidth="6" />
      <path d="M1098 380 H1162 M1106 402 H1154" strokeWidth="4" />
      <path d="M960 440 V640" strokeWidth="4" />
      <path d="M940 452 H980" strokeWidth="3" />
    </g>
    <g stroke="#7A3E1D" strokeWidth="1.6" opacity="0.55">
      <path d="M1440 230 Q 1395 265 1350 270 Q 1240 330 1162 380 Q 1060 430 980 452" />
      <path d="M1440 265 Q 1390 300 1338 305 Q 1235 360 1154 402 Q 1050 440 940 452" />
      <path d="M1250 270 Q 1170 345 1098 380 Q 1010 420 960 440" />
    </g>

    {/* Home */}
    <g>
      <rect x="1020" y="560" width="290" height="150" rx="4" fill="#FFF6EA" />
      <rect x="1080" y="470" width="190" height="95" rx="4" fill="#FFF1E0" />
      <path d="M1060 474 L1175 425 L1290 474 Z" fill="#E36A2E" />
      <path d="M1000 566 L1090 532 H1330 L1330 566 Z" fill="#EE7F42" />
      <rect x="1100" y="490" width="44" height="52" rx="3" fill="url(#lsWindow)" />
      <rect x="1158" y="490" width="44" height="52" rx="3" fill="url(#lsWindow)" />
      <rect x="1216" y="490" width="36" height="52" rx="3" fill="url(#lsWindow)" />
      <path d="M1092 548 H1262" stroke="#D9692F" strokeWidth="4" />
      <rect x="1045" y="595" width="60" height="70" rx="3" fill="url(#lsWindow)" />
      <rect x="1125" y="595" width="70" height="115" rx="3" fill="url(#lsWindow)" />
      <rect x="1215" y="595" width="70" height="70" rx="3" fill="url(#lsWindow)" />
    </g>

    {/* Trees */}
    <g>
      <circle cx="1000" cy="660" r="42" fill="#8DB566" />
      <circle cx="1035" cy="690" r="34" fill="#7AA552" />
      <circle cx="1345" cy="630" r="56" fill="#86B05E" />
      <circle cx="1395" cy="670" r="44" fill="#74A04E" />
      <circle cx="905" cy="690" r="30" fill="#9CC274" />
    </g>
    </g>

    {/* Energy waves */}
    <g className="cecap-drift-reverse">
      <path d="M0 800 C 360 660 720 880 1080 720 S 1380 640 1440 620 V900 H0Z" fill="url(#lsWaveB)" opacity="0.9" />
    </g>
    <g className="cecap-drift">
      <path d="M0 860 C 420 760 760 930 1120 790 S 1400 700 1440 690 V900 H0Z" fill="url(#lsWaveA)" opacity="0.95" />
    </g>
  </svg>
);

/** Website-only tilted phone showing the CECAp mobile welcome screen. */
const PhoneShowcase: React.FC<LandingViewProps> = ({ onSignIn, onRegister }) => (
  <div className="relative">
    {/* Light streak swirling around the phone */}
    <svg
      className="absolute -left-28 -bottom-16 w-[560px] h-[260px] pointer-events-none z-20"
      viewBox="0 0 560 260"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lsStreak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFF3DA" />
          <stop offset="1" stopColor="#FF7A1A" />
        </linearGradient>
      </defs>
      <path
        d="M30 190 C 140 260 420 250 530 150"
        stroke="#FF8A2A"
        strokeOpacity="0.25"
        strokeWidth="14"
        strokeLinecap="round"
        style={{ filter: 'blur(6px)' }}
      />
      <path
        className="cecap-dash"
        d="M30 190 C 140 260 420 250 530 150"
        stroke="url(#lsStreak)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="260 380"
      />
    </svg>

    <div className="cecap-fade-up" style={delay(150)}>
      <div className="cecap-float-slow">
        <div style={{ transform: 'perspective(1800px) rotateY(-14deg) rotateX(4deg) rotateZ(-6deg)' }}>
          {/* Metallic frame */}
          <div
            className="relative w-[300px] h-[610px] rounded-[54px] p-[3px] shadow-[40px_50px_80px_-30px_rgba(120,50,0,0.55)]"
            style={{ background: 'linear-gradient(145deg, #F1E6D8 0%, #8F7D6B 30%, #F6EDE2 55%, #6B5B4D 100%)' }}
          >
            <span className="absolute -right-[4px] top-36 w-[4px] h-20 rounded-r bg-[#8F7D6B]" />
            <span className="absolute -left-[4px] top-28 w-[4px] h-10 rounded-l bg-[#8F7D6B]" />
            <span className="absolute -left-[4px] top-44 w-[4px] h-14 rounded-l bg-[#8F7D6B]" />

            {/* Bezel */}
            <div className="w-full h-full rounded-[51px] bg-[#111] p-[9px]">
              {/* Screen */}
              <div
                className="relative w-full h-full rounded-[42px] overflow-hidden flex flex-col"
                style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8EE 100%)' }}
              >
                {/* Notch */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[130px] h-[28px] rounded-b-[18px] bg-[#111] flex items-center justify-end pr-5">
                  <span className="w-2 h-2 rounded-full bg-[#1f2a44]" />
                </div>
                {/* Status bar */}
                <div className="flex items-center justify-between px-7 pt-2.5 text-[10px] font-semibold text-[#2B2B2B]">
                  <span>9:41</span>
                  <span className="flex items-center gap-1">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <BatteryFull className="w-4 h-4" />
                  </span>
                </div>

                {/* Brand */}
                <div className="flex flex-col items-center text-center mt-9 px-6">
                  <img src={cecapEmblem} alt="CECAp Logo" className="w-[72px] h-[72px] object-contain drop-shadow-[0_8px_14px_rgba(255,84,1,0.25)]" />
                  <p className="mt-2 text-[7px] font-semibold tracking-[0.32em] text-slate-500 uppercase">Clark Electric</p>
                  <p className="mt-5 text-[17px] font-semibold text-[#2B2B2B]">Welcome to CECAp</p>
                  <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                    Your electric service,
                    <br />
                    just a tap away.
                  </p>
                </div>

                {/* Scene */}
                <img
                  src={substationHero}
                  alt=""
                  className="mt-4 w-full h-[118px] object-cover object-center"
                  style={{
                    maskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 75%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 75%, transparent 100%)',
                  }}
                />

                {/* Actions */}
                <div className="mt-auto px-6 pb-7 space-y-2.5">
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="w-full h-11 rounded-full text-white text-[13px] font-semibold shadow-[0_10px_18px_-8px_rgba(255,84,1,0.7)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(90deg, #FF7A1A 0%, #FF5401 100%)' }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={onRegister}
                    className="w-full h-11 rounded-full bg-white border border-[#FF5401]/40 text-[#FF5401] text-[13px] font-semibold hover:bg-orange-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Register
                  </button>
                  <p className="pt-1 text-center text-[10px] text-slate-500">
                    Need help?{' '}
                    <button type="button" onClick={() => scrollToId('landing-support')} className="text-[#FF5401] font-semibold cursor-pointer hover:underline">
                      Contact
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Landing screen shown before authentication (mobile and website).
 * Animations are pure CSS (see `.cecap-*` utilities in index.css) and respect reduced-motion.
 */
export const LandingView: React.FC<LandingViewProps> = ({ onSignIn, onRegister }) => {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#FDFBF7] text-[#2B2B2B] flex flex-col">
      {/* Ambient background (mobile) */}
      <div className="md:hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[62%]"
          style={{ background: 'linear-gradient(170deg, #FFF3DF 0%, #FFE4B5 55%, rgba(253,251,247,0) 100%)' }}
        />
        <div className="cecap-drift pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FF5401]/10 blur-3xl" />
        <div className="cecap-drift-reverse pointer-events-none absolute top-1/3 -left-28 w-64 h-64 rounded-full bg-[#FFB347]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 w-[420px] h-[420px] rounded-full border-[40px] border-[#F7EFE2]/80" />
      </div>

      {/* Illustrated scene (website) */}
      <div className="hidden md:block pointer-events-none absolute inset-0">
        <LandingScene />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, #FDFBF7 0%, rgba(253,251,247,0.96) 30%, rgba(253,251,247,0.55) 48%, rgba(253,251,247,0) 62%)' }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:grid md:grid-cols-2 md:items-center md:gap-10 lg:gap-16 w-full max-w-6xl mx-auto px-6 md:px-10 pt-[max(env(safe-area-inset-top),2.5rem)] md:pt-0 pb-[max(env(safe-area-inset-bottom),1.5rem)] md:pb-0">
        {/* Phone (website) */}
        <div className="hidden md:flex justify-center md:order-last py-12">
          <PhoneShowcase onSignIn={onSignIn} onRegister={onRegister} />
        </div>

        {/* Copy, features & actions */}
        {/* Mobile: three blocks with the spare height split evenly between them */}
        <div className="flex-1 flex flex-col justify-between gap-7 md:gap-0 md:justify-start md:flex-none">
          <div id="landing-about" className="flex flex-col items-center md:items-start text-center md:text-left mt-2 md:mt-0">
            <h1 className="cecap-fade-up" style={delay(0)}>
              <img src={cecapLogo} alt="CECAp" className="h-14 md:h-20 w-auto object-contain" />
            </h1>
            <p className="cecap-fade-up mt-4 md:mt-5 text-[10px] md:text-xs font-semibold tracking-[0.28em] text-[#FF5401] uppercase" style={delay(120)}>
              Clark Electric Distribution Corp.
            </p>
            <p className="cecap-fade-up mt-3 md:mt-4 text-[13px] md:text-base text-slate-500 leading-relaxed max-w-[290px] md:max-w-md mx-auto md:mx-0" style={delay(320)}>
              Manage your electric account, pay bills, and stay informed on outages — all in one secure app.
            </p>
          </div>

          <div>
            {/* Feature grid */}
            <div id="landing-features" className="grid grid-cols-2 gap-2.5 md:gap-4 md:mt-10 md:max-w-lg">
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="cecap-fade-up flex items-center gap-2.5 md:gap-3 rounded-2xl bg-white/85 backdrop-blur-sm border border-[#F1E6D6] px-3 py-3 md:px-4 md:py-4 shadow-[0_4px_14px_-6px_rgba(255,140,50,0.18)] md:hover:-translate-y-0.5 md:hover:shadow-[0_10px_24px_-10px_rgba(255,140,50,0.35)] transition-all"
                  style={delay(420 + i * 80)}
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-orange-50 border border-[#FF5401]/15 flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px] text-[#FF5401]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] md:text-sm font-semibold leading-tight md:truncate">{title}</p>
                    <p className="text-[10px] md:text-xs text-slate-500 leading-snug mt-0.5 md:truncate">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
  
            {/* Scene (mobile) */}
            <div
              className="cecap-fade-up md:hidden relative h-36 mt-3 rounded-3xl overflow-hidden border border-[#F1E6D6] shadow-[0_10px_24px_-14px_rgba(255,120,30,0.45)]"
              style={delay(700)}
            >
              <img src={substationHero} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
              <p className="absolute left-4 bottom-3 right-4 flex items-center gap-1.5 text-[11px] font-medium text-white">
                <Zap className="w-3.5 h-3.5 text-[#FFB347] fill-[#FFB347] shrink-0" />
                Your electric service, just a tap away.
              </p>
            </div>
          </div>

          <div>
            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-3 md:mt-10">
              <button
                type="button"
                onClick={onSignIn}
                className="cecap-fade-up cecap-shine relative overflow-hidden w-full md:w-auto md:px-10 h-[52px] rounded-2xl bg-[#FF5401] hover:bg-[#E54A00] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_12px_24px_-10px_rgba(255,84,1,0.6)] transition-all cursor-pointer"
                style={delay(780)}
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onRegister}
                className="cecap-fade-up w-full md:w-auto md:px-10 h-[52px] rounded-2xl bg-white border border-[#FF5401]/30 text-[#FF5401] hover:bg-orange-50 active:scale-[0.98] text-sm font-semibold transition-all cursor-pointer"
                style={delay(860)}
              >
                Register
              </button>
            </div>

            {/* Footer (mobile) */}
            <div className="cecap-fade-up md:hidden mt-6 text-center space-y-1" style={delay(960)}>
              <p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Secured with 2-Factor Authentication
              </p>
              <p className="text-[10px] text-slate-400">© 2026 Clark Electric Distribution Corporation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (website) */}
      <footer
        id="landing-support"
        className="cecap-fade-up hidden md:flex relative z-10 items-center justify-between gap-6 w-full max-w-6xl mx-auto px-10 py-6 text-xs text-[#2B2B2B]/70"
        style={delay(960)}
      >
        <p className="flex items-center gap-1.5 text-slate-500">
          <Headset className="w-4 h-4 text-[#FF5401]" />
          <span>Need help? Log in and open a ticket from Support.</span>
        </p>
        <p className="text-white/90">© 2026 Clark Electric Distribution Corporation</p>
      </footer>
    </div>
  );
};
