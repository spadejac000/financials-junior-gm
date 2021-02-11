import { memo } from 'react';

export const PlayerDropContainer = memo(
  ({ provided, innerRef, children, player, isDraggingOver }) => {
    return (
      <div
        {...provided.droppableProps}
        ref={innerRef}
        className={`drop-container${
          player ? ' drop-disabled' : ' drag-disabled'
        }`}
        style={{}}
      >
        {children}
      </div>
    );
  }
);
