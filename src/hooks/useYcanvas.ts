import { useState, useCallback } from 'react';
import * as Y from 'yjs';
import { Shape } from 'konva/lib/Shape';
import { YArray } from 'yjs/dist/src/internals';

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

const INITIAL_STATE = generateShapes();

export const useYcanvas = (yRootMap: Y.Map<unknown>) => {
  const ydoc = yRootMap.doc;
  const [rects, setRects] = useState<Rect[]>(INITIAL_STATE);

  const dragStartCanvas = useCallback((target: Shape) => {
    const id = target.id();
    setRects((rects) =>
      rects.map((rect) => ({
        ...rect,
        isDragging: rect.id === id,
      }))
    );
  }, []);

  const dragMove = useCallback((target: Shape) => {
    ydoc?.transact(() => {
      const newArray = [...rects].map((obj) =>
        obj.id === target.id() ? { ...obj, x: target.x(), y: target.y() } : obj
      );
      const yarray = new Y.Array<Rect>();
      yRootMap.set('rects', yarray);
      yarray.push(newArray);
    });
  }, []);

  const dragEndCanvas = useCallback((target: Shape) => {
    ydoc?.transact(() => {
      const newArray = [...rects].map((obj) =>
        obj.id === target.id()
          ? { ...obj, x: target.x(), y: target.y(), isDragging: false }
          : obj
      );
      const yarray = new Y.Array<Rect>();
      yRootMap.set('rects', yarray);
      yarray.push(newArray);
    });
  }, []);

  yRootMap.observe((event, _) => {
    const yRects = event.target.get('rects') as YArray<Rect>;
    setRects(yRects.toArray());
  });

  return { rects, dragStartCanvas, dragMove, dragEndCanvas } as const;
};
