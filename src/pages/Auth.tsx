import { useState, useEffect, useRef } from 'react'
import { X, Mail, ShieldCheck, Leaf, ArrowRight, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = 'https://admin.sevencups.in/api'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [closing, setClosing] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const overlayRef = useRef<HTMLDivElement>(null)

  // Reset internal state whenever the modal is (re)opened
  useEffect(() => {
    if (isOpen) {
      setStep('email')
      setEmail('')
      setOtp(['', '', '', '', '', ''])
      setError('')
      setLoading(false)
      setResendTimer(0)
      setClosing(false)
    }
  }, [isOpen])

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [isOpen])

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 160)
  }

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  if (!isOpen) return null

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
      setTimeout(() => otpRefs.current[0]?.focus(), 150)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpStr = otp.join('')
    if (otpStr.length < 6) { setError('Please enter the 6-digit code'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, otp: otpStr }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid code')

      loginWithToken(data.token, data.user)
      handleClose()
      navigate('/')
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
    if (!pasted) return
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
      if (!res.ok) throw new Error(data.message || 'Failed to resend code')
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
        .auth-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: radial-gradient(circle at 50% 20%, rgba(41,26,10,0.55), rgba(17,12,6,0.72));
          backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: overlayFade 0.22s ease both;
        }
        .auth-overlay.closing { animation: overlayFadeOut 0.16s ease both; }
        @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes overlayFadeOut { from { opacity: 1 } to { opacity: 0 } }

        .auth-modal {
          width: 100%; max-width: 400px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 24px 70px rgba(28,17,8,0.28), 0 4px 14px rgba(28,17,8,0.10);
          padding: 36px 32px 30px;
          position: relative;
          overflow: hidden;
          animation: modalIn 0.32s cubic-bezier(0.16,1,0.3,1) both;
        }
        .auth-modal.closing { animation: modalOut 0.16s cubic-bezier(0.4,0,1,1) both; }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes modalOut {
          from { opacity: 1; transform: translateY(0) scale(1) }
          to { opacity: 0; transform: translateY(10px) scale(0.97) }
        }

        .auth-modal::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 5px;
          background: linear-gradient(90deg, #fbbf24, #d97706, #92400e);
        }

        .auth-close {
          position: absolute; top: 18px; right: 18px;
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: #f9f8f5; border: 1px solid #ece9e3; cursor: pointer;
          color: #78716c; transition: background 0.15s, color 0.15s, transform 0.15s;
        }
        .auth-close:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; transform: rotate(90deg); }

        .auth-brand {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
        }
        .auth-brand-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: linear-gradient(135deg, #1c1917, #3a2415);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(28,17,8,0.25);
          position: relative;
          animation: brandPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.05s;
        }
        @keyframes brandPop {
          from { opacity: 0; transform: scale(0.6) rotate(-12deg) }
          to { opacity: 1; transform: scale(1) rotate(0) }
        }
        .auth-brand-ring {
          position: absolute; inset: -5px; border-radius: 20px;
          border: 1.5px solid rgba(217,119,6,0.35);
          animation: ringPulse 2.6s ease-in-out infinite;
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.5 }
          50% { transform: scale(1.1); opacity: 0 }
        }

        .auth-header { text-align: center; margin-bottom: 26px; }
        .auth-title {
          font-size: 21px; font-weight: 700; color: #1c1917; margin: 0 0 6px;
          letter-spacing: -0.3px;
        }
        .auth-subtitle { font-size: 13.5px; color: #78716c; margin: 0; line-height: 1.5; }

        .auth-steps { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 24px; }
        .auth-step-dot { height: 6px; border-radius: 3px; background: #ece9e3; transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        .auth-step-dot.active { width: 22px; background: linear-gradient(90deg, #d97706, #92400e); }
        .auth-step-dot.done { width: 6px; background: #fbbf24; }
        .auth-step-dot.pending { width: 6px; }

        .auth-field { margin-bottom: 18px; }
        .auth-label { display: block; font-size: 12.5px; font-weight: 600; color: #57534e; margin-bottom: 7px; letter-spacing: 0.02em; }
        .auth-input-wrap { position: relative; }
        .auth-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #a8a29e; transition: color 0.15s; pointer-events: none; }
        .auth-input {
          width: 100%; padding: 13px 14px 13px 40px;
          background: #f9f8f5; border: 1.5px solid #ece9e3; border-radius: 12px;
          font-size: 14.5px; color: #1c1917; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus { border-color: #d97706; background: #fff; box-shadow: 0 0 0 4px rgba(217,119,6,0.10); }
        .auth-input:focus ~ .auth-input-icon,
        .auth-input-wrap:focus-within .auth-input-icon { color: #d97706; }
        .auth-input::placeholder { color: #a8a29e; }

        .auth-otp-row { display: flex; gap: 9px; margin-bottom: 20px; justify-content: center; }
        .auth-otp-input {
          width: 46px; height: 54px; text-align: center;
          background: #f9f8f5; border: 1.5px solid #ece9e3; border-radius: 12px;
          font-size: 20px; font-weight: 700; color: #1c1917; outline: none;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          caret-color: #d97706;
        }
        .auth-otp-input:focus { border-color: #d97706; background: #fff; box-shadow: 0 0 0 4px rgba(217,119,6,0.10); transform: translateY(-2px); }
        .auth-otp-input.filled { border-color: #d97706; color: #92400e; background: #fffbeb; }

        .auth-hint { font-size: 13px; color: #78716c; margin-bottom: 20px; text-align: center; }
        .auth-hint strong { color: #1c1917; font-weight: 600; }

        .auth-btn {
          width: 100%; padding: 13px 16px;
          background: linear-gradient(135deg, #1c1917, #2d1a0a);
          color: #fff; border: none; border-radius: 13px;
          font-size: 14.5px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.15s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-shadow: 0 6px 16px rgba(28,17,8,0.18);
        }
        .auth-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2d1a0a, #78350f);
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(28,17,8,0.24);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .auth-btn .btn-arrow { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .auth-btn:hover:not(:disabled) .btn-arrow { transform: translateX(3px); }

        .auth-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg) } }

        .auth-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
          font-size: 13px; border-radius: 11px; padding: 11px 14px; margin-bottom: 18px;
          display: flex; align-items: center; gap: 8px;
          animation: shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px) }
          20%, 80% { transform: translateX(3px) }
          30%, 50%, 70% { transform: translateX(-3px) }
          40%, 60% { transform: translateX(3px) }
        }
        .auth-error-dot {
          width: 16px; height: 16px; border-radius: 50%; background: #fecaca;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; color: #b91c1c; flex-shrink: 0;
        }

        .auth-footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; }
        .auth-link-btn {
          background: none; border: none; cursor: pointer;
          color: #d97706; font-size: 13px; font-weight: 600; padding: 0;
          transition: color 0.15s;
        }
        .auth-link-btn:hover:not(:disabled) { color: #92400e; text-decoration: underline; text-underline-offset: 3px; }
        .auth-link-btn:disabled { color: #c7c2ba; cursor: default; }
        .auth-muted-btn {
          background: none; border: none; cursor: pointer;
          color: #78716c; font-size: 13px; padding: 0; font-weight: 500;
          transition: color 0.15s;
        }
        .auth-muted-btn:hover { color: #1c1917; }

        .auth-security-note {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 24px; padding-top: 18px; border-top: 1px solid #f2efe9;
          font-size: 11.5px; color: #a8a29e; font-weight: 500; letter-spacing: 0.02em;
        }
        .auth-security-note svg { color: #16a34a; }
      `}</style>

      <div
        className={`auth-overlay ${closing ? 'closing' : ''}`}
        ref={overlayRef}
        onMouseDown={(e) => { if (e.target === overlayRef.current) handleClose() }}
      >
        <div className={`auth-modal ${closing ? 'closing' : ''}`} role="dialog" aria-modal="true">
          <button className="auth-close" onClick={handleClose} aria-label="Close">
            <X size={16} />
          </button>

          <div className="auth-brand">
            <div className="auth-brand-icon">
              <div className="auth-brand-ring" />
              <Leaf size={24} color="#fbbf24" strokeWidth={1.8} />
            </div>
          </div>

          <div className="auth-header">
            <h2 className="auth-title">{step === 'email' ? 'Welcome back' : 'Check your email'}</h2>
            <p className="auth-subtitle">
              {step === 'email'
                ? 'Sign in with your email — no password needed.'
                : <>We sent a 6-digit code to <strong>{email}</strong></>}
            </p>
          </div>

          <div className="auth-steps">
            <span className={`auth-step-dot ${step === 'email' ? 'active' : 'done'}`} />
            <span className={`auth-step-dot ${step === 'otp' ? 'active' : 'pending'}`} />
          </div>

          {error && (
            <div className="auth-error">
              <span className="auth-error-dot">!</span>
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-email">EMAIL ADDRESS</label>
                <div className="auth-input-wrap">
                  <Mail size={15} className="auth-input-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    required
                    autoFocus
                    placeholder="you@example.com"
                    className="auth-input"
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? <span className="auth-spinner" /> : (
                  <>
                    Send code
                    <ArrowRight size={15} className="btn-arrow" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="auth-otp-row" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    autoFocus={i === 0}
                    className={`auth-otp-input ${digit ? 'filled' : ''}`}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? <span className="auth-spinner" /> : (
                  <>
                    Verify code
                    <KeyRound size={15} className="btn-arrow" />
                  </>
                )}
              </button>

              <div className="auth-footer-row">
                <button
                  type="button"
                  className="auth-muted-btn"
                  onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '', '', '']) }}
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  className="auth-link-btn"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleResend}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          <div className="auth-security-note">
            <ShieldCheck size={13} />
            Your data is encrypted and never shared
          </div>
        </div>
      </div>
    </>
  )
}