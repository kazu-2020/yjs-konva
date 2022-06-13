import { useRef, useEffect } from 'react';
import './App.css';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useYcanvas } from './hooks/useYcanvas';
import { Shape } from 'konva/lib/Shape';
import Konva from 'konva';
import * as Y from 'yjs';
import { useYdoc } from './hooks/useYdoc';

const App = () => {
  const { ydoc } = useYdoc();
  const yRootMap = ydoc.getMap('root');
  const undoManager = new Y.UndoManager(yRootMap);

  const stageRef = useRef<Konva.Stage>(null);
  const { rects, dragStartCanvas, dragMove, dragEndCanvas } =
    useYcanvas(yRootMap);

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    if (e.target instanceof Shape) dragStartCanvas(e.target);
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (e.target instanceof Shape) dragMove(e.target);
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    if (e.target instanceof Shape) dragEndCanvas(e.target);
  };

  const undo = () => undoManager.undo();

  const redo = () => undoManager.redo();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'z' && e.metaKey) {
      e.shiftKey ? redo() : undo();
    }
    e.stopPropagation();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Try to drag a rect" />
        {rects.map((rect) => (
          <Rect
            key={rect.id}
            id={rect.id}
            x={rect.x}
            y={rect.y}
            height={rect.height}
            width={rect.width}
            fill="#89b717"
            opacity={rect.isDragging ? 0.5 : 1}
            draggable
            shadowColor="black"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default App;
