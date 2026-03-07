"use client"

import React, { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const ToolbarButton = ({
  onClick, active, children, title
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title?: string
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick() }}
    className={`w-7 h-7 flex items-center justify-center rounded transition-all duration-150
      ${active
        ? "bg-[#f5c518] text-[#0a0a0a]"
        : "text-[#888888] hover:text-white hover:bg-white/10"
      }`}
  >
    {children}
  </button>
)

const Divider = () => (
  <div className="w-px h-4 bg-white/10 mx-0.5 self-center" />
)

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value, onChange, placeholder = "Write your film review here..."
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[#f5c518] underline" } }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "outline-none min-h-[280px] text-[#cccccc] text-sm leading-relaxed px-5 py-4"
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync external value changes (e.g. AI improve)
  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const addLink = () => {
    const url = window.prompt("Enter URL")
    if (!url) return
    editor?.chain().focus().setLink({ href: url }).run()
  }

  if (!editor) return null

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden focus-within:border-[#f5c518]/30 transition-colors">

      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-white/5 bg-[#141414]">

        {/* Text style */}
        <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold size={13} />
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic size={13} />
        </ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon size={13} />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <Strikethrough size={13} />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        {([1, 2, 3] as const).map(level => (
          <ToolbarButton
            key={level}
            title={`Heading ${level}`}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            active={editor.isActive("heading", { level })}
          >
            <span className="text-[10px] font-black">H{level}</span>
          </ToolbarButton>
        ))}

        <Divider />

        {/* Lists */}
        <ToolbarButton title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List size={13} />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered size={13} />
        </ToolbarButton>
        <ToolbarButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote size={13} />
        </ToolbarButton>

        <Divider />

        {/* Align */}
        <ToolbarButton title="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          <AlignLeft size={13} />
        </ToolbarButton>
        <ToolbarButton title="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenter size={13} />
        </ToolbarButton>
        <ToolbarButton title="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          <AlignRight size={13} />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton title="Add link" onClick={addLink} active={editor.isActive("link")}>
          <LinkIcon size={13} />
        </ToolbarButton>

        <Divider />

        {/* History */}
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={13} />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={13} />
        </ToolbarButton>

      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

    </div>
  )
}

export default RichTextEditor