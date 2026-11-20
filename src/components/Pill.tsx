import type { PillProps } from '../helper/types.tsx';

export default function Pill({ color, text, textColor, ballColor }: PillProps) {
  return (
    <div
      className='inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full text-xs font-semibold tracking-wide w-fit shadow-xs'
      style={{ backgroundColor: color }}
    >
      <span className='w-2 h-2 rounded-full shrink-0' style={{ backgroundColor: ballColor }} />
      <span style={textColor ? { color: textColor } : { color: '#0F2027' }}>{text}</span>
    </div>
  );
}
