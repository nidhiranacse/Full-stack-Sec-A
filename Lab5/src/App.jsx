import { useMemo, useState } from 'react'

const steps = ['Account', 'Profile', 'Finish']
const initialData = { email: '', password: '', fullName: '', role: '', updates: true }

const passwordRules = [
  { label: '8+ characters', test: (value) => value.length >= 8 },
  { label: 'Uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'Number', test: (value) => /\d/.test(value) },
  { label: 'Special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

function PasswordStrength({ value }) {
  const passed = passwordRules.filter((rule) => rule.test(value)).length
  const levels = ['Enter a password', 'Needs work', 'Getting there', 'Strong password', 'Excellent']
  const tone = passed < 2 ? 'low' : passed < 4 ? 'mid' : 'high'

  return (
    <div className="strength" aria-live="polite">
      <div className="strength-line">
        <span>{levels[passed]}</span>
        <strong>{passed}/4</strong>
      </div>
      <div className="progress-track" aria-label={`Password strength ${passed} of 4`}>
        <span className={`progress-fill ${tone}`} style={{ width: `${passed * 25}%` }} />
      </div>
      <div className="rule-list">
        {passwordRules.map((rule) => {
          const valid = rule.test(value)
          return <span className={valid ? 'rule valid' : 'rule'} key={rule.label}>{valid ? '✓' : '○'} {rule.label}</span>
        })}
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', placeholder, error }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} aria-invalid={Boolean(error)} />
      {error && <small className="error-badge">{error}</small>}
    </label>
  )
}

function AccountStep({ data, onChange, errors }) {
  return (
    <div className="step-content">
      <div className="step-kicker">01 / account access</div>
      <h1>Build your secure base.</h1>
      <p className="intro">Start with an identity that is yours. We validate every field as you go.</p>
      <Field label="Work email" name="email" type="email" value={data.email} onChange={onChange} placeholder="you@company.com" error={errors.email} />
      <Field label="Create password" name="password" type="password" value={data.password} onChange={onChange} placeholder="Make it memorable, not guessable" error={errors.password} />
      <PasswordStrength value={data.password} />
    </div>
  )
}

function ProfileStep({ data, onChange, errors }) {
  return (
    <div className="step-content">
      <div className="step-kicker">02 / your profile</div>
      <h1>Put a name to the work.</h1>
      <p className="intro">A little context helps your workspace feel like it was made for you.</p>
      <Field label="Full name" name="fullName" value={data.fullName} onChange={onChange} placeholder="Alex Morgan" error={errors.fullName} />
      <label className="field">
        <span>What best describes your role?</span>
        <select name="role" value={data.role} onChange={onChange} aria-invalid={Boolean(errors.role)}>
          <option value="">Choose one</option>
          <option>Product designer</option>
          <option>Developer</option>
          <option>Founder or operator</option>
          <option>Student</option>
        </select>
        {errors.role && <small className="error-badge">{errors.role}</small>}
      </label>
      <label className="check-row"><input type="checkbox" name="updates" checked={data.updates} onChange={onChange} /><span>Send me occasional product notes and practical tips.</span></label>
    </div>
  )
}

function FinishStep({ data }) {
  return (
    <div className="finish step-content">
      <div className="success-mark">✓</div>
      <div className="step-kicker">03 / ready when you are</div>
      <h1>Your workspace is yours.</h1>
      <p className="intro">We have everything we need. Review your details, then step into your workspace.</p>
      <div className="summary">
        <div><span>Account</span><strong>{data.email}</strong></div>
        <div><span>Name</span><strong>{data.fullName}</strong></div>
        <div><span>Role</span><strong>{data.role}</strong></div>
      </div>
    </div>
  )
}

function App() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const progress = useMemo(() => `${((step + 1) / steps.length) * 100}%`, [step])
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }
  const validate = () => {
    const next = {}
    if (step === 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) next.email = 'Use a valid work email.'
      if (!passwordRules.every((rule) => rule.test(data.password))) next.password = 'Meet all four security checks.'
    }
    if (step === 1) {
      if (data.fullName.trim().length < 2) next.fullName = 'Add your full name.'
      if (!data.role) next.role = 'Pick a role to continue.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }
  const advance = () => {
    if (!validate()) return
    if (step < steps.length - 1) setStep((current) => current + 1)
    else setSubmitted(true)
  }

  return (
    <main className="page-shell">
      <aside className="side-panel">
        <div className="brand"><span className="brand-mark">W</span><span>workspace</span></div>
        <div className="side-copy"><p className="eyebrow">A clearer way forward</p><h2>Good work begins with a little room to think.</h2><p>One calm place for the ideas, decisions, and momentum that move your team ahead.</p></div>
        <div className="side-foot"><span className="orbit" /> <span>Trusted by thoughtful teams</span></div>
      </aside>
      <section className="form-panel">
        <div className="topline"><span>New workspace</span><span>Already a member? <button type="button" className="link-button">Sign in</button></span></div>
        <div className="form-wrap">
          <div className="stepper" aria-label="Onboarding progress">
            <div className="progress-bar"><span style={{ width: progress }} /></div>
            {steps.map((label, index) => <div className={`step-dot ${index <= step ? 'active' : ''}`} key={label}><span>{index + 1}</span><small>{label}</small></div>)}
          </div>
          {submitted ? <div className="submitted"><div className="success-mark">✓</div><h1>Welcome, {data.fullName.split(' ')[0]}.</h1><p className="intro">Your account has been created. The next good idea is closer than it looks.</p></div> : <>
            {step === 0 && <AccountStep data={data} onChange={handleChange} errors={errors} />}
            {step === 1 && <ProfileStep data={data} onChange={handleChange} errors={errors} />}
            {step === 2 && <FinishStep data={data} />}
            <div className="actions">{step > 0 && <button type="button" className="back-button" onClick={() => setStep((current) => current - 1)}>Back</button>}<button type="button" className="primary-button" onClick={advance}>{step === 2 ? 'Create workspace' : 'Continue'} <span>→</span></button></div>
          </>}
          <p className="privacy">By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</p>
        </div>
      </section>
    </main>
  )
}

export default App
