import Image from 'next/image'

const Logo = ({ className }: { className?: string }) => {
  return (
    <Image src='/logo.png' alt='Logo' width={28} height={28} className={className} priority />
  )
}

export default Logo
