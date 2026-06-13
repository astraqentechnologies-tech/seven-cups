import { useState, useEffect, useRef } from 'react'
import { Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AF = "'Arial Black','Arial Bold',Gadget,sans-serif"

export default function Auth() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [titleText, setTitleText] = useState('')
  const [btnHover, setBtnHover] = useState(false)
  const [switchAnim, setSwitchAnim] = useState(false)
  const [successPulse, setSuccessPulse] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const animRef = useRef<number>(0)

  const fullTitle = mode === 'login' ? 'Welcome Back' : 'Join Luminary'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setTitleText('')
    let i = 0
    const interval = setInterval(() => {
      setTitleText(fullTitle.slice(0, i + 1))
      i++
      if (i >= fullTitle.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = []
    for (let i = 0; i < 38; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.3 + 0.05,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180,160,100,${p.alpha})`
        ctx.fill()
      })
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 90) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(180,140,60,${0.12 * (1 - dist / 90)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700)
  }

  const handleModeSwitch = (m: 'login' | 'register') => {
    setSwitchAnim(true)
    setTimeout(() => {
      setMode(m)
      setError('')
      setSwitchAnim(false)
    }, 200)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'register' && form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setSuccessPulse(false)
    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) { setError(error.message); setLoading(false) }
      else { setSuccessPulse(true); setTimeout(() => navigate('/'), 600) }
    } else {
      const { error } = await signUp(form.email, form.password, form.name)
      if (error) { setError(error.message); setLoading(false) }
      else { setSuccessPulse(true); setTimeout(() => navigate('/'), 600) }
    }
  }

  const fields =
    mode === 'register'
      ? ['name', 'email', 'password', 'confirm']
      : ['email', 'password']

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .af { font-family: ${AF}; }

        .page-wrap {
          min-height: 100vh;
          background: #fafaf8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 16px 48px;
          position: relative;
          overflow: hidden;
        }

        .bg-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .orb1 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%);
          top: -60px; left: -80px;
          animation-delay: 0s;
        }
        .orb2 {
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(120,100,60,0.07) 0%, transparent 70%);
          bottom: 40px; right: -60px;
          animation-delay: -3s;
        }
        .orb3 {
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%);
          top: 50%; left: 60%;
          animation-delay: -5s;
        }
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        .card-wrap {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          animation: cardDrop 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardDrop {
          from { opacity:0; transform: translateY(40px) scale(0.96); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        .logo-wrap {
          width: 80px; height: 80px;
          background: #1c1917;
          border-radius: 22px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          animation: logoBounce 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-delay: 0.15s;
          position: relative;
          overflow: hidden;
        }
        @keyframes logoBounce {
          from { opacity:0; transform: scale(0.4) rotate(-20deg); }
          to   { opacity:1; transform: scale(1) rotate(0deg); }
        }
        .logo-ring {
          position: absolute;
          inset: -4px;
          border-radius: 26px;
          border: 2px solid rgba(251,191,36,0.3);
          animation: ringPulse 2.5s ease-in-out infinite;
        }
        @keyframes ringPulse {
          0%,100% { transform: scale(1); opacity: 0.3; }
          50%      { transform: scale(1.12); opacity: 0; }
        }
        .leaf-icon {
          animation: leafSpin 4s ease-in-out infinite;
        }
        @keyframes leafSpin {
          0%,100% { transform: rotate(0deg) scale(1); }
          25%      { transform: rotate(10deg) scale(1.1); }
          75%      { transform: rotate(-8deg) scale(1.05); }
        }

        .title-wrap {
          text-align: center; margin-bottom: 32px;
          animation: titleSlide 0.5s ease both;
          animation-delay: 0.25s;
        }
        @keyframes titleSlide {
          from { opacity:0; transform: translateY(-10px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .title-cursor {
          display: inline-block;
          width: 2px; height: 1em;
          background: #d97706;
          margin-left: 2px;
          vertical-align: middle;
          animation: blink 0.8s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .glass-card {
          background: rgba(255,255,255,0.92);
          border-radius: 28px;
          border: 1px solid rgba(231,229,228,0.8);
          padding: 32px;
          backdrop-filter: blur(12px);
          transition: box-shadow 0.4s ease, transform 0.4s ease;
          animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
          animation-delay: 0.1s;
        }
        @keyframes cardIn {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .glass-card:hover {
          box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(251,191,36,0.1);
          transform: translateY(-2px);
        }

        .tabs {
          display: flex;
          background: #f5f4f0;
          border-radius: 18px;
          padding: 4px;
          margin-bottom: 28px;
          position: relative;
        }
        .tab-slider {
          position: absolute;
          top: 4px; bottom: 4px;
          width: calc(50% - 4px);
          background: #1c1917;
          border-radius: 14px;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .tab-slider.right { transform: translateX(calc(100% + 4px)); }
        .tab-btn {
          flex: 1; position: relative; z-index: 1;
          padding: 11px 0; border: none; background: transparent;
          border-radius: 14px; cursor: pointer;
          font-family: ${AF}; font-size: 12px; letter-spacing: 0.08em;
          transition: color 0.3s ease;
        }
        .tab-btn.active { color: #fbbf24; }
        .tab-btn.inactive { color: #78716c; }
        .tab-btn.inactive:hover { color: #1c1917; }

        .form-content {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .form-content.switching {
          opacity: 0;
          transform: translateX(10px);
        }

        .field-wrap {
          position: relative;
          margin-bottom: 16px;
        }
        .field-wrap:nth-child(1) { animation: fieldIn 0.4s ease both 0.05s; }
        .field-wrap:nth-child(2) { animation: fieldIn 0.4s ease both 0.1s; }
        .field-wrap:nth-child(3) { animation: fieldIn 0.4s ease both 0.15s; }
        .field-wrap:nth-child(4) { animation: fieldIn 0.4s ease both 0.2s; }
        @keyframes fieldIn {
          from { opacity:0; transform: translateX(-14px); }
          to   { opacity:1; transform: translateX(0); }
        }

        .field-input {
          width: 100%;
          padding: 20px 16px 8px;
          background: #f9f8f5;
          border: 1.5px solid #e7e5e0;
          border-radius: 14px;
          font-size: 14px;
          color: #1c1917;
          outline: none;
          transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
          font-family: ${AF};
        }
        .field-input:hover { border-color: #d6d3ce; }
        .field-input.focused {
          border-color: #fbbf24;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(251,191,36,0.12);
        }
        .field-input.has-error { border-color: #fca5a5; }

        .float-label {
          position: absolute;
          left: 16px; top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          color: #a8a29e;
          pointer-events: none;
          transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
          font-family: ${AF};
        }
        .float-label.up {
          top: 10px; transform: translateY(0);
          font-size: 10px; color: #d97706;
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        .eye-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #a8a29e; transition: color 0.2s ease;
          display: flex; align-items: center;
        }
        .eye-btn:hover { color: #d97706; }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: #1c1917;
          color: #fff;
          border: none; border-radius: 16px;
          font-family: ${AF}; font-size: 13px;
          letter-spacing: 0.1em;
          cursor: pointer;
          position: relative; overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.3s ease, background 0.3s ease;
          margin-top: 8px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.2);
          background: #78350f;
        }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn.success-pulse {
          animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1);
          background: #166534;
        }
        @keyframes successPop {
          0%  { transform: scale(1); }
          50% { transform: scale(1.04); }
          100%{ transform: scale(1); }
        }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          transform: scale(0);
          animation: rippleAnim 0.7s linear;
          pointer-events: none;
          width: 60px; height: 60px;
          margin-top: -30px; margin-left: -30px;
        }
        @keyframes rippleAnim {
          to { transform: scale(8); opacity: 0; }
        }

        .loading-dots span {
          display: inline-block;
          width: 5px; height: 5px;
          background: #fff;
          border-radius: 50%;
          margin: 0 2px;
          animation: dotBounce 0.8s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes dotBounce {
          0%,100% { transform: translateY(0); opacity:0.5; }
          50%      { transform: translateY(-5px); opacity:1; }
        }

        .arrow-icon {
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .submit-btn:hover .arrow-icon { transform: translateX(4px); }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 13px;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 18px;
          display: flex; align-items: center; gap: 8px;
          animation: shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both,
                     fadeInErr 0.3s ease both;
          font-family: ${AF};
        }
        @keyframes shake {
          10%,90%  { transform: translateX(-2px); }
          20%,80%  { transform: translateX(4px); }
          30%,50%,70% { transform: translateX(-4px); }
          40%,60%  { transform: translateX(4px); }
        }
        @keyframes fadeInErr {
          from { opacity:0; transform: translateY(-6px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0;
        }
        .divider::before,.divider::after {
          content:''; flex:1; height:1px; background:#e7e5e0;
        }
        .divider span {
          font-size: 11px; color: #a8a29e; letter-spacing: 0.1em;
          font-family: ${AF};
        }

        .switch-link {
          text-align: center; font-size: 13px; color: #78716c;
          font-family: ${AF};
        }
        .switch-btn {
          background: none; border: none; cursor: pointer;
          color: #d97706; font-family: ${AF}; font-size: 13px;
          font-weight: 900; text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s, transform 0.2s;
          display: inline-block;
        }
        .switch-btn:hover { color: #b45309; transform: scale(1.05); }

        .footer-note {
          text-align: center; font-size: 11px; color: #a8a29e;
          margin-top: 20px; letter-spacing: 0.05em;
          font-family: ${AF};
          animation: fadeUp 0.5s ease both 0.5s;
        }
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(8px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .security-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(220,252,231,0.6);
          border: 1px solid rgba(134,239,172,0.5);
          border-radius: 20px;
          padding: 4px 12px;
          color: #166534; font-size: 11px;
          font-family: ${AF}; letter-spacing: 0.05em;
          animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.6s;
        }
        @keyframes badgePop {
          from { opacity:0; transform: scale(0.7); }
          to   { opacity:1; transform: scale(1); }
        }
        .lock-pulse {
          animation: lockBeat 2s ease-in-out infinite;
        }
        @keyframes lockBeat {
          0%,100%{ transform: scale(1); }
          50%    { transform: scale(1.2); }
        }
      `}</style>

      <div className='page-wrap'>
        <canvas ref={canvasRef} className='bg-canvas' />
        <div className='orb orb1' />
        <div className='orb orb2' />
        <div className='orb orb3' />

        <div className={`card-wrap ${mounted ? '' : 'opacity-0'}`}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div className='logo-wrap'>
              <div className='logo-ring' />
              <Leaf className='leaf-icon' style={{ width: 36, height: 36, color: '#fbbf24' }} />
            </div>
          </div>

          {/* Title */}
          <div className='title-wrap'>
            <h1 className='af' style={{ fontSize: 34, fontWeight: 900, color: '#1c1917', margin: 0, letterSpacing: '-0.5px' }}>
              {titleText}<span className='title-cursor' />
            </h1>
            <p style={{ color: '#a8a29e', fontSize: 13, marginTop: 6, fontFamily: AF, letterSpacing: '0.04em' }}>
              {mode === 'login' ? 'Sign in to your tea account' : 'Start your tea journey today'}
            </p>
          </div>

          {/* Card */}
          <div className='glass-card'>
            {/* Tabs */}
            <div className='tabs'>
              <div className={`tab-slider ${mode === 'register' ? 'right' : ''}`} />
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  className={`tab-btn ${mode === m ? 'active' : 'inactive'}`}
                  onClick={() => handleModeSwitch(m)}
                >
                  {m === 'login' ? 'SIGN IN' : 'REGISTER'}
                </button>
              ))}
            </div>

            {/* Form content */}
            <div className={`form-content ${switchAnim ? 'switching' : ''}`}>
              {error && (
                <div className='error-box'>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#b91c1c', flexShrink: 0 }}>!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <div className='field-wrap'>
                    <label className={`float-label ${form.name || focused === 'name' ? 'up' : ''}`}>Full Name</label>
                    <input
                      type='text' value={form.name} required
                      className={`field-input ${focused === 'name' ? 'focused' : ''}`}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused(null)}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                )}

                <div className='field-wrap'>
                  <label className={`float-label ${form.email || focused === 'email' ? 'up' : ''}`}>Email Address</label>
                  <input
                    type='email' value={form.email} required
                    className={`field-input ${focused === 'email' ? 'focused' : ''}`}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>

                <div className='field-wrap'>
                  <label className={`float-label ${form.password || focused === 'password' ? 'up' : ''}`}>Password</label>
                  <input
                    type={showPass ? 'text' : 'password'} value={form.password} required minLength={6}
                    className={`field-input ${focused === 'password' ? 'focused' : ''}`}
                    style={{ paddingRight: 44 }}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                  <button type='button' className='eye-btn' onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {mode === 'register' && (
                  <div className='field-wrap'>
                    <label className={`float-label ${form.confirm || focused === 'confirm' ? 'up' : ''}`}>Confirm Password</label>
                    <input
                      type={showPass ? 'text' : 'password'} value={form.confirm} required
                      className={`field-input ${focused === 'confirm' ? 'focused' : ''}`}
                      onFocus={() => setFocused('confirm')}
                      onBlur={() => setFocused(null)}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    />
                  </div>
                )}

                <button
                  ref={btnRef}
                  type='submit'
                  disabled={loading}
                  className={`submit-btn ${successPulse ? 'success-pulse' : ''}`}
                  onMouseEnter={() => setBtnHover(true)}
                  onMouseLeave={() => setBtnHover(false)}
                  onClick={addRipple}
                >
                  {ripples.map(rp => (
                    <span key={rp.id} className='ripple' style={{ left: rp.x, top: rp.y }} />
                  ))}
                  {loading ? (
                    <span className='loading-dots'>
                      <span /><span /><span />
                    </span>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
                      <ArrowRight size={15} className='arrow-icon' />
                    </>
                  )}
                </button>
              </form>

              <div className='divider'><span>OR</span></div>

              <p className='switch-link'>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  className='switch-btn'
                  onClick={() => handleModeSwitch(mode === 'login' ? 'register' : 'login')}
                >
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          <div className='footer-note'>
            <span className='security-badge'>
              <svg className='lock-pulse' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                <rect x='3' y='11' width='18' height='11' rx='2' /><path d='M7 11V7a5 5 0 0 1 10 0v4' />
              </svg>
              END-TO-END ENCRYPTED
            </span>
          </div>
        </div>
      </div>
    </>
  )
}