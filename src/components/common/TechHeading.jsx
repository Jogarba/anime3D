import TechText from './TechText'

export default function TechHeading({
  as: Heading = 'h2',
  id,
  text,
  lines,
  active = false,
  className = '',
  fontSize = 84,
  fontWeight = 800,
  accentColor = '#38bdf8',
  colors = [],
}) {
  const headingLines = lines?.length ? lines : [text]
  const accessibleText = text || headingLines.join(' ')

  return (
    <Heading id={id} className={`tech-heading ${className}`.trim()}>
      <span className="visually-hidden">{accessibleText}</span>
      <span className="tech-heading__visual" aria-hidden="true">
        {headingLines.map((line, index) => (
          <TechText
            key={`${index}-${line}`}
            className="tech-heading__line"
            text={line}
            fontSize={fontSize}
            fontWeight={fontWeight}
            letterSpacing={-0.035}
            color={colors[index] || '#ffffff'}
            accentColor={accentColor}
            reach={150}
            softness={0.72}
            specks={10}
            selection
            labels
            draggable={false}
            sweep={active}
          />
        ))}
      </span>
    </Heading>
  )
}
