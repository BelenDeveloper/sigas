"use client";

import { Input } from "@repo/ui/components/ui/input";
import { useEffect, useRef, useState } from "react";

interface ChecklistItemEditorProps {
  description: string;
  isCompleted: boolean;
  onSave: (description: string) => void;
}

export function ChecklistItemEditor({ description, isCompleted, onSave }: ChecklistItemEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(description);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftValue(description);
  }, [description]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    setIsEditing(false);
    const trimmedValue = draftValue.trim();

    if (trimmedValue && trimmedValue !== description) {
      onSave(trimmedValue);
    } else {
      setDraftValue(description);
    }
  };

  const cancelEdit = () => {
    setDraftValue(description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commitEdit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitEdit();
          } else if (event.key === "Escape") {
            cancelEdit();
          }
        }}
        className="h-8 flex-1"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={
        isCompleted
          ? "flex-1 truncate text-left text-sm text-muted-foreground line-through"
          : "flex-1 truncate text-left text-sm text-foreground"
      }
    >
      {description}
    </button>
  );
}
