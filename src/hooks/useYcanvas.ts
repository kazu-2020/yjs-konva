import { useState, useCallback, useEffect } from 'react';
import * as Y from 'yjs';
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

  const updateYRects = (rects: Rect[]) => {
    const yRects = yRootMap.get('rects') as Y.Array<Rect>
    yRects.delete(0, yRects.length)
    yRects.push(rects)
  }

  const dragMove = useCallback((target: Shape) => {
    ydoc?.transact(() => {
      const newArray = [...rects].map((obj) =>
        obj.id === target.id() ? { ...obj, x: target.x(), y: target.y() } : obj
      );
      updateYRects(newArray)
    });
  }, []);

  const dragEndCanvas = useCallback((target: Shape) => {
    ydoc?.transact(() => {
      const newArray = [...rects].map((obj) =>
        obj.id === target.id()
          ? { ...obj, x: target.x(), y: target.y(), isDragging: false }
          : obj
      );
      updateYRects(newArray)
    });
  }, []);

  const hasChangeRects = (event: Y.YEvent<any>) => event.path.join() === 'rects'

  yRootMap.observeDeep((events) => {
    events.forEach((event) => {
      if ((event.target instanceof Y.Array<Rect>) && hasChangeRects(event)) {
        setRects(event.target.toArray());
      }
    })
  });

  useEffect(() => {
    yRootMap.set('rects', new Y.Array<Rect>());
  }, [yRootMap]);

  return { rects, dragStartCanvas, dragMove, dragEndCanvas } as const;
};
