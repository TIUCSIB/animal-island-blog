import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/core'
import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import ImageExtension from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { BackgroundColor, TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Braces, ChevronDown, ChevronUp, Code2, Heading1, Heading2, Heading3, Image, Italic, Link2, List, ListChecks, ListOrdered, Minus, Pilcrow, Quote, Strikethrough, UnderlineIcon } from 'lucide-react'


type AdminRichTextEditorProps = {
  value: string
  maxLength?: number
  placeholder?: string
  onChange: (value: string) => void
  externalEditorRef?: {
    current: Editor | null
  }
}


type InlineMark = 'bold' | 'italic' | 'strike' | 'code' | 'underline'

type ToolbarState = {
  isHeading1: boolean
  isHeading2: boolean
  isHeading3: boolean
  isParagraph: boolean
  isBold: boolean
  isItalic: boolean
  isStrike: boolean
  isBulletList: boolean
  isOrderedList: boolean
  isCodeBlock: boolean
  isBlockquote: boolean
  isCode: boolean
  isUnderline: boolean
  isTaskList: boolean
  isLink: boolean
}

const emptyToolbarState: ToolbarState = {
  isHeading1: false,
  isHeading2: false,
  isHeading3: false,
  isParagraph: false,
  isBold: false,
  isItalic: false,
  isStrike: false,
  isBulletList: false,
  isOrderedList: false,
  isCodeBlock: false,
  isBlockquote: false,
  isCode: false,
  isUnderline: false,
  isTaskList: false,
  isLink: false,
}

function hasNamedMark(marks: readonly { type: { name: string } }[] | null | undefined, mark: InlineMark | 'link') {
  return Boolean(marks?.some((storedMark) => storedMark.type.name === mark))
}

function readHTML(editor: Editor) {
  return editor.getHTML().trimEnd()
}

function readTextLength(editor: Editor) {
  const storage = editor.storage.characterCount as { characters?: () => number }
  return storage.characters?.() ?? editor.state.doc.textContent.length
}

function isMarkActive(editor: Editor | null, mark: InlineMark | 'link') {
  if (!editor) return false

  return editor.isActive(mark) || hasNamedMark(editor.state.storedMarks, mark)
}

function readToolbarState(editor: Editor | null): ToolbarState {
  if (!editor) return emptyToolbarState

  return {
    isHeading1: editor.isActive('heading', { level: 1 }),
    isHeading2: editor.isActive('heading', { level: 2 }),
    isHeading3: editor.isActive('heading', { level: 3 }),
    isParagraph: editor.isActive('paragraph'),
    isBold: isMarkActive(editor, 'bold'),
    isItalic: isMarkActive(editor, 'italic'),
    isStrike: isMarkActive(editor, 'strike'),
    isBulletList: editor.isActive('bulletList'),
    isOrderedList: editor.isActive('orderedList'),
    isCodeBlock: editor.isActive('codeBlock'),
    isBlockquote: editor.isActive('blockquote'),
    isCode: isMarkActive(editor, 'code'),
    isUnderline: isMarkActive(editor, 'underline'),
    isTaskList: editor.isActive('taskList'),
    isLink: isMarkActive(editor, 'link'),
  }
}

