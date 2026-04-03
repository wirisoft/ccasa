const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width='28'
      height='28'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M9 3H15M10 3V8.4C10 8.68 9.86 8.94 9.63 9.11L4.37 12.89C4.14 13.06 4 13.32 4 13.6V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V13.6C20 13.32 19.86 13.06 19.63 12.89L14.37 9.11C14.14 8.94 14 8.68 14 8.4V3'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8 15H16'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <circle cx='10' cy='18' r='1' fill='currentColor' />
      <circle cx='14' cy='17' r='0.75' fill='currentColor' />
    </svg>
  )
}

export default Logo
