// ============================================
// Auth — Sign in / Sign up / Forgot password
// ============================================

function AuthShell({ children, go, kind }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <a className="auth-logo" onClick={() => go('landing')}>
          <LPLogo />
        </a>

        <div className="auth-side-inner">
          <div className="auth-quote-card">
            <span className="mono auth-quote-tag">#apprenant_de_la_semaine</span>
            <div className="auth-quote-avatar placeholder-img" data-label="leo_portrait.jpg"></div>
            <div className="auth-quote-who">
              <div className="auth-quote-name">Léo B.</div>
              <div className="auth-quote-role">Technicien impression · Lyon</div>
            </div>
            <p className="auth-quote-text">
              « J'ai appris à calibrer mes têtes d'impression en regardant 3 vidéos
              le dimanche. Lundi, on n'a pas eu un seul problème. »
            </p>
            <div className="auth-quote-foot">
              <div className="auth-quote-stat">
                <span className="mono auth-quote-stat-num">12</span>
                <span className="auth-quote-stat-lbl">formations<br/>terminées</span>
              </div>
              <div className="auth-quote-stat">
                <span className="mono auth-quote-stat-num">7</span>
                <span className="auth-quote-stat-lbl">certificats<br/>obtenus</span>
              </div>
              <div className="auth-quote-stat">
                <span className="mono auth-quote-stat-num">41j</span>
                <span className="auth-quote-stat-lbl">série<br/>active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-side-foot mono">
          © 2026 Learning+ · Confidentialité · CGU
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main-top">
          <ThemeToggle />
          {kind === 'signin' && (
            <span className="mono auth-switch">
              Nouveau ici ? <a onClick={() => go('signup')}>Créer un compte</a>
            </span>
          )}
          {kind === 'signup' && (
            <span className="mono auth-switch">
              Déjà un compte ? <a onClick={() => go('signin')}>Se connecter</a>
            </span>
          )}
          {kind === 'forgot' && (
            <span className="mono auth-switch">
              <a onClick={() => go('signin')}>← Retour à la connexion</a>
            </span>
          )}
        </div>
        <div className="auth-form-wrap">
          {children}
        </div>
      </main>
    </div>
  );
}

function SignIn({ go }) {
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  return (
    <AuthShell go={go} kind="signin">
      <div className="auth-form">
        <h1 className="auth-title">Content de vous revoir 👋</h1>
        <p className="auth-sub">Connectez-vous pour reprendre là où vous vous êtes arrêté.</p>

        <button className="btn btn-outline btn-block auth-oauth">
          <Ico.google />
          Continuer avec Google
        </button>

        <div className="auth-sep"><span>ou avec votre email</span></div>

        <div className="field">
          <label>Adresse email</label>
          <input type="email" placeholder="vous@entreprise.fr" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>Mot de passe</label>
            <a className="auth-link mono" onClick={() => go('forgot')}>Oublié ?</a>
          </div>
          <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
        </div>

        <label className="auth-check">
          <input type="checkbox" defaultChecked />
          <span>Garder ma session active 30 jours</span>
        </label>

        <button className="btn btn-accent btn-block btn-lg" onClick={() => go('landing')}>
          Se connecter
          <Ico.arrow />
        </button>

        <p className="auth-legal mono">
          En continuant, vous acceptez nos CGU et notre politique de confidentialité.
        </p>
      </div>
    </AuthShell>
  );
}

function SignUp({ go }) {
  const [pw, setPw] = React.useState('');
  const strength = scoreStrength(pw);
  return (
    <AuthShell go={go} kind="signup">
      <div className="auth-form">
        <h1 className="auth-title">Créez votre compte</h1>
        <p className="auth-sub">14 jours d'essai, aucune carte bancaire requise.</p>

        <button className="btn btn-outline btn-block auth-oauth">
          <Ico.google />
          S'inscrire avec Google
        </button>

        <div className="auth-sep"><span>ou avec votre email</span></div>

        <div className="auth-row">
          <div className="field">
            <label>Prénom</label>
            <input placeholder="Marie" />
          </div>
          <div className="field">
            <label>Nom</label>
            <input placeholder="Chassagne" />
          </div>
        </div>
        <div className="field">
          <label>Adresse email professionnelle</label>
          <input type="email" placeholder="marie@atelier-vertigo.fr" />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="8 caractères minimum" />
          <div className="pw-strength" data-level={strength.level}>
            <div className="pw-bars">
              {[0,1,2,3].map(i => (
                <span key={i} className={`pw-bar ${i < strength.score ? 'is-on' : ''}`}></span>
              ))}
            </div>
            <span className="mono pw-label">{strength.label}</span>
          </div>
        </div>

        <label className="auth-check">
          <input type="checkbox" />
          <span>Je souhaite recevoir les nouveautés et conseils de Learning+ (optionnel)</span>
        </label>

        <button className="btn btn-accent btn-block btn-lg" onClick={() => go('onboarding')}>
          Créer mon compte
          <Ico.arrow />
        </button>

        <p className="auth-legal mono">
          En créant un compte, vous acceptez nos CGU et notre politique de confidentialité.
        </p>
      </div>
    </AuthShell>
  );
}

function scoreStrength(pw) {
  if (!pw) return { score: 0, label: 'Entrez votre mot de passe', level: '0' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Trop court', 'Faible', 'Correct', 'Fort', 'Excellent'];
  return { score, label: labels[score], level: String(score) };
}

function Forgot({ go }) {
  const [sent, setSent] = React.useState(false);
  return (
    <AuthShell go={go} kind="forgot">
      <div className="auth-form">
        {!sent ? (
          <>
            <h1 className="auth-title">Mot de passe oublié ?</h1>
            <p className="auth-sub">
              Entrez votre email, on vous envoie un lien pour en créer un nouveau.
            </p>

            <div className="field">
              <label>Adresse email</label>
              <input type="email" placeholder="vous@entreprise.fr" />
            </div>

            <button className="btn btn-accent btn-block btn-lg" onClick={() => setSent(true)}>
              Envoyer le lien de réinitialisation
              <Ico.arrow />
            </button>

            <div className="auth-sep"><span>ou</span></div>

            <button className="btn btn-ghost btn-block" onClick={() => go('signin')}>
              Revenir à la connexion
            </button>
          </>
        ) : (
          <div className="auth-sent">
            <div className="ready-icon auth-sent-icon"><Ico.check width="36" height="36" /></div>
            <h1 className="auth-title">Email envoyé</h1>
            <p className="auth-sub">
              Vérifiez votre boîte de réception. Le lien expire dans 30 minutes.
              Pensez aussi au dossier spam.
            </p>
            <button className="btn btn-accent btn-block btn-lg" onClick={() => go('signin')}>
              J'ai compris
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setSent(false)}>
              Renvoyer l'email
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

window.SignIn = SignIn;
window.SignUp = SignUp;
window.Forgot = Forgot;
