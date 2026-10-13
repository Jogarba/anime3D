import { animate } from 'animejs'
import { NAV_LINKS, EXTERNAL_LINKS } from '../../constants/navigation'

export default function Navbar({
  activePortal,
  onNavigate,
  onStartClick,
  onDemoClick,
  menuOpen,
  setMenuOpen,
  portalTarget,
}) {
  return (
    <header className="site-nav">
      <a
        className="site-brand"
        href="#top"
        onClick={(event) => onNavigate(event, 0)}
        aria-label="Evolut, home"
      >
        <img src="/assets/logo-white.png" alt="Evolut Logo" className="site-brand__logo" />
        <span>EVOLUT</span>
      </a>
      <nav aria-label="Main navigation">
        {NAV_LINKS.map((link, index) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={activePortal === index ? 'site-nav__link--active' : ''}
            aria-current={activePortal === index ? 'page' : undefined}
            onClick={(event) => onNavigate(event, portalTarget(index), index)}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="site-nav__actions">
        <a
          className="site-nav__start-btn"
          href={EXTERNAL_LINKS.LOGIN}
          onClick={onStartClick}
          onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.04, duration: 250, ease: 'outQuad' })}
          onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 300, ease: 'outQuad' })}
        >
          Start
        </a>
        <button
          className="site-nav__cta"
          type="button"
          onClick={onDemoClick}
          onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.04, duration: 250, ease: 'outQuad' })}
          onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 300, ease: 'outQuad' })}
        >
          Book a demo <span aria-hidden="true">↗</span>
        </button>
      </div>
      <button
        type="button"
        className={`site-nav__burger${menuOpen ? ' site-nav__burger--open' : ''}`}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  )
}
