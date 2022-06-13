import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import UUID from 'uuidjs';
import { useState, useEffect, useCallback } from 'react';
import Konva from 'konva';

const ydoc = new Y.Doc();
// const provider = new WebrtcProvider('prosemirror-debug', ydoc);

type Cursor = {
  id: string;
  x: number;
  y: number;
};

const current: Cursor = {
  id: UUID.generate(),
  x: 0,
  y: 0,
};

const yCursorArray = ydoc.getArray<Cursor>('cursor');

export const useCursor = (stage?: Konva.Stage) => {
  // 自分
  const [cursors, setCursors] = useState<Cursor[]>([]);

  useEffect(() => {
    if (stage) {
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      // setCursor({ ...cursor, x, y });
      yCursorArray.push([{ ...current, x, y }]);
    }
  }, []);
  // その他
  // Y.Array => 自分 + その他
  yCursorArray.observe((event, transaction) => {
    const array = yCursorArray.toArray();
    const uniqueIds = new Set();

    ydoc.transact(() => {
      for (let i = array.length - 1; i >= 0; i--) {
        const item = array[i];
        uniqueIds.has(item.id)
          ? yCursorArray.delete(i, 1)
          : uniqueIds.add(item.id);
      }
    });

    setCursors(
      yCursorArray.toArray().filter((cursor) => cursor.id !== current.id)
    );
  });
  //
  //
  const moveCursor = useCallback((x: number, y: number) => {
    yCursorArray.push([{ ...current, x, y }]);
  }, []);

  return { cursors, moveCursor };
};
