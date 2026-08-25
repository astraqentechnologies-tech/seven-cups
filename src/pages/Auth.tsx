import { useState, useEffect, useRef } from 'react'
import { Leaf, ArrowRight, Mail, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AF = "'Arial Black','Arial Bold',Gadget,sans-serif"
const API = 'https://admin.sevencups.in/api'

export default function Auth() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [focused, setFocused] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [titleText, setTitleText] = useState('')
  const [successPulse, setSuccessPulse] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const fullTitle = step === 'email' ? 'Welcome Back' : 'Check Your Email'

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    setTitleText('')
    let i = 0
    const interval = setInterval(() => {
      setTitleText(fullTitle.slice(0, i + 1))
      i++
      if (i >= fullTitle.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [step])

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
        p.x += p.vx; p.y += p.vy
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

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700)
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')
      setStep('otp')
      setResendTimer(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 300)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpStr = otp.join('')
    if (otpStr.length < 6) { setError('Please enter the 6-digit OTP'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, otp: otpStr }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid OTP')

      // ✅ AuthContext update karo — same TOKEN_KEY use hoga
      loginWithToken(data.token, data.user)

      setSuccessPulse(true)
      setTimeout(() => navigate('/'), 700)
    } catch (err: any) {
      setError(err.message)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...otp]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setError('')
    setOtp(['', '', '', '', '', ''])
    setLoading(true)
    try {
      const res = await fetch(`${API}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP')
      setResendTimer(30)
      otpRefs.current[0]?.focus()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .af { font-family: ${AF}; }
        .page-wrap {
          min-height: 100vh; background: #fafaf8;
          display: flex; align-items: center; justify-content: center;
          padding: 80px 16px 48px; position: relative; overflow: hidden;
        }
        .bg-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; pointer-events: none; animation: orbFloat 8s ease-in-out infinite; }
        .orb1 { width:280px;height:280px;background:radial-gradient(circle,rgba(251,191,36,0.08) 0%,transparent 70%);top:-60px;left:-80px;animation-delay:0s; }
        .orb2 { width:220px;height:220px;background:radial-gradient(circle,rgba(120,100,60,0.07) 0%,transparent 70%);bottom:40px;right:-60px;animation-delay:-3s; }
        .orb3 { width:160px;height:160px;background:radial-gradient(circle,rgba(251,191,36,0.05) 0%,transparent 70%);top:50%;left:60%;animation-delay:-5s; }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.05)} }
        .card-wrap { width:100%;max-width:420px;position:relative;z-index:1;animation:cardDrop 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes cardDrop { from{opacity:0;transform:translateY(40px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .logo-wrap {
          width:80px;height:80px;background:#1c1917;border-radius:22px;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 20px;animation:logoBounce 0.7s cubic-bezier(0.34,1.56,0.64,1) both 0.15s;
          position:relative;overflow:hidden;
        }
        @keyframes logoBounce { from{opacity:0;transform:scale(0.4) rotate(-20deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
        .logo-ring { position:absolute;inset:-4px;border-radius:26px;border:2px solid rgba(251,191,36,0.3);animation:ringPulse 2.5s ease-in-out infinite; }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.12);opacity:0} }
        .leaf-icon { animation:leafSpin 4s ease-in-out infinite; }
        @keyframes leafSpin { 0%,100%{transform:rotate(0deg) scale(1)} 25%{transform:rotate(10deg) scale(1.1)} 75%{transform:rotate(-8deg) scale(1.05)} }
        .title-wrap { text-align:center;margin-bottom:32px;animation:titleSlide 0.5s ease both 0.25s; }
        @keyframes titleSlide { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .title-cursor { display:inline-block;width:2px;height:1em;background:#d97706;margin-left:2px;vertical-align:middle;animation:blink 0.8s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .glass-card {
          background:rgba(255,255,255,0.92);border-radius:28px;border:1px solid rgba(231,229,228,0.8);
          padding:32px;backdrop-filter:blur(12px);
          transition:box-shadow 0.4s ease,transform 0.4s ease;
          animation:cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both 0.1s;
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .glass-card:hover { box-shadow:0 20px 60px rgba(0,0,0,0.08),0 0 0 1px rgba(251,191,36,0.1);transform:translateY(-2px); }
        .step-indicator { display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:28px; }
        .step-dot { width:8px;height:8px;border-radius:50%;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        .step-dot.active { width:24px;border-radius:4px;background:#1c1917; }
        .step-dot.done { background:#fbbf24; }
        .step-dot.pending { background:#e7e5e0; }
        .field-wrap { position:relative;margin-bottom:20px; }
        .field-icon { position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#a8a29e;pointer-events:none;transition:color 0.25s; }
        .field-wrap.focused .field-icon { color:#d97706; }
        .field-input {
          width:100%;padding:16px 16px 16px 42px;
          background:#f9f8f5;border:1.5px solid #e7e5e0;border-radius:14px;
          font-size:14px;color:#1c1917;outline:none;
          transition:border-color 0.25s ease,background 0.25s ease,box-shadow 0.25s ease;
          font-family:${AF};
        }
        .field-input:hover { border-color:#d6d3ce; }
        .field-input.focused { border-color:#fbbf24;background:#fff;box-shadow:0 0 0 3px rgba(251,191,36,0.12); }
        .otp-wrap { display:flex;gap:10px;justify-content:center;margin-bottom:20px; }
        .otp-input {
          width:48px;height:56px;text-align:center;
          background:#f9f8f5;border:1.5px solid #e7e5e0;border-radius:14px;
          font-size:22px;font-family:${AF};color:#1c1917;outline:none;
          transition:all 0.25s cubic-bezier(0.16,1,0.3,1);
          caret-color:#d97706;
        }
        .otp-input:focus { border-color:#fbbf24;background:#fff;box-shadow:0 0 0 3px rgba(251,191,36,0.12);transform:translateY(-2px); }
        .otp-input.filled { border-color:#d97706;color:#d97706;background:#fffbeb; }
        .email-hint { text-align:center;margin-bottom:20px;font-size:13px;color:#78716c;font-family:${AF};animation:fadeIn 0.4s ease both; }
        .email-hint strong { color:#1c1917; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .submit-btn {
          width:100%;padding:16px;background:#1c1917;color:#fff;
          border:none;border-radius:16px;font-family:${AF};font-size:13px;
          letter-spacing:0.1em;cursor:pointer;position:relative;overflow:hidden;
          transition:transform 0.2s ease,box-shadow 0.3s ease,background 0.3s ease;
          margin-top:4px;display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .submit-btn:hover { transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,0.2);background:#78350f; }
        .submit-btn:active { transform:scale(0.98); }
        .submit-btn.success { background:#166534;animation:successPop 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes successPop { 0%{transform:scale(1)} 50%{transform:scale(1.04)} 100%{transform:scale(1)} }
        .submit-btn:disabled { opacity:0.55;cursor:not-allowed;transform:none; }
        .ripple { position:absolute;border-radius:50%;background:rgba(255,255,255,0.25);transform:scale(0);animation:rippleAnim 0.7s linear;pointer-events:none;width:60px;height:60px;margin-top:-30px;margin-left:-30px; }
        @keyframes rippleAnim { to{transform:scale(8);opacity:0} }
        .loading-dots span { display:inline-block;width:5px;height:5px;background:#fff;border-radius:50%;margin:0 2px;animation:dotBounce 0.8s ease-in-out infinite; }
        .loading-dots span:nth-child(2){animation-delay:0.15s}
        .loading-dots span:nth-child(3){animation-delay:0.3s}
        @keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:0.5} 50%{transform:translateY(-5px);opacity:1} }
        .arrow-icon { transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .submit-btn:hover .arrow-icon { transform:translateX(4px); }
        .back-btn {
          background:none;border:none;cursor:pointer;color:#a8a29e;
          font-family:${AF};font-size:12px;letter-spacing:0.05em;
          display:flex;align-items:center;gap:4px;margin:0 auto;
          padding:8px 0;transition:color 0.2s;
        }
        .back-btn:hover { color:#1c1917; }
        .resend-row { text-align:center;font-size:13px;color:#78716c;font-family:${AF};margin-top:16px; }
        .resend-btn {
          background:none;border:none;cursor:pointer;color:#d97706;
          font-family:${AF};font-size:13px;font-weight:900;
          text-decoration:underline;text-underline-offset:3px;
          transition:color 0.2s,opacity 0.2s;
        }
        .resend-btn:disabled { opacity:0.4;cursor:default;text-decoration:none; }
        .resend-btn:not(:disabled):hover { color:#b45309; }
        .error-box {
          background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;
          font-size:13px;border-radius:12px;padding:12px 16px;margin-bottom:18px;
          display:flex;align-items:center;gap:8px;font-family:${AF};
          animation:shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both, fadeInErr 0.3s ease both;
        }
        @keyframes shake { 10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(4px)} 30%,50%,70%{transform:translateX(-4px)} 40%,60%{transform:translateX(4px)} }
        @keyframes fadeInErr { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .footer-note { text-align:center;font-size:11px;color:#a8a29e;margin-top:20px;letter-spacing:0.05em;font-family:${AF};animation:fadeUp 0.5s ease both 0.5s; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .security-badge { display:inline-flex;align-items:center;gap:6px;background:rgba(220,252,231,0.6);border:1px solid rgba(134,239,172,0.5);border-radius:20px;padding:4px 12px;color:#166534;font-size:11px;font-family:${AF};letter-spacing:0.05em;animation:badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.6s; }
        @keyframes badgePop { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        .lock-pulse { animation:lockBeat 2s ease-in-out infinite; }
        @keyframes lockBeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
      `}</style>

      <div className="page-wrap">
        <canvas ref={canvasRef} className="bg-canvas" />
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />

        <div className={`card-wrap ${mounted ? '' : 'opacity-0'}`}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div className="logo-wrap">
              <div className="logo-ring" />
              <Leaf className="leaf-icon" style={{ width: 36, height: 36, color: '#fbbf24' }} />
            </div>
          </div>

          <div className="title-wrap">
            <h1 className="af" style={{ fontSize: 34, fontWeight: 900, color: '#1c1917', margin: 0, letterSpacing: '-0.5px' }}>
              {titleText}<span className="title-cursor" />
            </h1>
            <p style={{ color: '#a8a29e', fontSize: 13, marginTop: 6, fontFamily: AF, letterSpacing: '0.04em' }}>
              {step === 'email' ? 'Sign in with your email — no password needed' : 'Enter the 6-digit code we sent you'}
            </p>
          </div>

          <div className="glass-card">
            <div className="step-indicator">
              <div className={`step-dot ${step === 'email' ? 'active' : 'done'}`} />
              <div className={`step-dot ${step === 'otp' ? 'active' : 'pending'}`} />
            </div>

            {error && (
              <div className="error-box">
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#b91c1c', flexShrink: 0 }}>!</span>
                {error}
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSendOtp}>
                <div className={`field-wrap ${focused ? 'focused' : ''}`}>
                  <Mail size={16} className="field-icon" />
                  <input
                    type="email"
                    value={email}
                    required
                    placeholder="your@email.com"
                    className={`field-input ${focused ? 'focused' : ''}`}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                  onClick={addRipple}
                >
                  {ripples.map(rp => <span key={rp.id} className="ripple" style={{ left: rp.x, top: rp.y }} />)}
                  {loading ? (
                    <span className="loading-dots"><span /><span /><span /></span>
                  ) : (
                    <>
                      <span>SEND OTP</span>
                      <ArrowRight size={15} className="arrow-icon" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="email-hint">
                  Code sent to <strong>{email}</strong>
                </div>

                <div className="otp-wrap" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      className={`otp-input ${digit ? 'filled' : ''}`}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`submit-btn ${successPulse ? 'success' : ''}`}
                  onClick={addRipple}
                >
                  {ripples.map(rp => <span key={rp.id} className="ripple" style={{ left: rp.x, top: rp.y }} />)}
                  {loading ? (
                    <span className="loading-dots"><span /><span /><span /></span>
                  ) : (
                    <>
                      <span>VERIFY OTP</span>
                      <KeyRound size={15} className="arrow-icon" />
                    </>
                  )}
                </button>

                <div className="resend-row">
                  Didn't receive it?{' '}
                  <button
                    type="button"
                    className="resend-btn"
                    disabled={resendTimer > 0 || loading}
                    onClick={handleResend}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <div style={{ marginTop: 16 }}>
                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '', '', '']) }}
                  >
                    ← Change email
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="footer-note">
            <span className="security-badge">
              <svg className="lock-pulse" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              END-TO-END ENCRYPTED
            </span>
          </div>
        </div>
      </div>
    </>
  )
}