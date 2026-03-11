import { Draggable } from '@hello-pangea/dnd';

const TaskCard = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none',
            padding: '16px',
            margin: '0 0 10px 0',
            backgroundColor: 'white',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            ...provided.draggableProps.style,
          }}
        >
          <strong style={{ display: 'block', marginBottom: '5px' }}>{task.title}</strong>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 10px 0' }}>{task.content}</p>
          <small style={{ color: '#007bff' }}>👤 {task.user}</small>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;