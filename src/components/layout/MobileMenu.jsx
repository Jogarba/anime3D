import { NAV_LINKS, EXTERNAL_LINKS } from '../../constants/navigation'

export default function MobileMenu({
  menuOpen,
  onMenuNav,
  onStartClick,
  portalTarget,
}) {
  return (
    <div
      id="mobile-menu"
      className={`mobile-menu${menuOpen ? ' mobile-menu--open' : ''}`}
      aria-hidden={!menuOpen}
      aria-label="Menú de navegación móvil"
    >
      <nav aria-label="Secciones">
        {NAV_LINKS.map((link, index) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className="mobile-menu__link"
            tabIndex={menuOpen ? 0 : -1}
            onClick={(event) => onMenuNav(event, portalTarget(index))}
          >
            <span className="mobile-menu__link-title">{link.label}</span>
            <span className="mobile-menu__link-num">{String(index + 1).padStart(2, '0')}</span>
          </a>
        ))}
      </nav>
      <div className="mobile-menu__actions">
        <a
          className="mobile-menu__btn mobile-menu__btn--primary"
          href={EXTERNAL_LINKS.LOGIN}
          tabIndex={menuOpen ? 0 : -1}
          onClick={onStartClick}
        >
          Start <span aria-hidden="true">→</span>
        </a>
        <a
          className="mobile-menu__btn mobile-menu__btn--ghost"
          href={EXTERNAL_LINKS.BOOK_DEMO}
          target="_blank"
          rel="noreferrer"
          tabIndex={menuOpen ? 0 : -1}
        >
          Book a demo <span aria-hidden="true">↗</span>
        </a>
      </div>
      <p className="mobile-menu__foot">© 2026 Evolut Premium Solutions Inc.</p>
    </div>
  )
}
