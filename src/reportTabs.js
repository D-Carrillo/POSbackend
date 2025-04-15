import React, { useState } from 'react';
import "./Report.css";
import SpendingReport from './spendingReport';



const ReportTabs = ({ user }) => {
  const [activeTab, setActiveTab] = useState('');
  
  return (
    <div className="reports-page-container">
      <h2 className="reports-main-title">My Shopping Reports</h2>
      <div className="reports-tabs-container">
        <button 
          className={`reports-tab-button ${activeTab === 'spending' ? 'reports-tab-active' : ''}`}
          onClick={() => {activeTab === 'spending' ? setActiveTab('') : setActiveTab('spending')}}
        >
          Open Spending Analysis
        </button>
      </div>
      
      <div className="reports-content-container">
        {activeTab === 'spending' && <SpendingReport userId={user.id} />}
      </div>
    </div>
  );
};

export default ReportTabs;