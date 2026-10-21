"use client";

import { useState } from "react";

// Drag-to-reorder for lists. Dragging starts only from the handle, so text in the rows can still be selected.
// The ↑/↓ buttons stay for keyboard and touch users.
export function useSortable(move: (from: number, to: number) => void) {
  const [armed, setArmed] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const reset = () => {
    setArmed(null);
    setDragging(null);
    setOver(null);
  };

  return {
    item: (i: number) => ({
      draggable: armed === i,
      onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(i));
        setDragging(i);
      },
      onDragOver: (e: React.DragEvent) => {
        if (dragging === null) return;
        e.preventDefault();
        setOver(i);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        if (dragging !== null && dragging !== i) move(dragging, i);
        reset();
      },
      onDragEnd: reset,
      "data-drop-target": over === i && dragging !== i ? "" : undefined,
    }),
    handle: (i: number) => ({
      onPointerDown: () => setArmed(i),
      onPointerUp: () => setArmed(null),
    }),
  };
}

export function moveItem<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
