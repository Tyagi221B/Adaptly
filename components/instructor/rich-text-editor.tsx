"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { common, createLowlight } from "lowlight";
import TurndownService from "turndown";
import MarkdownIt from "markdown-it";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Braces,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
}

const lowlight = createLowlight(common);

const md = new MarkdownIt();
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// Preserve code blocks properly
turndownService.addRule("fencedCodeBlock", {
  filter: function (node: HTMLElement) {
    return (
      node.nodeName === "PRE" &&
      !!node.firstChild &&
      node.firstChild.nodeName === "CODE"
    );
  },
  replacement: function (_content: string, node: HTMLElement) {
    const codeElement = node.firstChild as HTMLElement;
    const className = codeElement.getAttribute("class") || "";
    const language = className.replace("language-", "");
    return "\n```" + language + "\n" + codeElement.textContent + "\n```\n";
  },
});

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        bulletList: false, // We'll configure manually for better markdown shortcuts
        orderedList: false, // We'll configure manually for better markdown shortcuts
        listItem: false, // We'll configure manually for better markdown shortcuts
      }),
      // Lists with proper markdown shortcuts
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc list-outside ml-6',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal list-outside ml-6',
        },
      }),
      ListItem,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "What's the title?";
          }
          return "Start writing... Try markdown shortcuts: # for heading, - for list, ** for bold, ` for code";
        },
      }),
      Typography,
    ],
    content: value ? md.render(value) : "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[400px] p-6 border rounded-lg bg-white transition-all focus-within:border-blue-500 focus-within:shadow-sm",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentMarkdown = turndownService.turndown(editor.getHTML());
      if (currentMarkdown !== value && value !== "") {
        editor.commands.setContent(md.render(value));
      }
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
        {/* Headings */}
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="gap-1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="gap-1"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="gap-1"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        {/* Text formatting */}
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="gap-1"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="gap-1"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("code") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="gap-1"
          title="Inline Code (Ctrl+E)"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="gap-1"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="gap-1"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        {/* Other */}
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="gap-1"
          title="Quote (Ctrl+Shift+B)"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("codeBlock") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className="gap-1"
          title="Code Block (Ctrl+Alt+C)"
        >
          <Braces className="h-4 w-4" />
          <span className="text-xs">Code</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="gap-1"
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="gap-1"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="gap-1"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>
          💡 <span className="font-medium">Markdown shortcuts:</span> Type{" "}
          <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">#</kbd> + space for heading,{" "}
          <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">-</kbd> or{" "}
          <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">1.</kbd> + space for lists,{" "}
          <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">**text**</kbd> for bold
        </p>
      </div>
    </div>
  );
}
