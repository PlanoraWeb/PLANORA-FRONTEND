import { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { initialData } from '../utils/initialData';
import Column from '../components/Column';
import TaskModal from '../components/TaskModal';

const KanbanBoard = () => {
  // 1. Veriyi Başlat: LocalStorage'da veri varsa onu al, yoksa başlangıç verisini kullan
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('planora-tasks');
    return savedData ? JSON.parse(savedData) : initialData;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Veri Güncellendikçe LocalStorage'a Kaydet
  useEffect(() => {
    localStorage.setItem('planora-tasks', JSON.stringify(data));
  }, [data]);

  // 3. Sürükle-Bırak Mantığı (onDragEnd)
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Geçersiz bir yere bırakıldıysa çık
    if (!destination) return;

    // Aynı yere bırakıldıysa çık
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // AYNI KOLON İÇİNDE SIRALAMA DEĞİŞTİRME
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      return;
    }

    // FARKLI KOLONLAR ARASI TAŞIMA
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  // 4. Yeni Görev Ekleme Mantığı
  const addTask = (taskDetails) => {
    const newTaskId = `task-${Date.now()}`; // Benzersiz ID için zaman damgası
    
    const newTask = {
      id: newTaskId,
      ...taskDetails,
      status: 'To Do'
    };

    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [newTaskId]: newTask
      },
      columns: {
        ...data.columns,
        'column-1': {
          ...data.columns['column-1'],
          taskIds: [newTaskId, ...data.columns['column-1'].taskIds]
        }
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7f9' }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            padding: '12px 24px', 
            fontSize: '16px', 
            cursor: 'pointer', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          + Yeni Görev Ekle
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          padding: '20px',
          flexWrap: 'wrap' // Mobilde alt alta gelmesi için
        }}>
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return <Column key={column.id} column={column} tasks={tasks} />;
          })}
        </div>
      </DragDropContext>

      {/* Görev Ekleme Modalı */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addTask} 
      />
    </div>
  );
};

export default KanbanBoard;