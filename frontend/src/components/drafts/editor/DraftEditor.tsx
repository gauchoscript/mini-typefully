import { useQuery, useQueryClient } from "@tanstack/react-query";
import Document from "@tiptap/extension-document";
import {
  EditorContent,
  EditorEvents,
  EditorOptions,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useContext, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SelectedDraftContext } from "../../../context/SelectedDraftContext";
import { Draft } from "../../../types";
import cn from "../../../utils/cn";
import fetchJSON from "../../../utils/fetchJSON";
import { AtomNode } from "./AtomNode";
import { EditorView } from "@tiptap/pm/view";
// import applyDevTools from "prosemirror-dev-tools";

export const DraftEditor = () => {
  const { selectedDraftId } = useContext(SelectedDraftContext);

  const { data: draft } = useQuery({
    queryKey: ["draft", selectedDraftId],
    enabled: selectedDraftId !== null,
    queryFn: () =>
      fetchJSON<Draft>(`http://localhost:8000/drafts/${selectedDraftId}/`),
    // turn off refetch since this is just for the initial loading
    refetchInterval: Infinity,
    // prevent caching of drafts so it's always loaded fresh when opening an editor
    gcTime: 0,
  });

  const queryClient = useQueryClient();

  const handleEditorUpdate = useCallback(
    async ({ editor }: EditorEvents["update"]) => {
      const doc = editor.getJSON();

      // patch the draft
      const res = await fetch(
        `http://localhost:8000/drafts/${selectedDraftId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ content: doc }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedDraft = (await res.json()) as Draft;

      // update preview text in sidebar
      const cache = queryClient.getQueryData<Draft[]>(["drafts"]);
      if (cache) {
        const updatedCache = cache.map((draft) => {
          if (draft.id == updatedDraft.id) {
            return updatedDraft;
          } else {
            return draft;
          }
        });

        queryClient.setQueryData(["drafts"], updatedCache);
      }
    },
    [queryClient, selectedDraftId]
  );

  const handleEditorUpdateDebounced = useDebouncedCallback(
    handleEditorUpdate,
    300
  );

  if (!selectedDraftId) return <EmptyEditor />;
  if (!draft) return null;

  return (
    <DraftEditorInner
      initialContent={draft.content}
      onUpdate={handleEditorUpdateDebounced}
    />
  );
};

const DraftEditorInner = ({
  initialContent,
  onUpdate,
}: {
  initialContent: EditorOptions["content"];
  onUpdate: EditorOptions["onUpdate"];
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false, // registering custom document below
      }),
      Document.extend({ content: "atom+" }),
      AtomNode,
    ],
    content: initialContent,
    onUpdate,
  });

  const onPaste = useCallback((_view: EditorView, event: ClipboardEvent) => {    
    const MAX_CHARACTERS = 280;
    const text: string = event.clipboardData?.getData("text") || "";
  
    let tweets: Array<string> = [""];
  
    if (text.length > MAX_CHARACTERS) {
      const sentences: Array<string> = text.split(/\.\s+/).map((sentence) => sentence.trim());
      
      for (let index = 0; index < sentences.length; index++) {
        const sentence = sentences[index];
        const lastSentence: string = tweets.pop() || "";
        const newSentence: string = lastSentence.concat(sentence);
        if (newSentence.length <= MAX_CHARACTERS) {
          tweets.push(newSentence)
        } else {
          tweets = [...tweets, lastSentence, sentence];
        }
      }
    }
  
    const atoms = tweets.map((texto) => ({ 
      type: "atom",
      content: [{
        type: "paragraph",
        content: [{
          type: "text",
          text: texto,
        }]
      }]
    }));
  
    const currentPos = editor?.state.selection || 0;

    editor?.commands.insertContentAt(currentPos, atoms);

    return true;
  }, [editor]);

  // // ProseMirror dev tools, might be useful for debugging
  // useEffect(() => {
  //   if (editor && editor.view) {
  //     applyDevTools(editor.view);
  //   }
  // }, [editor]);

  // focus the editor on first open
  useEffect(() => {
    if (editor) {
      const editorProps = {
        handlePaste: onPaste,
      };

      editor.setOptions({ editorProps });

      if (editor.isEditable) {
        editor.commands.focus("end");
      }
    }
  }, [editor, onPaste]);

  return (
    <EditorContent
      className={cn(
        "flex-1 [&>div]:h-full [&>div]:outline-none p-4 text-base",
        "[&>div>*]:w-full [&>div>*]:max-w-[600px] [&>div>*]:mx-auto" // Center content
      )}
      editor={editor}
    />
  );
};

const EmptyEditor = () => {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      Select a draft to start editing
    </div>
  );
};
