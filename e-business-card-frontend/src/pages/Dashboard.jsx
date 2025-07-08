import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [showMine, setShowMine] = useState(false);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    // Get current user ID
    fetch(`${import.meta.env.VITE_SERVER_URI}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUserId(data.user.id))
      .catch(() => localStorage.removeItem('token'));
  }, [token]);

  useEffect(() => {
    const endpoint = showMine ? `${import.meta.env.VITE_SERVER_URI}/cards/my` : `${import.meta.env.VITE_SERVER_URI}/cards`;
    fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(err => console.error(err));
  }, [showMine, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(search.toLowerCase()) ||
    card.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <nav className="navbar">
        <span>E-Business Cards</span>
        <div>
          <button onClick={() => setShowMine(false)}>All Cards</button>
          <button onClick={() => setShowMine(true)}>My Cards</button>
          <button onClick={() => navigate('/edit/new')}>Create Card</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card-list">
        {filteredCards.map(card => (
          <div key={card._id} className="card">
            <h3>{card.name}</h3>
            <p>{card.email}</p>
            {card.linkedin && <p>LinkedIn: {card.linkedin}</p>}
            {card.github && <p>GitHub: {card.github}</p>}
            {card.twitter && <p>Twitter: {card.twitter}</p>}
            {card.userId._id === userId && (
              <div className="card-actions">
                <button onClick={() => navigate(`/edit/${card._id}`)}>Edit</button>
                <button onClick={() => handleDelete(card._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this card?')) return;

    try {
      await fetch(`${import.meta.env.VITE_SERVER_URI}/cards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCards(cards.filter(card => card._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  }
}

export default Dashboard;
