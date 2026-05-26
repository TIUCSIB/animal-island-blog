import type { Editor } from '@tiptap/core'
import type { CSSProperties } from 'react'
import { useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'

type AdminRichTextColorMenuProps = {
  editor: Editor | null
}

type TextStyleAttributes = {
  color?: string | null
  backgroundColor?: string | null
}

type ColorOption = {
  label: string
  value: string
}

const textColors: ColorOption[] = [
  { label: '松果', value: '#725d42' },
  { label: '薄荷', value: '#19a99d' },
  { label: '蜂蜜', value: '#c88916' },
  { label: '浆果', value: '#c94444' },
  { label: '夜色', value: '#3d3428' },
]

const backgroundColors: ColorOption[] = [
  { label: '奶油', value: '#fff8ec' },
  { label: '薄荷', value: '#e6f9f6' },
  { label: '柠檬', value: '#fff0b8' },
  { label: '樱桃', value: '#ffe0df' },
  { label: '云朵', value: '#f3f0e8' },
]

function readTextStyleAttributes(editor: Editor | null) {
  if (!editor) return { color: '', backgroundColor: '' }

  const attributes = editor.getAttributes('textStyle') as TextStyleAttributes

  return {
    color: attributes.color?.toLowerCase() ?? '',
    backgroundColor: attributes.backgroundColor?.toLowerCase() ?? '',
  }
}

export function AdminRichTextColorMenu({ editor }: AdminRichTextColorMenuProps) {
  const textStyle = useEditorState({
    editor,
    selector: ({ editor: nextEditor }) => readTextStyleAttributes(nextEditor),
  }) ?? readTextStyleAttributes(editor)

  if (!editor) return null

  function applyTextColor(color: string | null) {
    if (!editor) return

    if (color) {
      editor.chain().focus().setColor(color).run()
      return
    }

    editor.chain().focus().unsetColor().removeEmptyTextStyle().run()
  }

  function applyBackgroundColor(color: string | null) {
    if (!editor) return

    if (color) {
      editor.chain().focus().setBackgroundColor(color).run()
      return
    }

    editor.chain().focus().unsetBackgroundColor().removeEmptyTextStyle().run()
  }

  return (
    <BubbleMenu editor={editor} className="island-admin-tiptap-bubble">
      <ColorRow label="字色" options={textColors} value={textStyle.color} onApply={applyTextColor} />
      <ColorRow label="背景" options={backgroundColors} value={textStyle.backgroundColor} onApply={applyBackgroundColor} />
    </BubbleMenu>
  )
}

type ColorRowProps = {
  label: string
  options: ColorOption[]
  value: string
  onApply: (value: string | null) => void
}

function ColorRow({ label, options, value, onApply }: ColorRowProps) {
  return (
    <div className="island-admin-tiptap-bubble__row">
      <span className="island-admin-tiptap-bubble__label">{label}</span>
      <button className={['island-admin-tiptap-swatch island-admin-tiptap-swatch--clear', !value && 'island-admin-tiptap-swatch--active'].filter(Boolean).join(' ')} type="button" onMouseDown={(event) => {
        event.preventDefault()
        onApply(null)
      }}>
        ×
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          className={['island-admin-tiptap-swatch', value === option.value.toLowerCase() && 'island-admin-tiptap-swatch--active'].filter(Boolean).join(' ')}
          type="button"
          title={option.label}
          style={{ '--swatch-color': option.value } as CSSProperties}
          onMouseDown={(event) => {
            event.preventDefault()
            onApply(option.value)
          }}
        />
      ))}
    </div>
  )
}
