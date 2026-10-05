import { animate } from 'animejs'
import TerminalWidget from './widgets/TerminalWidget'
import PipelineFlow from './widgets/PipelineFlow'
import EnvironmentsWidget from './widgets/EnvironmentsWidget'
import TelemetryWidget from './widgets/TelemetryWidget'
import FeatureDetails from './widgets/FeatureDetails'
import FactsList from './widgets/FactsList'
import StatsGrid from './widgets/StatsGrid'
import ComparisonTable from './widgets/ComparisonTable'
import { EXTERNAL_LINKS } from '../../constants/navigation'

export default function PortalPanel({ section, active, isMobile, sectionProgress }) {
  const isBusinessCase = section.id === 'business-case'

  return (
    <section
      id={section.id}
      className={`portal-panel${active ? ' portal-panel--active' : ''}${isBusinessCase ? ' portal-panel--wide' : ''}`}
      aria-labelledby={`${section.id}-title`}
      aria-hidden={!isMobile && !active}
      hidden={!isMobile && !active}
      data-p-from={String(sectionProgress)}
      data-p-to={String(sectionProgress)}
    >
      <div className={`portal-panel__inner${isBusinessCase ? ' portal-panel__inner--2col' : ''}`}>
        {isBusinessCase ? (
          <>
            <div className="portal-panel__left">
              <p className="portal-panel__eyebrow">
                <span>{section.number}</span> / {section.eyebrow}
              </p>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <p className="portal-panel__description">{section.description}</p>

              <StatsGrid stats={section.stats} />

              {section.costNote && <p className="portal-cost-note">{section.costNote}</p>}

              {section.cta && (
                <div className="portal-cta-group">
                  <a
                    className="portal-cta"
                    href={EXTERNAL_LINKS.BOOK_DEMO}
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.04, duration: 250, ease: 'outQuad' })}
                    onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 300, ease: 'outQuad' })}
                  >
                    {section.cta}<span aria-hidden="true">↗</span>
                  </a>
                </div>
              )}
            </div>

            <div className="portal-panel__right">
              <ComparisonTable comparisons={section.comparisons} />
            </div>
          </>
        ) : (
          <>
            <p className="portal-panel__eyebrow">
              <span>{section.number}</span> / {section.eyebrow}
            </p>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            <p className="portal-panel__description">{section.description}</p>

            <TerminalWidget terminal={section.terminal} />
            <PipelineFlow flow={section.flow} />
            <EnvironmentsWidget environments={section.environments} />
            <TelemetryWidget telemetry={section.telemetry} />
            <FactsList facts={section.facts} />
            <FeatureDetails details={section.details} />
          </>
        )}
      </div>
    </section>
  )
}
