'use client'

const LabAnimation = () => {
  return (
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
        @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
        @keyframes liquidWave { 0% { d: path("M110,380 Q140,370 170,380 Q200,390 230,380 L230,430 Q200,440 170,430 Q140,420 110,430 Z"); } 50% { d: path("M110,380 Q140,390 170,380 Q200,370 230,380 L230,430 Q200,420 170,430 Q140,440 110,430 Z"); } 100% { d: path("M110,380 Q140,370 170,380 Q200,390 230,380 L230,430 Q200,440 170,430 Q140,420 110,430 Z"); } }
        @keyframes drip { 0% { transform: translateY(0); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(40px); opacity: 0; } }
        .lab-b1 { animation: bubble1 3.5s ease-in infinite; }
        .lab-b2 { animation: bubble2 4.2s ease-in 0.8s infinite; }
        .lab-b3 { animation: bubble3 3.8s ease-in 1.6s infinite; }
        .lab-b4 { animation: bubble1 4.5s ease-in 2.2s infinite; }
        .lab-b5 { animation: bubble2 3.2s ease-in 0.4s infinite; }
        .lab-flt { animation: float 4s ease-in-out infinite; }
        .lab-flt2 { animation: float 5s ease-in-out 1s infinite; }
        .lab-pls { animation: pulse 3s ease-in-out infinite; }
        .lab-pls2 { animation: pulse 4s ease-in-out 1.5s infinite; }
        .lab-liq { animation: liquidWave 3s ease-in-out infinite; }
        .lab-drp { animation: drip 2.5s ease-in 1s infinite; }
      `}</style>

      {/* Halos de fondo */}
      <circle cx='580' cy='80' r='120' fill='rgba(21,101,192,0.08)' className='lab-pls' />
      <circle cx='100' cy='520' r='160' fill='rgba(21,101,192,0.05)' className='lab-pls2' />
      <circle cx='400' cy='300' r='80' fill='rgba(255,255,255,0.02)' className='lab-pls' />

      {/* Matraz Erlenmeyer con líquido y burbujas */}
      <g className='lab-flt'>
        <path
          d='M145,280 L145,340 L110,430 Q110,450 130,450 L210,450 Q230,450 230,430 L195,340 L195,280 Z'
          fill='rgba(21,101,192,0.15)'
          stroke='rgba(255,255,255,0.4)'
          strokeWidth='1.5'
          strokeLinejoin='round'
        />
        <line x1='140' y1='280' x2='200' y2='280' stroke='rgba(255,255,255,0.5)' strokeWidth='2' strokeLinecap='round' />
        <path
          d='M110,380 Q140,370 170,380 Q200,390 230,380 L230,430 Q200,440 170,430 Q140,420 110,430 Z'
          fill='rgba(21,101,192,0.35)'
          className='lab-liq'
        />
        <circle cx='150' cy='370' r='4' fill='rgba(255,255,255,0.6)' className='lab-b1' />
        <circle cx='170' cy='390' r='3' fill='rgba(255,255,255,0.5)' className='lab-b2' />
        <circle cx='160' cy='385' r='2.5' fill='rgba(255,255,255,0.4)' className='lab-b3' />
        <circle cx='180' cy='375' r='3.5' fill='rgba(255,255,255,0.5)' className='lab-b4' />
        <circle cx='145' cy='395' r='2' fill='rgba(255,255,255,0.3)' className='lab-b5' />
      </g>

      {/* Vaso de precipitados con solución verde */}
      <g className='lab-flt2'>
        <rect x='420' y='180' rx='4' width='60' height='90' fill='rgba(21,101,192,0.12)' stroke='rgba(255,255,255,0.35)' strokeWidth='1.5' />
        <rect x='415' y='175' rx='2' width='70' height='12' fill='rgba(255,255,255,0.15)' stroke='rgba(255,255,255,0.3)' strokeWidth='1' />
        <rect x='420' y='230' width='60' height='40' fill='rgba(46,125,50,0.3)' rx='0' />
        <circle cx='440' cy='225' r='2' fill='rgba(255,255,255,0.5)' className='lab-b2' />
        <circle cx='455' cy='220' r='1.5' fill='rgba(255,255,255,0.4)' className='lab-b3' />
        <circle cx='448' cy='228' r='2.5' fill='rgba(255,255,255,0.3)' className='lab-b1' />
      </g>

      {/* Medidor de pH */}
      <g className='lab-flt'>
        <circle cx='530' cy='400' r='40' fill='rgba(21,101,192,0.1)' stroke='rgba(255,255,255,0.3)' strokeWidth='1.5' />
        <ellipse cx='530' cy='400' rx='32' ry='32' fill='none' stroke='rgba(255,255,255,0.15)' strokeWidth='0.5' />
        <line x1='530' y1='358' x2='530' y2='350' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' />
        <line x1='530' y1='442' x2='530' y2='450' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' />
        <line x1='488' y1='400' x2='480' y2='400' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' />
        <line x1='572' y1='400' x2='580' y2='400' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' />
        <text x='530' y='406' textAnchor='middle' fill='rgba(255,255,255,0.6)' fontFamily='sans-serif' fontSize='14' fontWeight='500'>pH 7.0</text>
      </g>

      {/* Tubo de ensayo con goteo */}
      <g>
        <path
          d='M320,470 L320,500 Q320,520 340,530 Q360,520 360,500 L360,470'
          fill='rgba(245,124,0,0.2)'
          stroke='rgba(255,255,255,0.3)'
          strokeWidth='1.5'
          className='lab-flt2'
        />
        <circle cx='340' cy='460' r='3' fill='rgba(245,124,0,0.6)' className='lab-drp' />
      </g>

      {/* Fórmulas químicas flotantes */}
      <g className='lab-pls'>
        <text x='80' y='160' fill='rgba(255,255,255,0.08)' fontFamily='sans-serif' fontSize='48' fontWeight='700'>H₂O</text>
      </g>
      <g className='lab-pls2'>
        <text x='440' y='550' fill='rgba(255,255,255,0.06)' fontFamily='sans-serif' fontSize='36' fontWeight='700'>NaCl</text>
      </g>
      <g className='lab-pls'>
        <text x='500' y='140' fill='rgba(255,255,255,0.05)' fontFamily='sans-serif' fontSize='28' fontWeight='700'>CO₂</text>
      </g>

      {/* Termómetro */}
      <g className='lab-flt2'>
        <line x1='290' y1='200' x2='290' y2='280' stroke='rgba(255,255,255,0.2)' strokeWidth='1' />
        <line x1='295' y1='200' x2='295' y2='280' stroke='rgba(255,255,255,0.2)' strokeWidth='1' />
        <circle cx='292' cy='195' r='8' fill='rgba(211,47,47,0.25)' stroke='rgba(255,255,255,0.25)' strokeWidth='1' />
        <rect x='282' y='280' rx='2' width='20' height='6' fill='rgba(211,47,47,0.2)' stroke='rgba(255,255,255,0.2)' strokeWidth='0.5' />
      </g>

      {/* Partículas dispersas */}
      <circle cx='600' cy='250' r='3' fill='rgba(255,255,255,0.15)' className='lab-b1' />
      <circle cx='80' cy='400' r='2' fill='rgba(255,255,255,0.1)' className='lab-b3' />
      <circle cx='350' cy='130' r='2.5' fill='rgba(255,255,255,0.12)' className='lab-b2' />
      <circle cx='250' cy='500' r='1.5' fill='rgba(255,255,255,0.1)' className='lab-b4' />
      <circle cx='500' cy='320' r='2' fill='rgba(255,255,255,0.08)' className='lab-b5' />
    </svg>
  )
}

export default LabAnimation
