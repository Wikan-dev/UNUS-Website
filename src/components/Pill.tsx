import type { PillProps } from '../helper/types.tsx';

export default function Pill({ color, text, textColor, ballColor }: PillProps) {
  return (
    <div className='text-xl w-fit py-2 px-4 flex flex-row items-center rounded-full gap-2' style={{ backgroundColor: color }}>
      <div className='rounded-full w-4 h-4' style={{ backgroundColor: ballColor }} />
      <h1 className='text-xl font-bold' style={textColor ? { color: textColor } : undefined}>{text}</h1>
    </div>
  )
}
