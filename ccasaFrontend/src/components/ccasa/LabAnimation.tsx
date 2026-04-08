'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type MousePos = { x: number; y: number }

const LabAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState<MousePos>({ x: 0.5, y: 0.5 })
  const animFrameRef = useRef<number>(0)
  const targetRef = useRef<MousePos>({ x: 0.5, y: 0.5 })
  const currentRef = useRef<MousePos>({ x: 0.5, y: 0.5 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const rect = container.getBoundingClientRect()

    targetRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: 0.5, y: 0.5 }
  }, [])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    const animate = () => {
      const lerp = 0.08

      currentRef.current = {
        x: currentRef.current.x + (targetRef.current.x - currentRef.current.x) * lerp,
        y: currentRef.current.y + (targetRef.current.y - currentRef.current.y) * lerp
      }
      setMouse({ ...currentRef.current })
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [handleMouseMove, handleMouseLeave])

  // Offsets parallax por capa (cuanto mayor, más se mueve)
  const offsetX = (mouse.x - 0.5) * 2
  const offsetY = (mouse.y - 0.5) * 2

  const layer1 = `translate(${offsetX * 6}px, ${offsetY * 6}px)`
  const layer2 = `translate(${offsetX * 12}px, ${offsetY * 12}px)`
  const layer3 = `translate(${offsetX * 20}px, ${offsetY * 20}px)`
  const layerBg = `translate(${offsetX * 3}px, ${offsetY * 3}px)`

  // Posición del brillo del cursor
  const glowX = mouse.x * 100
  const glowY = mouse.y * 100

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        cursor: 'default'
      }}
    >
      {/* Brillo que sigue al mouse */}
      <div
        style={{
          position: 'absolute',
          left: `${glowX}%`,
          top: `${glowY}%`,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(21,101,192,0.15) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: 'opacity 0.3s',
          zIndex: 0
        }}
      />

      <svg
        width='100%'
        height='100%'
        viewBox='0 0 680 600'
        xmlns='http://www.w3.org/2000/svg'
        preserveAspectRatio='xMidYMid slice'
        style={{ position: 'absolute', inset: 0, opacity: 0.9 }}
      >
        <style>{`
          @keyframes bubble1 { 0% { transform: translateY(0); opacity: 0.7; } 50% { opacity: 0.9; } 100% { transform: translateY(-180px); opacity: 0; } }
          @keyframes bubble2 { 0% { transform: translateY(0); opacity: 0.5; } 60% { opacity: 0.8; } 100% { transform: translateY(-150px); opacity: 0; } }
          @keyframes bubble3 { 0% { transform: translateY(0); opacity: 0.6; } 40% { opacity: 0.7; } 100% { transform: translateY(-200px); opacity: 0; } }
          @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
          @keyframes drip { 0% { transform: translateY(0); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(40px); opacity: 0; } }
          .lab-b1 { animation: bubble1 3.5s ease-in infinite; }
          .lab-b2 { animation: bubble2 4.2s ease-in 0.8s infinite; }
          .lab-b3 { animation: bubble3 3.8s ease-in 1.6s infinite; }
          .lab-b4 { animation: bubble1 4.5s ease-in 2.2s infinite; }
          .lab-b5 { animation: bubble2 3.2s ease-in 0.4s infinite; }
          .lab-pls { animation: pulse 3s ease-in-out infinite; }
          .lab-pls2 { animation: pulse 4s ease-in-out 1.5s infinite; }
          .lab-drp { animation: drip 2.5s ease-in 1s infinite; }
        `}</style>

        {/* Capa de fondo — se mueve poco (fórmulas y halos) */}
        <g style={{ transform: layerBg }}>
          <circle cx='580' cy='80' r='120' fill='rgba(21,101,192,0.08)' className='lab-pls' />
          <circle cx='100' cy='520' r='160' fill='rgba(21,101,192,0.05)' className='lab-pls2' />
          <circle cx='400' cy='300' r='80' fill='rgba(255,255,255,0.02)' className='lab-pls' />

          <g className='lab-pls'>
            <text x='80' y='160' fill='rgba(255,255,255,0.08)' fontFamily='sans-serif' fontSize='48' fontWeight='700'>H₂O</text>
          </g>
          <g className='lab-pls2'>
            <text x='440' y='550' fill='rgba(255,255,255,0.06)' fontFamily='sans-serif' fontSize='36' fontWeight='700'>NaCl</text>
          </g>
          <g className='lab-pls'>
            <text x='500' y='140' fill='rgba(255,255,255,0.05)' fontFamily='sans-serif' fontSize='28' fontWeight='700'>CO₂</text>
          </g>
        </g>

        {/* Capa media — se mueve moderado (matraz, vaso) */}
        <g style={{ transform: layer1 }}>
          {/* Matraz Erlenmeyer */}
          <g>
            <path
              d='M145,280 L145,340 L110,430 Q110,450 130,450 L210,450 Q230,450 230,430 L195,340 L195,280 Z'
              fill='rgba(21,101,192,0.15)'
              stroke='rgba(255,255,255,0.4)'
              strokeWidth='1.5'
              strokeLinejoin='round'
            />
            <line x1='140' y1='280' x2='200' y2='280' stroke='rgba(255,255,255,0.5)' strokeWidth='2' strokeLinecap='round' />
            <path
              d='M110,385 Q140,375 170,385 Q200,395 230,385 L230,430 Q200,440 170,430 Q140,420 110,430 Z'
              fill='rgba(21,101,192,0.35)'
            />
            <circle cx='150' cy='370' r='4' fill='rgba(255,255,255,0.6)' className='lab-b1' />
            <circle cx='170' cy='390' r='3' fill='rgba(255,255,255,0.5)' className='lab-b2' />
            <circle cx='160' cy='385' r='2.5' fill='rgba(255,255,255,0.4)' className='lab-b3' />
            <circle cx='180' cy='375' r='3.5' fill='rgba(255,255,255,0.5)' className='lab-b4' />
            <circle cx='145' cy='395' r='2' fill='rgba(255,255,255,0.3)' className='lab-b5' />
          </g>

          {/* Termómetro */}
          <g>
            <line x1='290' y1='200' x2='290' y2='280' stroke='rgba(255,255,255,0.2)' strokeWidth='1' />
            <line x1='295' y1='200' x2='295' y2='280' stroke='rgba(255,255,255,0.2)' strokeWidth='1' />
            <circle cx='292' cy='195' r='8' fill='rgba(211,47,47,0.25)' stroke='rgba(255,255,255,0.25)' strokeWidth='1' />
            <rect x='282' y='280' rx='2' width='20' height='6' fill='rgba(211,47,47,0.2)' stroke='rgba(255,255,255,0.2)' strokeWidth='0.5' />
          </g>
        </g>

        {/* Capa cercana — se mueve más (vaso, pH, tubo) */}
        <g style={{ transform: layer2 }}>
          {/* Vaso de precipitados */}
          <g>
            <rect x='420' y='180' rx='4' width='60' height='90' fill='rgba(21,101,192,0.12)' stroke='rgba(255,255,255,0.35)' strokeWidth='1.5' />
            <rect x='415' y='175' rx='2' width='70' height='12' fill='rgba(255,255,255,0.15)' stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
            <rect x='420' y='230' width='60' height='40' fill='rgba(46,125,50,0.3)' rx='0' />
            <circle cx='440' cy='225' r='2' fill='rgba(255,255,255,0.5)' className='lab-b2' />
            <circle cx='455' cy='220' r='1.5' fill='rgba(255,255,255,0.4)' className='lab-b3' />
            <circle cx='448' cy='228' r='2.5' fill='rgba(255,255,255,0.3)' className='lab-b1' />
          </g>

          {/* Medidor de pH */}
          <g>
            <circle cx='530' cy='400' r='40' fill='rgba(21,101,192,0.1)' stroke='rgba(255,255,255,0.3)' strokeWidth='1.5' />
            <ellipse cx='530' cy='400' rx='32' ry='32' fill='none' stroke='rgba(255,255,255,0.15)' strokeWidth='0.5' />
            <line x1='530' y1='358' x2='530' y2='350' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' />
            <line x1='530' y1='442' x2='530' y2='450' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' />
            <line x1='488' y1='400' x2='480' y2='400' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' />
            <line x1='572' y1='400' x2='580' y2='400' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' />
            <text x='530' y='406' textAnchor='middle' fill='rgba(255,255,255,0.6)' fontFamily='sans-serif' fontSize='14' fontWeight='500'>pH 7.0</text>
          </g>
        </g>

        {/* Capa frontal — se mueve mucho (tubo, partículas) */}
        <g style={{ transform: layer3 }}>
          {/* Tubo de ensayo con goteo */}
          <g>
            <path
              d='M320,470 L320,500 Q320,520 340,530 Q360,520 360,500 L360,470'
              fill='rgba(245,124,0,0.2)'
              stroke='rgba(255,255,255,0.3)'
              strokeWidth='1.5'
            />
            <circle cx='340' cy='460' r='3' fill='rgba(245,124,0,0.6)' className='lab-drp' />
          </g>

          {/* Partículas dispersas */}
          <circle cx='600' cy='250' r='3' fill='rgba(255,255,255,0.15)' className='lab-b1' />
          <circle cx='80' cy='400' r='2' fill='rgba(255,255,255,0.1)' className='lab-b3' />
          <circle cx='350' cy='130' r='2.5' fill='rgba(255,255,255,0.12)' className='lab-b2' />
          <circle cx='250' cy='500' r='1.5' fill='rgba(255,255,255,0.1)' className='lab-b4' />
          <circle cx='500' cy='320' r='2' fill='rgba(255,255,255,0.08)' className='lab-b5' />
        </g>
      </svg>
    </div>
  )
}

export default LabAnimation
