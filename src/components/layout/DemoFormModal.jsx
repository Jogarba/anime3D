import { useEffect, useRef, useState } from 'react'

const teamSizes = ['1–5 engineers', '6–20 engineers', '21–50 engineers', '51+ engineers']

export default function DemoFormModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [onClose])

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <dialog
      ref={dialogRef}
      className="demo-overlay"
      aria-labelledby="demo-modal-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}
    >
      <section className="demo-modal">
        <button className="demo-modal__close" type="button" onClick={onClose} aria-label="Close demo form">×</button>
        <p className="demo-modal__eyebrow"><span />EVOLUT / LIVE WALKTHROUGH</p>
        <h2 id="demo-modal-title">Book a Free Demo</h2>
        <div className="demo-modal__badges" aria-label="Demo details">
          <span>30-min session</span><span>No commitment</span><span>Your env runs live</span>
        </div>

        {submitted ? (
          <div className="demo-modal__success" role="status">
            <span className="demo-modal__success-mark">✓</span>
            <h3>Thanks for your interest.</h3>
            <p>Your demo details are ready. Connect this form to the booking service to deliver requests.</p>
          </div>
        ) : (
          <form className="demo-form" onSubmit={handleSubmit}>
            <label className="demo-field">
              <span>Full name</span>
              <input name="name" autoComplete="name" placeholder="Jane Doe" required />
            </label>
            <label className="demo-field">
              <span>Work email</span>
              <input name="email" type="email" autoComplete="email" placeholder="jane@company.com" required />
            </label>
            <label className="demo-field">
              <span>Company</span>
              <input name="company" autoComplete="organization" placeholder="Acme Corp" required />
            </label>
            <label className="demo-field">
              <span>Team size</span>
              <select name="teamSize" defaultValue={teamSizes[0]}>
                {teamSizes.map((size) => <option key={size}>{size}</option>)}
              </select>
            </label>
            <label className="demo-field demo-field--wide">
              <span>Anything else? <em>(optional)</em></span>
              <textarea name="details" rows="3" placeholder="Tell us about your stack, timeline, or any specific requirements..." />
            </label>
            <div className="demo-form__footer">
              <p>No spam. Reply within 24 hours.</p>
              <button className="demo-form__submit" type="submit">Get started <span aria-hidden="true">→</span></button>
            </div>
          </form>
        )}
      </section>
    </dialog>
  )
}
