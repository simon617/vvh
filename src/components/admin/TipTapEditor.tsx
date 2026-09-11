"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const toolButton =
  "flex w-8 h-8 items-center justify-center text-sm text-text rounded border border-border hover:border-primary hover:text-primary transition-colors";
const toolButtonActive = "bg-primary border-primary text-white";

/**
 * Limited WYSIWYG editor (Decision D4 + TD-12):
 * toolbar = bold, italic, paragraph, heading, link, subscript, superscript — nothing else.
 * The stripped-down StarterKit prevents bullet lists, blockquotes, code etc.
 */
export default function TipTapEditor({
  value,
  onChange,
  placeholder,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        heading: { levels: [2] },
        // TipTap v3 StarterKit already bundles Link; configure it here.
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Subscript,
      Superscript,
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-gray max-w-none min-h-[240px] px-3 py-2 focus:outline-none",
        "data-placeholder": placeholder ?? "",
      },
    },
  });

  // Sync external value changes (e.g. switching locale tabs) without feedback loops.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const isBold = editor.isActive("bold");
  const isItalic = editor.isActive("italic");
  const isHeading = editor.isActive("heading");
  const isParagraph = editor.isActive("paragraph");
  const isSubscript = editor.isActive("subscript");
  const isSuperscript = editor.isActive("superscript");

  function addLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  return (
    <div className="border border-border rounded-md bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5 bg-background-light">
        <button
          type="button"
          title="Bold"
          aria-label="Bold"
          aria-pressed={isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${toolButton} ${isBold ? toolButtonActive : ""}`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          title="Italic"
          aria-label="Italic"
          aria-pressed={isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${toolButton} ${isItalic ? toolButtonActive : ""}`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          title="Paragraph"
          aria-label="Paragraph"
          aria-pressed={isParagraph}
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`${toolButton} ${isParagraph ? toolButtonActive : ""}`}
        >
          ¶
        </button>
        <button
          type="button"
          title="Heading"
          aria-label="Heading"
          aria-pressed={isHeading}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${toolButton} ${isHeading ? toolButtonActive : ""}`}
        >
          H
        </button>
        <button
          type="button"
          title="Link"
          aria-label="Link"
          onClick={addLink}
          className={toolButton}
        >
          🔗
        </button>
        <button
          type="button"
          title="Subscript"
          aria-label="Subscript"
          aria-pressed={isSubscript}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`${toolButton} ${isSubscript ? toolButtonActive : ""}`}
        >
          X<sub>2</sub>
        </button>
        <button
          type="button"
          title="Superscript"
          aria-label="Superscript"
          aria-pressed={isSuperscript}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`${toolButton} ${isSuperscript ? toolButtonActive : ""}`}
        >
          X<sup>2</sup>
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}