export function AdminRichTextEditor({ value, maxLength = 200, placeholder = '这一刻，你想说点什么...', onChange, externalEditorRef }: AdminRichTextEditorProps) {
  const syncingRef = useRef(false)
  const composingRef = useRef(false)
  const editorRef = useRef<Editor | null>(null)
  const normalizingEmptyRef = useRef(false)
  const [expanded, setExpanded] = useState(false)
  const [textLength, setTextLength] = useState(0)
  const [toolbarVersion, refreshToolbar] = useState(0)
  const [openColorPicker, setOpenColorPicker] = useState<'text' | 'bg' | null>(null)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        trailingNode: false,
      }),
      TextStyle,
      Color.configure({
        types: [TextStyle.name],
      }),
      BackgroundColor.configure({
        types: [TextStyle.name],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      ImageExtension.configure({
        inline: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'island-admin-tiptap-content',
      },
      handleDOMEvents: {
        compositionstart: () => {
          composingRef.current = true
          return false
        },
        compositionend: (view) => {
          composingRef.current = false
          queueMicrotask(() => {
            const nextEditor = view.dom.closest('.island-admin-tiptap-shell') ? editorRef.current : null
            if (!nextEditor || syncingRef.current) return

            setTextLength(readTextLength(nextEditor))
            onChange(readHTML(nextEditor))
          })
          return false
        },
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      const nextTextLength = readTextLength(nextEditor)

      setTextLength(nextTextLength)
      if (!composingRef.current && nextTextLength === 0) normalizeEmptyEditor(nextEditor)
      if (composingRef.current) return
      if (!syncingRef.current) onChange(readHTML(nextEditor))
    },
    onCreate: ({ editor: nextEditor }) => {
      editorRef.current = nextEditor
      if (externalEditorRef) externalEditorRef.current = nextEditor
      setTextLength(readTextLength(nextEditor))
    },
  })
  const liveToolbarState = useEditorState({
    editor,
    selector: ({ editor: nextEditor }) => readToolbarState(nextEditor),
  })
  const toolbarState = liveToolbarState ?? readToolbarState(editor)

  useEffect(() => {
    editorRef.current = editor
    if (externalEditorRef) externalEditorRef.current = editor

    return () => {
      if (externalEditorRef?.current === editor) externalEditorRef.current = null
    }
  }, [editor, externalEditorRef])

  useEffect(() => {
    if (!editor) return
    if (composingRef.current) return

    const nextValue = value || ''
    if (readHTML(editor) === nextValue.trimEnd()) return

    syncingRef.current = true
    editor.commands.setContent(nextValue)
    setTextLength(readTextLength(editor))
    queueMicrotask(() => {
      syncingRef.current = false
    })
  }, [editor, value])

  useEffect(() => {
    if (!editor) return

    const refresh = () => refreshToolbar((current) => current + 1)

    editor.on('selectionUpdate', refresh)
    editor.on('transaction', refresh)

    return () => {
      editor.off('selectionUpdate', refresh)
      editor.off('transaction', refresh)
    }
  }, [editor])

  function toggleInlineMark(mark: InlineMark) {
    if (!editor) return

    switch (mark) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'strike':
        editor.chain().focus().toggleStrike().run()
        break
      case 'code':
        editor.chain().focus().toggleCode().run()
        break
      case 'underline':
        editor.chain().focus().toggleUnderline().run()
        break
    }

    queueMicrotask(() => refreshToolbar((current) => current + 1))
    window.requestAnimationFrame(() => refreshToolbar((current) => current + 1))
  }

  function setLink() {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('链接地址，留空则移除', previousUrl ?? '')

    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  function setImage() {
    if (!editor) return

    const url = window.prompt('图片地址')
    if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run()
  }

  function normalizeEmptyEditor(nextEditor: Editor) {
    if (normalizingEmptyRef.current) return

    normalizingEmptyRef.current = true
    nextEditor.chain().unsetAllMarks().clearNodes().setParagraph().run()
    nextEditor.view.dispatch(nextEditor.state.tr.setStoredMarks(null))
    queueMicrotask(() => {
      normalizingEmptyRef.current = false
      refreshToolbar((current) => current + 1)
    })
  }

  const hasContent = textLength > 0 || toolbarVersion > 0

  return (
    <>
      <div className={['island-admin-compose-toolbar island-admin-compose-toolbar--simple mt-3 border-b-2 border-[#c4b89e]/20 pb-3', expanded && 'island-admin-compose-toolbar--expanded'].filter(Boolean).join(' ')}>
        <div className="island-admin-tiptap-toolbar-row">
          <ToolbarButton active={hasContent && toolbarState.isHeading1} label="标题 1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={hasContent && toolbarState.isHeading2} label="标题 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={hasContent && toolbarState.isHeading3} label="标题 3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={hasContent && toolbarState.isParagraph} label="正文" onClick={() => editor?.chain().focus().setParagraph().run()}>
            <Pilcrow size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState.isBold} label="加粗" onClick={() => toggleInlineMark('bold')}>
            <Bold size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState.isItalic} label="斜体" onClick={() => toggleInlineMark('italic')}>
            <Italic size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={toolbarState.isStrike} label="删除线" onClick={() => toggleInlineMark('strike')}>
            <Strikethrough size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={hasContent && toolbarState.isBulletList} label="无序列表" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={hasContent && toolbarState.isOrderedList} label="有序列表" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={hasContent && toolbarState.isCodeBlock} label="代码块" onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
            <Code2 size={16} strokeWidth={2.8} />
          </ToolbarButton>
          <ToolbarButton active={expanded} label={expanded ? '收起工具' : '展开工具'} onClick={() => setExpanded((open) => !open)}>
            {expanded ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
          </ToolbarButton>
        </div>

        {expanded ? (
          <div className="island-admin-tiptap-toolbar-row island-admin-tiptap-toolbar-row--extra">
            <ToolbarButton active={hasContent && toolbarState.isBlockquote} label="引用" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
              <Quote size={16} strokeWidth={2.8} />
            </ToolbarButton>
            <ToolbarButton active={toolbarState.isCode} label="行内代码" onClick={() => toggleInlineMark('code')}>
              <Braces size={16} strokeWidth={2.8} />
            </ToolbarButton>
            <ToolbarButton label="分割线" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
              <Minus size={16} strokeWidth={2.8} />
            </ToolbarButton>
            <ToolbarButton active={toolbarState.isUnderline} label="下划线" onClick={() => toggleInlineMark('underline')}>
              <UnderlineIcon size={16} strokeWidth={2.8} />
            </ToolbarButton>
            <ToolbarButton active={hasContent && toolbarState.isTaskList} label="任务列表" onClick={() => editor?.chain().focus().toggleTaskList().run()}>
              <ListChecks size={16} strokeWidth={2.8} />
            </ToolbarButton>
            <ToolbarButton active={toolbarState.isLink} label="链接" onClick={setLink}>
              <Link2 size={16} strokeWidth={2.8} />
            </ToolbarButton>
            <ToolbarButton label="正文图片" onClick={setImage}>
              <Image size={16} strokeWidth={2.8} />
            </ToolbarButton>
            <ColorPickerButton label="字色" type="text" editor={editor} isOpen={openColorPicker === 'text'} onToggle={() => setOpenColorPicker((p) => p === 'text' ? null : 'text')} />
            <ColorPickerButton label="底色" type="bg" editor={editor} isOpen={openColorPicker === 'bg'} onToggle={() => setOpenColorPicker((p) => p === 'bg' ? null : 'bg')} />
          </div>
        ) : null}
      </div>

      <div className="island-admin-tiptap-shell">
        <EditorContent editor={editor} />
        <span className={['island-admin-tiptap-count', textLength > maxLength && 'island-admin-tiptap-count--over'].filter(Boolean).join(' ')}>
          {textLength} / {maxLength}
        </span>
      </div>
    </>
  )
}

