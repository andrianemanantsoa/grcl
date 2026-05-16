import { useEffect, useState } from 'react';
import { getMe, updateProfile } from '../api/authApi';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', avatar: '', bio: '', location: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMe()
      .then(res => {
        setUser(res.data);
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          avatar: res.data.avatar || '',
          bio: res.data.bio || '',
          location: res.data.location || ''
        });
      })
      .catch((err) => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(formData);
      setUser(res.data);
      setIsEditing(false);
      alert('Profil mis à jour !');
    } catch (err) {
      alert("Erreur lors de la mise à jour : " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Dashboard</h2>
      
      {!isEditing ? (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <img 
              src={user.avatar || 'https://via.placeholder.com/150'} 
              alt="Avatar" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #007bff' }} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3>{user.name}</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Bio:</strong> {user.bio || 'Aucune bio renseignée.'}</p>
            <p><strong>Lieu:</strong> {user.location || 'Non spécifié.'}</p>
            <p><strong>Membre depuis:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ marginTop: '10px', padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            >
              Éditer le profil
            </button>
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '5px', backgroundColor: '#e9f5ff' }}>
          <h3>Modifier votre profil</h3>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>
              <strong>Nom:</strong>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
            <label>
              <strong>Email:</strong>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
            <label>
              <strong>Photo de profil:</strong>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
              {formData.avatar && formData.avatar.startsWith('data:image') && (
                <div style={{ marginTop: '10px' }}>
                  Aperçu: <br/>
                  <img src={formData.avatar} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
              )}
            </label>
            <label>
              <strong>Bio:</strong>
              <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }} />
            </label>
            <label>
              <strong>Lieu:</strong>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" disabled={loading} style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
