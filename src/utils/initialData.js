export const initialData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Planora Başlatıldı', content: 'Proje kurulumu tamamlandı.', user: 'Sistem', status: 'To Do' },
  },
  columns: {
    'column-1': { id: 'column-1', title: 'To Do', taskIds: ['task-1'] },
    'column-2': { id: 'column-2', title: 'In Progress', taskIds: [] },
    'column-3': { id: 'column-3', title: 'Done', taskIds: [] },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};