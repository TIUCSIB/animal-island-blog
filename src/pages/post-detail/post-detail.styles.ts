export const lightContentClass =
  'text-[14px] text-[#6f5b45] [&_.ProseMirror]:grid [&_.ProseMirror]:gap-2 [&_p]:m-0 [&_blockquote]:m-0 [&_ul]:my-0 [&_ol]:my-0 [&_a]:text-[#7fb3a7] [&_strong]:text-[#5f4d39] [&_h1]:text-[#5f4d39] [&_h2]:text-[#5f4d39] [&_h3]:text-[#5f4d39] [&_em]:text-[#8d7860] [&_u]:decoration-[#7fb3a7] [&_blockquote]:border-l-[#9ad7c7] [&_blockquote]:text-[#8d7860] [&_code]:bg-[#f2e8d5] [&_code]:text-[#6f8f88] [&_pre]:bg-[#f3ead8] [&_img]:bg-transparent'

export const mobileContentClass = `${lightContentClass} text-[13px] leading-6 text-[#6f5b45] [&_.ProseMirror]:gap-1.5 [&_h1]:text-[1rem] [&_h1]:leading-6 [&_h2]:text-[0.95rem] [&_h2]:leading-6 [&_h3]:text-[0.9rem] [&_h3]:leading-6 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:text-[#6f5b45] [&_li::marker]:text-[#b19d84] [&_blockquote]:border-l-[#aad8ca] [&_blockquote]:pl-3 [&_blockquote]:text-[#8b7860] [&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:rounded-2xl [&_pre]:p-3`

export const islandSwitchButtonClass =
  'grid place-items-center rounded-full border-[2.5px] border-[#fff8ed] bg-[linear-gradient(180deg,rgba(255,251,243,0.98)_0%,rgba(244,233,210,0.98)_100%)] text-[#715d46] shadow-[0_4px_0_rgba(190,174,152,0.92),0_14px_26px_rgba(24,20,16,0.18)] transition-[opacity,box-shadow,background-color] duration-200 hover:bg-[linear-gradient(180deg,rgba(255,253,248,1)_0%,rgba(248,239,219,1)_100%)] hover:shadow-[0_5px_0_rgba(190,174,152,0.94),0_18px_32px_rgba(24,20,16,0.22)] active:shadow-[0_3px_0_rgba(190,174,152,0.9),0_10px_18px_rgba(24,20,16,0.18)]'

export const mobileSwitchButtonClass =
  'absolute top-1/2 z-10 grid size-5 -translate-y-1/2 place-items-center rounded-full border border-[#fff8ed] bg-[linear-gradient(180deg,rgba(255,252,246,0.96)_0%,rgba(245,235,214,0.96)_100%)] text-[#715d46] shadow-[0_6px_14px_rgba(94,78,56,0.12)] transition-opacity duration-200 backdrop-blur-md'
