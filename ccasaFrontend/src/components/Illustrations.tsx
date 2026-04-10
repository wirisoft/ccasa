'use client'

import type { FC, ReactNode } from 'react'

import type { Mode } from '@core/types'

type ImageObj = {
  src: string
  alt?: string
  className?: string
  height?: number
  width?: number
}

type IllustrationsProp = {
  image1?: ReactNode | ImageObj
  image2?: ReactNode | ImageObj
  maskImg?: ReactNode | ImageObj
  mode?: Mode
}

/** Plantilla Materio: assets bajo public/images retirados del despliegue; sin UI. */
const Illustrations: FC<IllustrationsProp> = () => null

export default Illustrations
