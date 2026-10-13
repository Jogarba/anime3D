import useTechTextCanvas from '../../hooks/useTechTextCanvas'

const TechText = ({
  text = 'React Bits',
  fontFamily = '',
  fontWeight = 600,
  fontSize = 150,
  letterSpacing = -0.05,
  color = '#ffffff',
  accentColor = '#ffffff',
  reach = 200,
  softness = 0.7,
  dashLength = 4,
  dashGap = 2,
  strokeWidth = 1.5,
  lineStyle = 'dashed',
  reveal = 'letter',
  specks = 15,
  selection = true,
  labels = true,
  draggable = true,
  sweep = true,
  speed = 1,
  className = '',
  style,
}) => {
  const { containerRef, canvasRef } = useTechTextCanvas({
    text,
    fontFamily,
    fontWeight,
    fontSize,
    letterSpacing,
    color,
    accentColor,
    reach,
    softness,
    dashLength,
    dashGap,
    strokeWidth,
    lineStyle,
    reveal,
    specks,
    selection,
    labels,
    draggable,
    sweep,
    speed,
  })

  return (
    <span ref={containerRef} className={`tech-text ${className}`.trim()} style={style} role="img" aria-label={text}>
      <canvas ref={canvasRef} className="tech-text-canvas" />
    </span>
  )
}

export default TechText
