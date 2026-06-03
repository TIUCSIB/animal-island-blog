export const lightContentClass = 'text-[14px] text-[#6f5b45]'

export const mobileContentClass = `${lightContentClass} text-[13px] leading-6`

export const islandSwitchButtonClass = [
  'grid place-items-center rounded-full',
  'border-[2.5px] border-[#fff8ed]',
  'bg-[linear-gradient(180deg,rgba(255,251,243,0.98)_0%,rgba(244,233,210,0.98)_100%)]',
  'text-[#715d46]',
  'shadow-[0_4px_0_rgba(190,174,152,0.92),0_14px_26px_rgba(24,20,16,0.18)]',
  'transition-all duration-150 ease-out',
  'hover:bg-[linear-gradient(180deg,rgba(255,253,248,1)_0%,rgba(248,239,219,1)_100%)]',
  'hover:shadow-[0_7px_0_rgba(190,174,152,0.96),0_22px_40px_rgba(24,20,16,0.28)]',
  'hover:scale-[1.18]',
  'hover:text-[#4a3525]',
  'active:translate-y-[1px]',
  'active:shadow-[0_2px_0_rgba(190,174,152,0.88),0_8px_16px_rgba(24,20,16,0.14)]',
  'active:duration-75',
].join(' ')

export const mobileSwitchButtonClass = [
  'absolute top-1/2 z-10 grid size-5 -translate-y-1/2 place-items-center',
  'rounded-full border border-[#fff8ed]',
  'bg-[linear-gradient(180deg,rgba(255,252,246,0.96)_0%,rgba(245,235,214,0.96)_100%)]',
  'text-[#715d46]',
  'shadow-[0_6px_14px_rgba(94,78,56,0.12)]',
  'transition-all duration-150 ease-out',
  'backdrop-blur-md',
].join(' ')


/** Larger hit-area button for prev/next navigation — no scale/translate */
export const postNavButtonClass = [
  'grid place-items-center rounded-full',
  'border-[2.5px] border-[#fff8ed]',
  'bg-[linear-gradient(180deg,rgba(255,251,243,0.98)_0%,rgba(244,233,210,0.98)_100%)]',
  'text-[#715d46]',
  'shadow-[0_4px_0_rgba(190,174,152,0.92),0_14px_26px_rgba(24,20,16,0.18)]',
  'transition-all duration-150 ease-out',
  'hover:bg-[linear-gradient(180deg,rgba(255,253,248,1)_0%,rgba(248,239,219,1)_100%)]',
  'hover:shadow-[0_7px_0_rgba(190,174,152,0.96),0_22px_40px_rgba(24,20,16,0.28)]',
  'hover:text-[#4a3525]',
  'active:shadow-[0_2px_0_rgba(190,174,152,0.88),0_8px_16px_rgba(24,20,16,0.14)]',
  'active:duration-75',
].join(' ')
