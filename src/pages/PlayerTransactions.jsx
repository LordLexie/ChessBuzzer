import React, { useState, useEffect } from 'react';

import './style.css';
import axios from 'axios';

import useAuth from '../hooks/useAuth';
import Aside from '../components/layouts/Aside';
import Footer from '../components/layouts/Footer';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';


function PlayerTransactions() {

    const { auth } = useAuth();

    const [playerTransactions, setPlayerTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRows: 0 });
    const [page, setPage] = useState(1);

    const searchTransactions = (currentPage) => {
        axios.post('/api/v1/transactions', { player_id: auth.user_id, page: currentPage, page_size: 10 })
            .then(response => {
                const { data, page, total_pages, total_rows } = response.data;
                setPlayerTransactions(data);
                setPagination({ page, totalPages: total_pages, totalRows: total_rows });
            })
            .catch(error => console.error('Error fetching transactions:', error));
    };

    useEffect(() => {
        searchTransactions(page);
    }, [page]);

    const goToPage = (newPage) => setPage(newPage);

    return (
        <DashboardWrapper>
            <TopNav />
            <Sidebar />

            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Transactions</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body table-responsive">
                                        <table className="table table-hover text-nowrap">
                                            <thead>
                                                <tr>
                                                    <th style={{ fontSize: '14px' }}>#</th>
                                                    <th style={{ fontSize: '14px' }}>Date</th>
                                                    <th style={{ fontSize: '14px' }}>Amount</th>
                                                    <th style={{ fontSize: '14px' }}>Type</th>
                                                    <th style={{ fontSize: '14px' }}>Reference</th>
                                                    <th style={{ fontSize: '14px' }}>Narration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {playerTransactions.map((transaction, index) => (
                                                    <tr key={transaction.ID}>
                                                        <td style={{ fontSize: '13px' }}>{index + 1}</td>
                                                        <td style={{ fontSize: '13px' }}>
                                                            {new Date(transaction.CreatedAt).toLocaleString("en-KE", {
                                                                year: "numeric",
                                                                month: "2-digit",
                                                                day: "2-digit"
                                                            })}
                                                        </td>
                                                        <td style={{ fontSize: '13px' }}>{transaction.Amount}</td>
                                                        <td style={{ fontSize: '13px' }}>{transaction.TransactionType}</td>
                                                        <td style={{ fontSize: '13px' }}>{transaction.Reference}</td>
                                                        <td style={{ fontSize: '13px' }}>{transaction.Description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="card-footer d-flex justify-content-between align-items-center">
                                        <span style={{ fontSize: '13px' }}>
                                            Page {pagination.page} of {pagination.totalPages} &nbsp;({pagination.totalRows} total)
                                        </span>
                                        <ul className="pagination pagination-sm mb-0">
                                            <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={() => goToPage(pagination.page - 1)}>Previous</button>
                                            </li>
                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                                <li key={p} className={`page-item ${pagination.page === p ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => goToPage(p)}>{p}</button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                                                <button className="page-link" onClick={() => goToPage(pagination.page + 1)}>Next</button>
                                            </li>
                                        </ul>
                                    </div>
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

export default PlayerTransactions;
