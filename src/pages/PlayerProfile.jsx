import React, { useState, useEffect } from 'react';

import './style.css';
import axios from 'axios';
import Swal from 'sweetalert2';

import useAuth from '../hooks/useAuth';
import Aside from '../components/layouts/Aside';
import Footer from '../components/layouts/Footer';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';

function PlayerProfile() {
  const { auth } = useAuth();
  const userId = auth.user_id;

  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: '', phone: '' });

  const fetchProfile = () => {
    axios.get(`api/v1/user/${userId}`).then(res => {
      if (res.data.status === 'Ok') {
        const data = res.data.data;
        setProfile(data);
        setForm({
          email: data.email ?? '',
          phone: data.phone ?? '254719671440',
        });
      }
    });
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    axios.patch('api/v1/user/profile', {
      email: form.email,
      phone: form.phone || null,
    })
      .then(res => {
        if (res.data.status === 'Ok') {
          Swal.fire({ icon: 'success', title: 'Saved', text: 'Profile updated successfully.', timer: 1500, showConfirmButton: false });
          fetchProfile();
        } else {
          Swal.fire({ icon: 'error', title: 'Failed', text: res.data.data || 'Could not update profile.' });
        }
      })
      .catch(err => {
        Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.data || 'An unexpected error occurred.' });
      })
      .finally(() => setSaving(false));
  };

  return (
    <DashboardWrapper>
      <TopNav />
      <Sidebar />

      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Profile</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card card-primary">
                  <div className="card-header">
                    <h3 className="card-title">My Profile</h3>
                  </div>

                  {profile && (
                    <form onSubmit={handleSubmit}>
                      <div className="card-body">

                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profile.username}
                            readOnly
                            disabled
                          />
                        </div>

                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={form.email}
                            onChange={handleInput}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Phone <small className="text-muted">(international format, e.g. 254719671440)</small></label>
                          <input
                            type="text"
                            className="form-control"
                            name="phone"
                            value={form.phone}
                            onChange={handleInput}
                            placeholder="254XXXXXXXXX"
                          />
                        </div>

                      </div>

                      <div className="card-footer">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          {saving
                            ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Saving...</>
                            : 'Save changes'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Aside />
      <Footer />
    </DashboardWrapper>
  );
}

export default PlayerProfile;
