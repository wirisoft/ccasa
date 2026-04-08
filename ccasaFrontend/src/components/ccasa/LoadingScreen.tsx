'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const LOADING_MESSAGES = [
  'Preparando el laboratorio…',
  'Cargando bitácoras…',
  'Verificando credenciales…',
  'Calibrando instrumentos…'
]

type LoadingScreenProps = {
  /** Cuando pasa a true, inicia el fade out. El componente llama a onFadeOutComplete cuando termina. */
  fadeOut?: boolean
  /** Callback cuando la animación de fade out terminó. */
  onFadeOutComplete?: () => void
}

const LoadingScreen = ({ fadeOut = false, onFadeOutComplete }: LoadingScreenProps) => {
  const [messageIndex, setMessageIndex] = useState(0)
  const [opacity, setOpacity] = useState(0)

  // Fade in al montar
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setOpacity(1)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  // Fade out cuando se pide
  useEffect(() => {
    if (!fadeOut) return

    setOpacity(0)

    const timer = setTimeout(() => {
      onFadeOutComplete?.()
    }, 600) // Debe coincidir con la duración de la transición CSS

    return () => clearTimeout(timer)
  }, [fadeOut, onFadeOutComplete])

  // Mensajes rotativos
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(160deg, #0D2137 0%, #132F4C 50%, #1565C0 100%)',
        gap: 4,
        opacity,
        transition: 'opacity 0.6s ease-in-out'
      }}
    >
      {/* Matraz animado */}
      <Box sx={{ position: 'relative', width: 120, height: 140 }}>
        <svg
          width='120'
          height='140'
          viewBox='0 0 120 140'
          xmlns='http://www.w3.org/2000/svg'
        >
          <style>{`
            @keyframes loadBubble1 { 0% { transform: translateY(0); opacity: 0.8; } 100% { transform: translateY(-50px); opacity: 0; } }
            @keyframes loadBubble2 { 0% { transform: translateY(0); opacity: 0.6; } 100% { transform: translateY(-40px); opacity: 0; } }
            @keyframes loadBubble3 { 0% { transform: translateY(0); opacity: 0.7; } 100% { transform: translateY(-45px); opacity: 0; } }
            @keyframes liquidPulse { 0% { opacity: 0.4; } 50% { opacity: 0.6; } 100% { opacity: 0.4; } }
            @keyframes flaskGlow { 0% { filter: drop-shadow(0 0 8px rgba(21,101,192,0.3)); } 50% { filter: drop-shadow(0 0 20px rgba(21,101,192,0.6)); } 100% { filter: drop-shadow(0 0 8px rgba(21,101,192,0.3)); } }
            .lb1 { animation: loadBubble1 1.8s ease-in infinite; }
            .lb2 { animation: loadBubble2 2.2s ease-in 0.5s infinite; }
            .lb3 { animation: loadBubble3 2s ease-in 1s infinite; }
            .lb4 { animation: loadBubble1 2.5s ease-in 1.3s infinite; }
            .liq-pulse { animation: liquidPulse 2s ease-in-out infinite; }
            .flask-glow { animation: flaskGlow 2.5s ease-in-out infinite; }
          `}</style>

          <g className='flask-glow'>
            <path
              d='M42,30 L42,55 L15,115 Q12,125 22,128 L98,128 Q108,125 105,115 L78,55 L78,30 Z'
              fill='rgba(21,101,192,0.2)'
              stroke='rgba(255,255,255,0.6)'
              strokeWidth='2'
              strokeLinejoin='round'
            />
            <line x1='38' y1='30' x2='82' y2='30' stroke='rgba(255,255,255,0.7)' strokeWidth='2.5' strokeLinecap='round' />
            <path
              d='M20,95 Q40,88 60,95 Q80,102 100,95 L105,115 Q108,125 98,128 L22,128 Q12,125 15,115 Z'
              fill='rgba(21,101,192,0.45)'
              className='liq-pulse'
            />
            <circle cx='45' cy='100' r='4' fill='rgba(255,255,255,0.7)' className='lb1' />
            <circle cx='65' cy='105' r='3' fill='rgba(255,255,255,0.5)' className='lb2' />
            <circle cx='55' cy='95' r='2.5' fill='rgba(255,255,255,0.6)' className='lb3' />
            <circle cx='72' cy='98' r='3.5' fill='rgba(255,255,255,0.4)' className='lb4' />
          </g>
        </svg>
      </Box>

      {/* Nombre */}
      <Typography
        variant='h5'
        sx={{
          color: '#FFFFFF',
          fontWeight: 700,
          letterSpacing: 1,
          transform: opacity === 1 ? 'translateY(0)' : 'translateY(10px)',
          transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
          opacity: opacity
        }}
      >
        Bitácoras Servicios Ambientales
      </Typography>

      {/* Barra de progreso */}
      <Box
        sx={{
          width: 200,
          height: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.15)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: '40%',
            height: '100%',
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.7)',
            animation: 'loadingBar 1.5s ease-in-out infinite',
            '@keyframes loadingBar': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(350%)' }
            }
          }}
        />
      </Box>

      {/* Mensaje rotativo con transición */}
      <Box sx={{ minHeight: 24, display: 'flex', alignItems: 'center' }}>
        <Typography
          key={messageIndex}
          variant='body2'
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.85rem',
            animation: 'messageFade 2s ease-in-out',
            '@keyframes messageFade': {
              '0%': { opacity: 0, transform: 'translateY(5px)' },
              '15%': { opacity: 1, transform: 'translateY(0)' },
              '85%': { opacity: 1, transform: 'translateY(0)' },
              '100%': { opacity: 0, transform: 'translateY(-5px)' }
            }
          }}
        >
          {LOADING_MESSAGES[messageIndex]}
        </Typography>
      </Box>
    </Box>
  )
}

export default LoadingScreen
