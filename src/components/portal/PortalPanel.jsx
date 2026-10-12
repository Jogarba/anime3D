import { animate } from 'animejs'
import TerminalWidget from './widgets/TerminalWidget'
import PipelineFlow from './widgets/PipelineFlow'
import EnvironmentsWidget from './widgets/EnvironmentsWidget'
import TelemetryWidget from './widgets/TelemetryWidget'
import FeatureDetails from './widgets/FeatureDetails'
import FactsList from './widgets/FactsList'
import StatsGrid from './widgets/StatsGrid'
import ComparisonTable from './widgets/ComparisonTable'
import TechHeading from '../common/TechHeading'

export default function PortalPanel({ section, active, isMobile, sectionProgress, portalIndex, navigationTransition, onDemoClick }) {
  const isBusinessCase = section.id === 'business-case'
  const routeMotionClass = navigationTransition?.phase === 'leaving' && navigationTransition.sourceIndex === portalIndex
    ? ' portal-panel--route-exiting'
    : navigationTransition?.phase === 'entering' && navigationTransition.targetIndex === portalIndex
      ? ' portal-panel--route-entering'
      : ''

  return (
    <section
      id={section.id}
      className={`portal-panel${active ? ' portal-panel--active' : ''}${isBusinessCase ? ' portal-panel--wide' : ''}${routeMotionClass}`}
      aria-labelledby={`${section.id}-title`}
      aria-hidden={!isMobile && !active}
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
              <TechHeading
                id={`${section.id}-title`}
                text={section.title}
                lines={section.titleLines}
                active={active}
              />
              <p className="portal-panel__description">{section.description}</p>

              <StatsGrid stats={section.stats} />

              {section.costNote && <p className="portal-cost-note">{section.costNote}</p>}

              {section.closingTitle && (
                <div className="portal-closing-copy">
                  <TechHeading
                    as="h3"
                    className="portal-closing-copy__title"
                    text={section.closingTitle}
                    active={active}
                    fontSize={42}
                    fontWeight={700}
                  />
                  <p>{section.closingDescription}</p>
                </div>
              )}

              {section.cta && (
                <div className="portal-cta-group">
                  {section.secondaryCta && (
                    <a
                      className="portal-cta-secondary"
                      href="#book-demo"
                      onClick={onDemoClick}
                    >
                      {section.secondaryCta}<span aria-hidden="true"> →</span>
                    </a>
                  )}
                  <a
                    className="portal-cta"
                    href="#book-demo"
                    onClick={onDemoClick}
                    onMouseEnter={(e) => animate(e.currentTarget, { scale: 1.04, duration: 250, ease: 'outQuad' })}
                    onMouseLeave={(e) => animate(e.currentTarget, { scale: 1, duration: 300, ease: 'outQuad' })}
                  >
                    {section.cta}<span aria-hidden="true">↗</span>
                  </a>
                  {section.ctaNote && <span>{section.ctaNote}</span>}
                </div>
              )}
            </div>

            <div className="portal-panel__right">
              <ComparisonTable comparisons={section.comparisons} isActive={active} />
            </div>
          </>
        ) : (
          <>
            <p className="portal-panel__eyebrow">
              <span>{section.number}</span> / {section.eyebrow}
            </p>
            <TechHeading
              id={`${section.id}-title`}
              text={section.title}
              lines={section.titleLines}
              active={active}
            />
            <p className="portal-panel__description">{section.description}</p>

            <TerminalWidget terminal={section.terminal} isActive={active} />
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
