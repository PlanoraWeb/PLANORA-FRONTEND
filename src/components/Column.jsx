import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const Column = ({ column, tasks }) => {
  return (
    <div style={{ 
      margin: '8px', 
      width: '320px', 
      backgroundColor: '#ebecf0', 
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '80vh'
    }}>
      <h3 style={{ padding: '15px', margin: 0 }}>{column.title}</h3>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ 
              padding: '10px', 
              flexGrow: 1, 
              minHeight: '100px',
              overflowY: 'auto'
            }}
          >
            {tasks.map((task, index) => (
              task ? <TaskCard key={task.id} task={task} index={index} /> : null
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;