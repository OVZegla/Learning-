// ============================================
// LEARNING+ — Landing page
// ============================================

function Landing({ go }) {
  return (
    <div className="landing">
      <TopNav go={go} />
      <Hero go={go} />
      <Marquee />
      <Features />
      <CatalogPreview />
      <HowItWorks />
      <Testimonial />
      <CTAStrip go={go} />
      <Footer />
    </div>
  );
}

function TopNav({ go }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h();
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header className={`topnav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="topnav-inner">
        <a className="topnav-logo" onClick={() => go('landing')}>
          <LPLogo />
        </a>
        <nav className="topnav-links">
          <a href="#catalog">Catalogue</a>
          <a href="#how">Comment ça marche</a>
          <a href="#entreprises">Pour les entreprises</a>
          <a href="#tarifs">Tarifs</a>
        </nav>
        <div className="topnav-actions">
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={() => go('signin')}>Se connecter</button>
          <button className="btn btn-accent btn-sm" onClick={() => go('signup')}>
            Commencer
            <Ico.arrow width="16" height="16" />
          </button>
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lp-theme', next);
    setDark(!dark);
  };
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Basculer le thème">
      {dark ? <Ico.sun width="16" height="16" /> : <Ico.moon width="16" height="16" />}
    </button>
  );
}

function Hero({ go }) {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden>
        <div className="hero-blob hero-blob-1"></div>
        <div className="hero-blob hero-blob-2"></div>
      </div>
      <div className="hero-inner">
        <div className="hero-badge">
          <span className="dot" style={{ background: 'var(--mint)' }}></span>
          <span className="mono">NOUVEAU · Certificats v2 disponibles</span>
        </div>
        <h1 className="hero-title">
          Apprenez des choses<br/>
          <span className="hero-title-accent">concrètes.</span><br/>
          À votre rythme.
        </h1>
        <p className="hero-sub">
          Learning+ est la plateforme de formation qui vous accompagne sur le terrain —
          de l'impression murale à Photoshop, en passant par l'entretien de votre matériel.
          Des formateurs pros. Des cours courts. Des certificats qui comptent.
        </p>
        <div className="hero-actions">
          <button className="btn btn-accent btn-lg" onClick={() => go('onboarding')}>
            Commencer gratuitement
            <Ico.arrow />
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => go('signin')}>
            <Ico.play width="18" height="18" />
            Voir une démo
          </button>
        </div>
        <div className="hero-proof">
          <div className="hero-avatars">
            {['#F4B942','#85C7A6','#B49FE5','#6FA8DC','#E88D8D'].map((c, i) => (
              <span key={i} className="avatar-sm" style={{ background: c }}>{['M','T','L','R','A'][i]}</span>
            ))}
          </div>
          <div className="hero-proof-text">
            <strong>12 840 apprenants</strong> se forment cette semaine sur Learning+
          </div>
        </div>
      </div>

      <HeroCard />
    </section>
  );
}

function HeroCard() {
  const [progress, setProgress] = React.useState(62);
  React.useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => p >= 72 ? 62 : p + 1);
    }, 180);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-card-wrap">
      {/* Main floating course card */}
      <div className="hero-card hero-card-main">
        <div className="hero-card-thumb placeholder-img" data-label="impression_murale.mp4"></div>
        <div className="hero-card-body">
          <div className="pill pill-accent">Module 3 · leçon 2</div>
          <div className="hero-card-title">Les bases de l'impression murale</div>
          <div className="hero-card-meta">
            <Ico.clock width="14" height="14" /> 4 min restantes
          </div>
          <div className="hero-progress">
            <div className="hero-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="hero-card-foot">
            <span className="mono">{progress}% terminé</span>
            <button className="btn btn-primary btn-sm">
              <Ico.play width="12" height="12" />
              Reprendre
            </button>
          </div>
        </div>
      </div>

      {/* Floating certificate chip */}
      <div className="float-chip float-cert">
        <div className="float-cert-icon"><Ico.award width="18" height="18" /></div>
        <div>
          <div className="float-chip-title">Certificat débloqué</div>
          <div className="float-chip-sub mono">Photoshop · Fondamentaux</div>
        </div>
      </div>

      {/* Floating streak chip */}
      <div className="float-chip float-streak">
        <Ico.flame width="18" height="18" />
        <div>
          <div className="float-chip-title">Série de 7 jours</div>
          <div className="float-chip-sub">Continue comme ça !</div>
        </div>
      </div>

      {/* Quiz hint chip */}
      <div className="float-chip float-quiz">
        <div className="quiz-dot"></div>
        <div>
          <div className="float-chip-title">Quiz validé</div>
          <div className="float-chip-sub mono">8/10 · +20 XP</div>
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  const items = [
    'Impression murale', 'Photoshop', 'Entretien imprimante', 'Illustrator',
    'Gestion couleur', 'Calibration', 'Figma', 'InDesign', 'Lightroom',
    'Préparation de fichier', 'Sérigraphie',
  ];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="marquee-item">
            <span className="dot" style={{ background: 'var(--accent)' }}></span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const features = [
    {
      tag: '01', title: 'Un catalogue qui avance avec vous',
      body: 'Des formations courtes, classées par niveau, avec un chemin clair du débutant au pro. Reprenez où vous vous êtes arrêté — toujours.',
      accent: 'var(--accent)', art: 'catalog',
    },
    {
      tag: '02', title: 'Des quiz qui ancrent ce que vous apprenez',
      body: 'QCM, vrai/faux, réponse libre. Correction immédiate, explications, seconde chance. Et un score qui débloque le module suivant.',
      accent: 'var(--mint)', art: 'quiz',
    },
    {
      tag: '03', title: 'Des certificats que vous pouvez montrer',
      body: 'Quand vous finissez une formation avec 80%+ et le quiz validé, votre certificat PDF est généré automatiquement. Partageable sur LinkedIn.',
      accent: 'var(--plum)', art: 'cert',
    },
  ];

  return (
    <section className="features" id="how">
      <div className="section-head">
        <span className="pill">Pourquoi Learning+</span>
        <h2 className="section-title">Apprendre, vraiment. Pas juste regarder des vidéos.</h2>
      </div>
      <div className="features-grid">
        {features.map(f => (
          <div key={f.tag} className="feature-card">
            <div className="feature-tag mono" style={{ color: f.accent }}>{f.tag}</div>
            <FeatureArt kind={f.art} accent={f.accent} />
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-body">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureArt({ kind, accent }) {
  if (kind === 'catalog') {
    return (
      <div className="feature-art">
        <div className="fart-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="fart-tile" style={{ opacity: 0.4 + i * 0.1 }}>
              <div className="fart-tile-bar" style={{ background: i === 4 ? accent : 'var(--line-2)' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === 'quiz') {
    return (
      <div className="feature-art">
        <div className="fart-quiz">
          <div className="fart-q">Question 3/8</div>
          <div className="fart-opt fart-opt-correct">
            <div className="fart-opt-dot" style={{ background: accent }}>
              <Ico.check width="10" height="10" />
            </div>
            72 DPI
          </div>
          <div className="fart-opt">
            <div className="fart-opt-dot"></div>
            150 DPI
          </div>
          <div className="fart-opt">
            <div className="fart-opt-dot"></div>
            300 DPI
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'cert') {
    return (
      <div className="feature-art">
        <div className="fart-cert">
          <div className="fart-cert-ribbon" style={{ background: accent }}></div>
          <div className="fart-cert-seal" style={{ borderColor: accent }}>
            <Ico.award width="22" height="22" />
          </div>
          <div className="fart-cert-line" style={{ width: '60%' }}></div>
          <div className="fart-cert-line" style={{ width: '80%' }}></div>
          <div className="fart-cert-line" style={{ width: '40%' }}></div>
        </div>
      </div>
    );
  }
}

function CatalogPreview() {
  const courses = [
    { title: 'Les bases de l\'impression murale', cat: 'Impression', level: 'Débutant', lessons: 12, hours: '2h 40', img: 'mur_blanc_rouleau.jpg', tint: 'var(--accent-soft)' },
    { title: 'Entretenir son imprimante murale', cat: 'Maintenance', level: 'Tous niveaux', lessons: 8, hours: '1h 50', img: 'imprimante_tetes.jpg', tint: 'var(--mint-soft)' },
    { title: 'Photoshop · Fondamentaux', cat: 'Logiciels', level: 'Débutant', lessons: 18, hours: '4h 20', img: 'photoshop_layers.jpg', tint: 'var(--sky-soft)' },
    { title: 'Préparer un fichier pour l\'impression', cat: 'Prépresse', level: 'Intermédiaire', lessons: 10, hours: '2h 10', img: 'cmyk_bleed.jpg', tint: 'var(--plum-soft)' },
    { title: 'Gestion de la couleur de A à Z', cat: 'Colorimétrie', level: 'Avancé', lessons: 14, hours: '3h 30', img: 'color_wheel.jpg', tint: 'var(--accent-soft)' },
    { title: 'Photoshop · Détourage et masques', cat: 'Logiciels', level: 'Intermédiaire', lessons: 9, hours: '2h 00', img: 'mask_tool.jpg', tint: 'var(--mint-soft)' },
  ];

  return (
    <section className="catalog" id="catalog">
      <div className="section-head catalog-head">
        <div>
          <span className="pill">Catalogue</span>
          <h2 className="section-title">Une vraie bibliothèque, pas un fourre-tout</h2>
        </div>
        <div className="catalog-filters">
          <button className="chip is-active">Tout</button>
          <button className="chip">Impression</button>
          <button className="chip">Logiciels</button>
          <button className="chip">Prépresse</button>
          <button className="chip">Maintenance</button>
        </div>
      </div>
      <div className="catalog-grid">
        {courses.map((c, i) => <CourseCard key={i} {...c} featured={i === 0} />)}
      </div>
      <div className="catalog-more">
        <button className="btn btn-outline">
          Voir toutes les formations (62)
          <Ico.arrow width="16" height="16" />
        </button>
      </div>
    </section>
  );
}

function CourseCard({ title, cat, level, lessons, hours, img, tint, featured }) {
  return (
    <article className={`course-card ${featured ? 'is-featured' : ''}`} style={{ '--tint': tint }}>
      <div className="course-thumb placeholder-img" data-label={img}>
        <span className="course-level mono">{level}</span>
      </div>
      <div className="course-body">
        <div className="course-cat mono">{cat}</div>
        <h3 className="course-title">{title}</h3>
        <div className="course-meta">
          <span><Ico.book width="13" height="13" /> {lessons} leçons</span>
          <span><Ico.clock width="13" height="13" /> {hours}</span>
        </div>
      </div>
    </article>
  );
}

function HowItWorks() {
  const steps = [
    { n: '1', t: 'Votre accès vous est attribué', s: 'Votre entreprise ou votre formateur vous donne accès aux formations pertinentes. Pas de supermarché infini.' },
    { n: '2', t: 'Vous apprenez par petits blocs', s: 'Chaque leçon dure 3 à 8 minutes. Vidéo, texte, image, PDF. On alterne pour que vous reteniez.' },
    { n: '3', t: 'Vous validez avec un quiz', s: 'À la fin de chaque module, un quiz. Score instantané. Si c\'est bon, le module suivant se débloque.' },
    { n: '4', t: 'Vous obtenez votre certificat', s: 'Formation finie à 80%+ ? Votre certificat PDF arrive dans votre boîte. Gardez-le, partagez-le.' },
  ];

  return (
    <section className="how" id="how">
      <div className="section-head">
        <span className="pill">Comment ça marche</span>
        <h2 className="section-title">Quatre étapes. Et c'est tout.</h2>
      </div>
      <div className="how-grid">
        {steps.map((s, i) => (
          <div key={i} className="how-step">
            <div className="how-n mono">{s.n}</div>
            <h3 className="how-t">{s.t}</h3>
            <p className="how-s">{s.s}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="testi">
      <div className="testi-card">
        <Ico.star width="18" height="18" style={{ color: 'var(--accent)' }} />
        <p className="testi-quote">
          « J'ai formé mes 14 techniciens sur l'impression grand format en trois semaines.
          Ils reviennent sur les leçons quand ils en ont besoin. Les quiz nous montrent qui
          a compris quoi. C'est le premier outil de formation qui ne prend pas la poussière. »
        </p>
        <div className="testi-who">
          <span className="avatar-md" style={{ background: 'var(--accent)' }}>MC</span>
          <div>
            <div className="testi-name">Marie Chassagne</div>
            <div className="testi-role">Responsable atelier · Atelier Vertigo</div>
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-num">94<span className="stat-unit">%</span></div>
          <div className="stat-lbl">de taux de complétion moyen</div>
        </div>
        <div className="stat">
          <div className="stat-num">4.8<span className="stat-unit">/5</span></div>
          <div className="stat-lbl">note moyenne des formations</div>
        </div>
        <div className="stat">
          <div className="stat-num">62</div>
          <div className="stat-lbl">formations actives au catalogue</div>
        </div>
        <div className="stat">
          <div className="stat-num">12k<span className="stat-unit">+</span></div>
          <div className="stat-lbl">apprenants actifs chaque semaine</div>
        </div>
      </div>
    </section>
  );
}

function CTAStrip({ go }) {
  return (
    <section className="cta">
      <div className="cta-inner">
        <div>
          <h2 className="cta-title">Prêt à vous former ?</h2>
          <p className="cta-sub">
            14 jours d'essai. Aucune carte requise. Accès au catalogue complet.
          </p>
        </div>
        <div className="cta-actions">
          <button className="btn btn-accent btn-lg" onClick={() => go('onboarding')}>
            Créer mon compte
            <Ico.arrow />
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => go('signin')}>
            J'ai déjà un compte
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="foot-top">
        <div className="foot-brand">
          <LPLogo size={24} />
          <p className="foot-tag">Apprendre des choses concrètes, à votre rythme.</p>
        </div>
        <div className="foot-cols">
          <div>
            <div className="foot-h mono">PRODUIT</div>
            <a>Catalogue</a><a>Pour les entreprises</a><a>Tarifs</a><a>Nouveautés</a>
          </div>
          <div>
            <div className="foot-h mono">RESSOURCES</div>
            <a>Blog</a><a>Guides</a><a>Centre d'aide</a><a>Communauté</a>
          </div>
          <div>
            <div className="foot-h mono">ENTREPRISE</div>
            <a>À propos</a><a>Carrières</a><a>Contact</a><a>Presse</a>
          </div>
          <div>
            <div className="foot-h mono">LÉGAL</div>
            <a>Conditions</a><a>Confidentialité</a><a>Cookies</a><a>RGPD</a>
          </div>
        </div>
      </div>
      <div className="foot-bot">
        <span className="mono">© 2026 Learning+ · Tous droits réservés</span>
        <span className="mono">Fait avec attention à Paris 🇫🇷</span>
      </div>
    </footer>
  );
}

window.Landing = Landing;
