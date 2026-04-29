import { useState } from 'react';

const TaskModal = ({ isOpen, onClose, onAdd }) => {
  const [taskData, setTaskData] = useState({ title: '', content: '', user: '' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title) return alert("Başlık zorunludur!");
    onAdd(taskData);
    setTaskData({ title: '', content: '', user: '' }); // Formu sıfırla
    onClose();
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Yeni Görev Ekle</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" placeholder="Görev Başlığı" 
            value={taskData.title}
            onChange={(e) => setTaskData({...taskData, title: e.target.value})}
          />
          <textarea 
            placeholder="Açıklama" 
            value={taskData.content}
            onChange={(e) => setTaskData({...taskData, content: e.target.value})}
          />
          <input 
            type="text" placeholder="Sorumlu Kişi" 
            value={taskData.user}
            onChange={(e) => setTaskData({...taskData, user: e.target.value})}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', flex: 1 }}>Ekle</button>
            <button type="button" onClick={onClose} style={{ flex: 1 }}>İptal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Basit inline stiller (Dilersen CSS dosyasına taşıyabilirsin)
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '8px', width: '400px' };

export default TaskModal;