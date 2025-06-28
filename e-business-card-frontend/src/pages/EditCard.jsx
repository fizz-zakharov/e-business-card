import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditCard() {
  const { id } = useParams(); // 'new' for creating, or actual ID for editing
  const [form, setForm] = useState({
    name: '',
    email: '',
    linkedin: '',
    github: '',
    twitter: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (id !== 'new') {
      fetch(`/api/cards/${id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            name: data.name || '',
            email: data.email || '',
            linkedin: data.linkedin || '',
            github: data.github || '',
            twitter: data.twitter || ''
          });
        })
        .catch(() => setError('Failed to load card'));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const method = id === 'new' ? 'POST' : 'PUT';
    const endpoint = id === 'new' ? '/api/cards' : `/api/cards/${id}`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to save card');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="auth-container">
      <h2>{id === 'new' ? 'Create Card' : 'Edit Card'}</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="linkedin" placeholder="LinkedIn" value={form.linkedin} onChange={handleChange} />
        <input name="github" placeholder="GitHub" value={form.github} onChange={handleChange} />
        <input name="twitter" placeholder="Twitter" value={form.twitter} onChange={handleChange} />
        {error && <p className="error">{error}</p>}
        <button type="submit">{id === 'new' ? 'Create' : 'Update'}</button>
      </form>
    </div>
  );
}

export default EditCard;