type ToolbarButtonProps = {
  active?: boolean
  label: string
  children: ReactNode
  onClick: () => void
}

function ToolbarButton({ active, label, children, onClick }: ToolbarButtonProps) {
  return (
    <button
      className={['island-admin-compose-icon', active && 'island-admin-compose-icon--active'].filter(Boolean).join(' ')}
      type="button"
      aria-label={label}
      aria-pressed={Boolean(active)}
      onMouseDown={(event) => {
        event.preventDefault()
        onClick()
      }}
    >
      {children}
    </button>
  )
}

type ColorPickerButtonProps = {
  label: string
  type: 'text' | 'bg'
  editor: Editor | null
  isOpen: boolean
  onToggle: () => void
}

const TEXT_COLORS = ['#725d42', '#19a99d', '#c88916', '#c94444', '#3d3428']
const BG_COLORS = ['#fff8ec', '#e6f9f6', '#fff0b8', '#ffe0df', '#f3f0e8']

function ColorPickerButton({ label, type, editor, isOpen, onToggle }: ColorPickerButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const colors = type === 'text' ? TEXT_COLORS : BG_COLORS

  const currentColor = (editor?.getAttributes('textStyle') as { color?: string; backgroundColor?: string })[type === 'text' ? 'color' : 'backgroundColor']?.toLowerCase() ?? ''

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onToggle()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onToggle])

  function applyColor(color: string) {
    if (!editor) return
    if (type === 'text') {
      editor.chain().focus().setColor(color).run()
    } else {
      editor.chain().focus().setBackgroundColor(color).run()
    }
    onToggle()
  }

  function clearColor() {
    if (!editor) return
    if (type === 'text') {
      editor.chain().focus().unsetColor().removeEmptyTextStyle().run()
    } else {
      editor.chain().focus().unsetBackgroundColor().removeEmptyTextStyle().run()
    }
    onToggle()
  }

  return (
    <div className="relative" ref={containerRef}>
      <ToolbarButton label={label} onClick={onToggle}>
        {type === 'text' ? (
          <span style={{ fontFamily: 'inherit', fontWeight: 950, fontSize: '16px', color: '#725d42' }}>A</span>
        ) : (
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, border: '2px solid #c4b89e', background: '#fff0b8' }} />
        )}
      </ToolbarButton>
      {isOpen ? (
        <div className="island-admin-tiptap-bubble" style={{ position: 'absolute', left: 0, top: '100%', marginTop: 4, zIndex: 50, padding: '6px 8px' }}>
          <div className="island-admin-tiptap-bubble__row" style={{ flexWrap: 'nowrap', gap: 4 }}>
            
            <button
              className={['island-admin-tiptap-swatch island-admin-tiptap-swatch--clear', !currentColor && 'island-admin-tiptap-swatch--active'].filter(Boolean).join(' ')}
              type="button"
              title="清除"
              onMouseDown={(e) => { e.preventDefault(); clearColor() }}
            >
              &times;
            </button>
            {colors.map((c) => (
              <button
                key={c}
                className={['island-admin-tiptap-swatch', currentColor === c.toLowerCase() && 'island-admin-tiptap-swatch--active'].filter(Boolean).join(' ')}
                type="button"
                title={c}
                style={{ '--swatch-color': c } as React.CSSProperties}
                onMouseDown={(e) => { e.preventDefault(); applyColor(c) }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}