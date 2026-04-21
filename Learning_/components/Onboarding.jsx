// ============================================
// Onboarding — 4 étapes
// ============================================

function Onboarding({ go }) {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({
    role: null, goals: [], freq: null, level: null,
  });

  const steps = [
    { key: 'welcome', title: 'Bienvenue sur Learning+' },
    { key: 'role', title: 'Que faites-vous au quotidien ?' },
    { key: 'goals', title: 'Qu\'aimeriez-vous apprendre ?' },
    { key: 'freq', title: 'Combien de temps par semaine ?' },
    { key: 'ready', title: 'C\'est parti !' },
  ];

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div className="onb">
      <header className="onb-top">
        <a className="onb-logo" onClick={() => go('landing')}><LPLogo /></a>
        <div className="onb-progress-wrap">
          <div className="onb-progress-bar" style={{ width: `${(step / (steps.length - 1)) * 100}%` }}></div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => go('landing')}>
          <Ico.close width="14" height="14" /> Quitter
        </button>
      </header>

      <div className="onb-body">
        {step === 0 && <OnbWelcome onNext={next} />}
        {step === 1 && <OnbRole value={answers.role} onChange={v => setAnswers(a => ({ ...a, role: v }))} onNext={next} onPrev={prev} />}
        {step === 2 && <OnbGoals value={answers.goals} onChange={v => setAnswers(a => ({ ...a, goals: v }))} onNext={next} onPrev={prev} />}
        {step === 3 && <OnbFreq value={answers.freq} onChange={v => setAnswers(a => ({ ...a, freq: v }))} onNext={next} onPrev={prev} />}
        {step === 4 && <OnbReady answers={answers} go={go} />}
      </div>

      <footer className="onb-foot mono">
        Étape {step + 1} sur {steps.length} · Learning+
      </footer>
    </div>
  );
}

function OnbWelcome({ onNext }) {
  return (
    <div className="onb-slide onb-slide-welcome">
      <div className="onb-welcome-art">
        <div className="welcome-confetti">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="confetti"
              style={{
                '--x': `${(i * 37) % 100}%`,
                '--d': `${(i * 0.13) % 2}s`,
                '--c': ['var(--accent)','var(--mint)','var(--plum)','var(--sky)'][i % 4],
              }}
            ></span>
          ))}
        </div>
        <LPMark size={72} />
      </div>
      <h1 className="onb-h1">Bienvenue sur Learning+ 👋</h1>
      <p className="onb-lead">
        On va configurer votre espace en 3 petites questions. Ça prend moins d'une minute,
        et ça nous aide à vous proposer les bonnes formations dès votre première connexion.
      </p>
      <button className="btn btn-accent btn-lg" onClick={onNext}>
        C'est parti
        <Ico.arrow />
      </button>
    </div>
  );
}

function OnbRole({ value, onChange, onNext, onPrev }) {
  const roles = [
    { k: 'imprimeur', t: 'Imprimeur / technicien', s: 'Impression grand format, murale, sérigraphie', emoji: '🖨️' },
    { k: 'graphiste', t: 'Graphiste / designer', s: 'Photoshop, Illustrator, InDesign, Figma', emoji: '🎨' },
    { k: 'manager', t: 'Responsable d\'équipe', s: 'Je forme d\'autres personnes', emoji: '👥' },
    { k: 'curieux', t: 'Simplement curieux', s: 'J\'apprends pour moi', emoji: '✨' },
  ];
  return (
    <div className="onb-slide">
      <h1 className="onb-h1">Que faites-vous au quotidien ?</h1>
      <p className="onb-lead">Pour que les recommandations soient pertinentes.</p>
      <div className="onb-choices">
        {roles.map(r => (
          <button
            key={r.k}
            className={`onb-choice ${value === r.k ? 'is-active' : ''}`}
            onClick={() => onChange(r.k)}
          >
            <span className="onb-choice-emoji">{r.emoji}</span>
            <div className="onb-choice-text">
              <div className="onb-choice-t">{r.t}</div>
              <div className="onb-choice-s">{r.s}</div>
            </div>
            <span className="onb-choice-check">
              {value === r.k && <Ico.check width="16" height="16" />}
            </span>
          </button>
        ))}
      </div>
      <OnbNav onPrev={onPrev} onNext={onNext} canNext={!!value} />
    </div>
  );
}

