import { ReactRenderer } from "@tiptap/react";
import type { Editor, Range } from "@tiptap/core";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
  Type,
  Link as LinkIcon,
} from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SlashCommandContext {
  editor: Editor;
  range: Range;
}

interface LinkFormProps {
  initialLabel: string;
  initialUrl: string;
  onSubmit: (label: string, url: string) => void;
  onCancel: () => void;
}

const LinkForm: React.FC<LinkFormProps> = ({
  initialLabel,
  initialUrl,
  onSubmit,
  onCancel,
}) => {
  const [label, setLabel] = useState(initialLabel);
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(label.trim(), url.trim());
  };

  return (
    <div className="w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-medium text-gray-800">Insert link</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          autoFocus
          type="text"
          placeholder="Link text (e.g. Asmit Tyagi)"
          className="text-gray-900 placeholder:text-gray-400"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Input
          type="url"
          placeholder="https://example.com"
          className="text-gray-900 placeholder:text-gray-400"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!url.trim()}>
            Add
          </Button>
        </div>
      </form>
    </div>
  );
};

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (props: SlashCommandContext) => void;
}

const openLinkPopup = (editor: Editor, range: Range) => {
  let popup: TippyInstance[] | null = null;
  let renderer:
    | ReactRenderer<
        { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
        LinkFormProps
      >
    | null = null;

  const cleanup = () => {
    if (popup) {
      popup.forEach((instance) => instance.destroy());
    }
    renderer?.destroy();
  };

  const existingHref = (editor.getAttributes("link").href as string | undefined) || "";

  renderer = new ReactRenderer(LinkForm, {
    editor,
    props: {
      initialLabel: "",
      initialUrl: existingHref || "https://",
      onSubmit: (rawLabel: string, rawUrl: string) => {
        if (!rawUrl) {
          cleanup();
          return;
        }

        const label = rawLabel || rawUrl;
        let href = rawUrl.trim();
        if (!/^https?:\/\//i.test(href)) {
          href = `https://${href}`;
        }

        const escapeHtml = (value: string) =>
          value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

        const safeHref = escapeHtml(href);
        const safeLabel = escapeHtml(label.trim() || href);

        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent(`<a href="${safeHref}">${safeLabel}</a>`)
          .run();

        cleanup();
      },
      onCancel: cleanup,
    },
  });

  const start = range.from;
  const coords = editor.view.coordsAtPos(start);
  const clientRect = () =>
    new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top || 24);

  popup = tippy("body", {
    getReferenceClientRect: clientRect,
    appendTo: () => document.body,
    content: renderer.element,
    showOnCreate: true,
    interactive: true,
    trigger: "manual",
    placement: "bottom-start",
  });
};

export const slashCommands: SlashCommandItem[] = [
  {
    title: "Text",
    description: "Start writing with plain text",
    icon: Type,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("paragraph")
        .run();
    },
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: List,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBulletList()
        .run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleOrderedList()
        .run();
    },
  },
  {
    title: "Quote",
    description: "Add a blockquote",
    icon: Quote,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: "Code Block",
    description: "Add a code block with syntax highlighting",
    icon: Code,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleCodeBlock()
        .run();
    },
  },
  {
    title: "Link",
    description: "Insert a hyperlink",
    icon: LinkIcon,
    command: ({ editor, range }) => {
      openLinkPopup(editor, range);
    },
  },
  {
    title: "Divider",
    description: "Add a horizontal divider",
    icon: Minus,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHorizontalRule()
        .run();
    },
  },
];

interface SlashCommandsListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export const SlashCommandsList = forwardRef<
  { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
  SlashCommandsListProps
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const clampedSelectedIndex = Math.min(
    selectedIndex,
    Math.max(props.items.length - 1, 0)
  );

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((prev) =>
      props.items.length === 0
        ? 0
        : (prev + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((prev) =>
      props.items.length === 0 ? 0 : (prev + 1) % props.items.length
    );
  };

  const enterHandler = () => {
    selectItem(clampedSelectedIndex);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="z-50 max-h-100 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
      <div className="px-2 py-2">
        {props.items.length ? (
          props.items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                type="button"
                className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => selectItem(index)}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-3 py-2 text-sm text-gray-500">No results</div>
        )}
      </div>
    </div>
  );
});

SlashCommandsList.displayName = "SlashCommandsList";

interface SlashCommandRendererProps {
  editor: Editor;
  range: Range;
  clientRect?: () => DOMRect;
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export const renderSlashCommands = () => {
  let component: ReactRenderer<
    { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
    SlashCommandsListProps
  > | null = null;
  let popup: TippyInstance[] | null = null;

  return {
    onStart: (props: SlashCommandRendererProps) => {
      component = new ReactRenderer(SlashCommandsList, {
        props: {
          items: props.items,
          command: props.command,
        },
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },

    onUpdate(props: SlashCommandRendererProps) {
      component?.updateProps({
        items: props.items,
        command: props.command,
      });

      if (!props.clientRect) {
        return;
      }

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown(props: { event: KeyboardEvent }) {
      if (props.event.key === "Escape") {
        popup?.[0]?.hide();
        return true;
      }

      return component?.ref?.onKeyDown(props) || false;
    },

    onExit() {
      popup?.[0]?.destroy();
      component?.destroy();
    },
  };
};
