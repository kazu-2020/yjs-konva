import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Shape } from 'konva/lib/Shape';

type Rect = {
  id: string;
  x: number;
  y: number;
  height: number;
  width: number;
  isDragging: boolean;
};

const generateShapes = (): Rect[] =>
  [...Array(1)].map((_, i) => ({
    id: i.toString(),
    x: 300,
    y: 300,
    height: 300,
    width: 300,
    isDragging: false,
  }));

const ydoc = new Y.Doc();
const wsProvider = new WebsocketProvider(
  'ws://localhost:1234',
  'Konva-Yjs',
  ydoc
);

const INITIAL_STATE = generateShapes();

ydoc.on('update', (update, origin, doc, tr) => {
  Y.logUpdate(update);
});

const yKonvaArray = ydoc.getArray<Rect>('canvas');
const undoManager = new Y.UndoManager(yKonvaArray);

export const useYcanvas = () => {
  const [rects, setRects] = useState<Rect[]>(INITIAL_STATE);

  useEffect(() => {
    yKonvaArray.push(INITIAL_STATE);
  }, []);

  const dragStartCanvas = useCallback((target: Shape) => {
    const id = target.id();
    setRects((rects) =>
      rects.map((rect) => ({
        ...rect,
        isDragging: rect.id === id,
      }))
    );
  }, []);

  const dragEndCanvas = useCallback((target: Shape) => {
    setRects((rects) =>
      rects.map((rect) => ({
        ...rect,
        isDragging: false,
      }))
    );

    ydoc.transact(() => {
      const newArray = yKonvaArray.map((obj) =>
        obj.id === target.id() ? { ...obj, x: target.x(), y: target.y() } : obj
      );

      yKonvaArray.delete(0, yKonvaArray.length);
      yKonvaArray.push(newArray);
    });
  }, []);

  const undo = useCallback(() => {
    undoManager.undo();
  }, []);

  const redo = useCallback(() => {
    undoManager.redo();
  }, []);

  yKonvaArray.observe((event, transaction) => {
    const array = yKonvaArray.toArray();
    const uniqueIds = new Set();

    ydoc.transact(() => {
      for (let i = array.length - 1; i >= 0; i--) {
        const item = array[i];
        uniqueIds.has(item.id)
          ? yKonvaArray.delete(i, 1)
          : uniqueIds.add(item.id);
      }
    });

    setRects(event.target.toArray());
  });

  return { rects, dragStartCanvas, dragEndCanvas, undo, redo } as const;
};