function OnbGoals({ value, onChange, onNext, onPrev }) {
  const goals = [
    'Impression murale', 'Entretien matériel', 'Photoshop', 'Illustrator',
    'Gestion de la couleur', 'Préparation de fichier', 'Sérigraphie', 'InDesign',
    'Lightroom', 'Figma',
  ];
  const toggle = (g) => {
    onChange(value.includes(g) ? value.filter(x => x !== g) : [...value, g]);
  };
  return (
    <div className="onb-slide">
      <h1 className="onb-h1">Qu'aimeriez-vous apprendre ?</h1>
      <p className="onb-lead">Choisissez tout ce qui vous intéresse. <span className="mono">(plusieurs réponses)</span></p>
      <div className="onb-chips">
        {goals.map(g => (
          <button
            key={g}
            className={`onb-chip ${value.includes(g) ? 'is-active' : ''}`}
            onClick={() => toggle(g)}
          >
            {value.includes(g) && <Ico.check width="14" height="14" />}
            {g}
          </button>
        ))}
      </div>
      <OnbNav onPrev={onPrev} onNext={onNext} canNext={value.length > 0} hint={`${value.length} sélectionné${value.length > 1 ? 's' : ''}`} />
    </div>
  );
}

function OnbFreq({ value, onChange, onNext, onPrev }) {
  const opts = [
    { k: 'light', t: '15 min / jour', s: 'Doucement mais sûrement', art: 1 },
    { k: 'medium', t: '30 min / jour', s: 'Le bon rythme pour progresser', art: 2, popular: true },
    { k: 'pro', t: '1 h / jour', s: 'Je veux apprendre à fond', art: 3 },
  ];
  return (
    <div className="onb-slide">
      <h1 className="onb-h1">Combien de temps par jour ?</h1>
      <p className="onb-lead">On vous enverra des rappels doux pour garder le rythme.</p>
      <div className="onb-freq-grid">
        {opts.map(o => (
          <button
            key={o.k}
            className={`onb-freq ${value === o.k ? 'is-active' : ''}`}
            onClick={() => onChange(o.k)}
          >
            {o.popular && <span className="onb-freq-badge mono">Recommandé</span>}
            <div className="onb-freq-art">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="onb-freq-bar" style={{
                  opacity: i < o.art ? 1 : 0.2,
                  height: `${40 + i * 14}px`,
                }}></span>
              ))}
            </div>
            <div className="onb-freq-t">{o.t}</div>
            <div className="onb-freq-s">{o.s}</div>
          </button>
        ))}
      </div>
      <OnbNav onPrev={onPrev} onNext={onNext} canNext={!!value} />
    </div>
  );
}

function OnbReady({ answers, go }) {
  return (
    <div className="onb-slide onb-slide-ready">
      <div className="ready-icon">
        <Ico.check width="42" height="42" />
      </div>
      <h1 className="onb-h1">Votre espace est prêt</h1>
      <p className="onb-lead">
        On a préparé une sélection de formations pour vous. Vous pouvez commencer
        dès maintenant — ou finaliser votre inscription.
      </p>
      <div className="ready-preview">
        <div className="ready-preview-h mono">VOTRE PREMIÈRE FORMATION SUGGÉRÉE</div>
        <div className="ready-course">
          <div className="ready-course-thumb placeholder-img" data-label="impression_murale.jpg"></div>
          <div>
            <div className="course-cat mono">Impression</div>
            <div className="course-title">Les bases de l'impression murale</div>
            <div className="course-meta">
              <span><Ico.book width="13" height="13" /> 12 leçons</span>
              <span><Ico.clock width="13" height="13" /> 2h 40</span>
            </div>
          </div>
        </div>
      </div>
      <div className="ready-actions">
        <button className="btn btn-accent btn-lg" onClick={() => go('signup')}>
          Créer mon compte
          <Ico.arrow />
        </button>
        <button className="btn btn-ghost" onClick={() => go('landing')}>
          Plus tard
        </button>
      </div>
    </div>
  );
}

function OnbNav({ onPrev, onNext, canNext, hint }) {
  return (
    <div className="onb-nav">
      <button className="btn btn-ghost" onClick={onPrev}>
        <Ico.arrowLeft width="16" height="16" />
        Retour
      </button>
      {hint && <span className="onb-nav-hint mono">{hint}</span>}
      <button className="btn btn-accent" onClick={onNext} disabled={!canNext} style={{ opacity: canNext ? 1 : 0.5 }}>
        Continuer
        <Ico.arrow width="16" height="16" />
      </button>
    </div>
  );
}

window.Onboarding = Onboarding;
