import React, { useState, useEffect } from "react";
import { 
  BarChart3, ExternalLink, RefreshCw, Maximize2, TrendingUp, TrendingDown,
  Users, FileText, MessageSquare, Activity, AlertCircle, CheckCircle, 
  Info, Calendar, Clock, Heart, Zap, Target, Award, Download
} from "lucide-react";
import { 
  getAnalyticsDashboard, 
  getActivityTrend, 
  getContentStats,
  getCommunityStats,
  getMoodStats,
  getReportStats,
  getTopUsers,
  getUsersTrend
} from "../services/api";

const COLORS = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  gray: '#6b7280'
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);
  const [content, setContent] = useState(null);
  const [community, setCommunity] = useState(null);
  const [mood, setMood] = useState(null);
  const [reports, setReports] = useState(null);
  const [topUsers, setTopUsers] = useState(null);
  const [usersTrend, setUsersTrend] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, actRes, contentRes, commRes, moodRes, reportRes, usersRes, trendRes] = await Promise.allSettled([
        getAnalyticsDashboard(),
        getActivityTrend(),
        getContentStats(),
        getCommunityStats(),
        getMoodStats(),
        getReportStats(),
        getTopUsers(10),
        getUsersTrend(30)
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value?.overview);
      if (actRes.status === 'fulfilled') setActivity(actRes.value?.data || []);
      if (contentRes.status === 'fulfilled') setContent(contentRes.value);
      if (commRes.status === 'fulfilled') setCommunity(commRes.value);
      if (moodRes.status === 'fulfilled') setMood(moodRes.value);
      if (reportRes.status === 'fulfilled') setReports(reportRes.value);
      if (usersRes.status === 'fulfilled') setTopUsers(usersRes.value);
      if (trendRes.status === 'fulfilled') setUsersTrend(trendRes.value?.data || []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary', subtitle }) => (
    <div className="analytics-stat-card">
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: `${COLORS[color]}15`, color: COLORS[color] }}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <span className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="stat-card-body">
        <span className="stat-value">{loading ? '...' : (value ?? '0')}</span>
        <span className="stat-label">{title}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      className={`tab-btn ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const ActivityChart = ({ data }) => (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Weekly Activity</h3>
        <div className="chart-legend">
          <span className="legend-item"><span className="dot" style={{ background: COLORS.primary }} /> Chats</span>
          <span className="legend-item"><span className="dot" style={{ background: COLORS.success }} /> Messages</span>
          <span className="legend-item"><span className="dot" style={{ background: COLORS.purple }} /> Moods</span>
        </div>
      </div>
      <div className="bar-chart">
        {data.map((d, i) => (
          <div key={i} className="bar-item">
            <div className="bar-group">
              <div className="bar" style={{ height: `${Math.min((d.chats / Math.max(...data.map(x => x.chats || 1))) * 100, 100)}%`, background: COLORS.primary }} />
              <div className="bar" style={{ height: `${Math.min((d.messages / Math.max(...data.map(x => x.messages || 1))) * 100, 100)}%`, background: COLORS.success }} />
              <div className="bar" style={{ height: `${Math.min((d.moodEntries / Math.max(...data.map(x => x.moodEntries || 1))) * 100, 100)}%`, background: COLORS.purple }} />
            </div>
            <span className="bar-label">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const ContentDistribution = ({ data }) => (
    <div className="content-distribution">
      <h3>Content Types</h3>
      <div className="distribution-bars">
        {data?.map((d, i) => (
          <div key={i} className="distribution-item">
            <div className="distribution-info">
              <span className="distribution-label">{d.name}</span>
              <span className="distribution-value">{d.value}</span>
            </div>
            <div className="distribution-bar">
              <div 
                className="distribution-fill" 
                style={{ 
                  width: `${(d.value / Math.max(...data.map(x => x.value))) * 100}%`,
                  background: [COLORS.primary, COLORS.success, COLORS.warning, COLORS.info, COLORS.purple][i % 5]
                }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MoodDistribution = ({ data }) => {
    const labels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great', 'Excellent'];
    return (
      <div className="mood-distribution">
        <h3>Mood Distribution (30 days)</h3>
        <div className="mood-grid">
          {data?.map((d, i) => (
            <div key={i} className={`mood-item mood-${d.mood}`}>
              <span className="mood-label">{labels[d.mood] || 'Unknown'}</span>
              <span className="mood-count">{d.count}</span>
            </div>
          ))}
        </div>
        {mood?.avgMoodOverall !== undefined && (
          <div className="mood-average">
            <Heart size={16} />
            <span>Average: {Number(mood.avgMoodOverall).toFixed(1)}/5</span>
          </div>
        )}
      </div>
    );
  };

  const ReportSummary = ({ data }) => (
    <div className="report-summary">
      <h3>Medical Reports Analysis</h3>
      <div className="report-grid">
        <div className="report-stat">
          <span className="report-value">{data?.total || 0}</span>
          <span className="report-label">Total Reports</span>
        </div>
        <div className="report-stat normal">
          <CheckCircle size={20} />
          <span className="report-value">{data?.bySummary?.normal || 0}</span>
          <span className="report-label">Normal</span>
        </div>
        <div className="report-stat abnormal">
          <AlertCircle size={20} />
          <span className="report-value">{data?.bySummary?.abnormal || 0}</span>
          <span className="report-label">Abnormal</span>
        </div>
        <div className="report-stat critical">
          <AlertCircle size={20} />
          <span className="report-value">{data?.bySummary?.critical || 0}</span>
          <span className="report-label">Critical</span>
        </div>
      </div>
    </div>
  );

  const TopUsersList = ({ data, title, metric }) => (
    <div className="top-users">
      <h3>{title}</h3>
      <div className="users-list">
        {data?.map((u, i) => (
          <div key={i} className="user-item">
            <span className="user-rank">{i + 1}</span>
            <div className="user-info">
              <span className="user-name">{u.name || 'Unknown'}</span>
              <span className="user-metric">{metric}: {u[metric.toLowerCase()] || u.chats || u.messages || 0}</span>
            </div>
            {i < 3 && <Award size={16} className="user-badge" />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <div className="header-icon">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1>Analytics Dashboard</h1>
            <p>Real-time insights and metrics</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={refresh} title="Refresh">
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
          <button className="btn-secondary">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <StatCard title="Total Users" value={dashboard?.totalUsers} change={dashboard?.growthWeek} icon={Users} color="primary" subtitle={`+${dashboard?.newUsersWeek || 0} this week`} />
        <StatCard title="Total Chats" value={dashboard?.totalChats} icon={MessageSquare} color="info" subtitle={`+${dashboard?.chatsLast7Days || 0} this week`} />
        <StatCard title="Content" value={dashboard?.totalContent} icon={FileText} color="success" subtitle={`${dashboard?.contentLast7Days || 0} new`} />
        <StatCard title="Community Members" value={dashboard?.totalMembers} icon={Users} color="purple" subtitle={`${dashboard?.totalGroups || 0} groups`} />
        <StatCard title="Total Messages" value={dashboard?.totalMessages} icon={Zap} color="warning" />
        <StatCard title="Critical Reports" value={dashboard?.criticalReports} icon={AlertCircle} color="danger" />
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <TabButton id="overview" label="Overview" icon={Activity} />
        <TabButton id="content" label="Content" icon={FileText} />
        <TabButton id="community" label="Community" icon={Users} />
        <TabButton id="mood" label="Mood Tracking" icon={Heart} />
        <TabButton id="reports" label="Medical Reports" icon={AlertCircle} />
        <TabButton id="users" label="Top Users" icon={Award} />
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="chart-card">
              <ActivityChart data={activity} />
            </div>
            <div className="summary-cards">
              <div className="summary-card">
                <Calendar size={20} />
                <div>
                  <span className="summary-value">{dashboard?.newUsersMonth || 0}</span>
                  <span className="summary-label">New Users (30 days)</span>
                </div>
              </div>
              <div className="summary-card">
                <Clock size={20} />
                <div>
                  <span className="summary-value">{activity.reduce((s, a) => s + a.chats, 0)}</span>
                  <span className="summary-label">Chats This Week</span>
                </div>
              </div>
              <div className="summary-card">
                <Target size={20} />
                <div>
                  <span className="summary-value">{community?.totalMessages || 0}</span>
                  <span className="summary-label">Group Messages</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-grid">
            <div className="chart-card">
              <ContentDistribution data={content?.distribution} />
            </div>
            <div className="recent-content">
              <h3>Recent Content</h3>
              <div className="content-list">
                {content?.recent?.slice(0, 5).map((c, i) => (
                  <div key={i} className="content-item">
                    <FileText size={16} />
                    <div className="content-info">
                      <span className="content-title">{c.title}</span>
                      <span className="content-meta">{c.type} • {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="community-grid">
            <div className="community-stats">
              <div className="comm-stat-card">
                <Users size={24} />
                <div>
                  <span className="comm-stat-value">{community?.totalMembers || 0}</span>
                  <span className="comm-stat-label">Total Members</span>
                </div>
              </div>
              <div className="comm-stat-card">
                <MessageSquare size={24} />
                <div>
                  <span className="comm-stat-value">{community?.totalMessages || 0}</span>
                  <span className="comm-stat-label">Total Messages</span>
                </div>
              </div>
              <div className="comm-stat-card">
                <Users size={24} />
                <div>
                  <span className="comm-stat-value">{community?.totalGroups || 0}</span>
                  <span className="comm-stat-label">Active Groups</span>
                </div>
              </div>
            </div>
            <div className="groups-list">
              <h3>Top Groups</h3>
              {community?.groups?.slice(0, 5).map((g, i) => (
                <div key={i} className="group-item">
                  <div className="group-info">
                    <span className="group-name">{g.name}</span>
                    <span className="group-meta">{g.memberCount} members • {g.messageCount} messages</span>
                  </div>
                  <span className={`group-status ${g.isActive ? 'active' : 'inactive'}`}>
                    {g.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mood' && (
          <div className="mood-grid-layout">
            <div className="chart-card">
              <MoodDistribution data={mood?.distribution} />
            </div>
            <div className="mood-stats">
              <div className="mood-stat-card">
                <Heart size={24} />
                <div>
                  <span className="mood-stat-value">{mood?.weekEntries || 0}</span>
                  <span className="mood-stat-label">Entries This Week</span>
                </div>
              </div>
              <div className="mood-stat-card">
                <Heart size={24} />
                <div>
                  <span className="mood-stat-value">{mood?.monthEntries || 0}</span>
                  <span className="mood-stat-label">Entries This Month</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-grid">
            <ReportSummary data={reports} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-grid">
            <TopUsersList data={topUsers?.topChatters} title="Top Chatters" metric="chats" />
            <TopUsersList data={topUsers?.topMessengers} title="Top Messengers" metric="messages" />
            <TopUsersList data={topUsers?.topMoods} title="Most Active Mood Trackers" metric="entries" />
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner-lg" />
        </div>
      )}

      <style>{`
        .analytics-page {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .header-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .analytics-header h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }
        
        .analytics-header p {
          font-size: 14px;
          color: #6b7280;
          margin: 4px 0 0;
        }
        
        .header-actions {
          display: flex;
          gap: 8px;
        }
        
        .btn-icon {
          width: 40px;
          height: 40px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.2s;
        }
        
        .btn-icon:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .analytics-stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 20px;
        }
        
        .stat-change.up {
          background: #dcfce7;
          color: #16a34a;
        }
        
        .stat-change.down {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .stat-card-body {
          display: flex;
          flex-direction: column;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }
        
        .stat-subtitle {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }
        
        .analytics-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          background: #f3f4f6;
          padding: 6px;
          border-radius: 14px;
          overflow-x: auto;
        }
        
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          background: transparent;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          color: #111827;
        }
        
        .tab-btn.active {
          background: white;
          color: #6366f1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .tab-content {
          min-height: 400px;
        }
        
        .overview-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        
        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .chart-container h3,
        .chart-card h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 20px;
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .chart-legend {
          display: flex;
          gap: 16px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }
        
        .legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .bar-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 200px;
          padding-bottom: 30px;
        }
        
        .bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        
        .bar-group {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 100%;
        }
        
        .bar {
          width: 16px;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s;
        }
        
        .bar-label {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .summary-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          color: #6366f1;
        }
        
        .summary-card div {
          display: flex;
          flex-direction: column;
        }
        
        .summary-value {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }
        
        .summary-label {
          font-size: 12px;
          color: #6b7280;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        .distribution-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .distribution-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .distribution-info {
          display: flex;
          justify-content: space-between;
        }
        
        .distribution-label {
          font-size: 13px;
          color: #374151;
          text-transform: capitalize;
        }
        
        .distribution-value {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
        }
        
        .distribution-bar {
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .distribution-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s;
        }
        
        .content-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .content-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 10px;
        }
        
        .content-info {
          display: flex;
          flex-direction: column;
        }
        
        .content-title {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }
        
        .content-meta {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }
        
        .community-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .comm-stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          color: #6366f1;
        }
        
        .comm-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: block;
        }
        
        .comm-stat-label {
          font-size: 12px;
          color: #6b7280;
        }
        
        .groups-list {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .groups-list h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px;
        }
        
        .group-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .group-item:last-child {
          border-bottom: none;
        }
        
        .group-info {
          display: flex;
          flex-direction: column;
        }
        
        .group-name {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }
        
        .group-meta {
          font-size: 12px;
          color: #6b7280;
        }
        
        .group-status {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
        }
        
        .group-status.active {
          background: #dcfce7;
          color: #16a34a;
        }
        
        .group-status.inactive {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .mood-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .mood-item {
          padding: 16px;
          border-radius: 12px;
          text-align: center;
        }
        
        .mood-0 { background: #fee2e2; }
        .mood-1 { background: #fed7aa; }
        .mood-2 { background: #fef3c7; }
        .mood-3 { background: #dcfce7; }
        .mood-4 { background: #bbf7d0; }
        .mood-5 { background: #86efac; }
        
        .mood-label {
          display: block;
          font-size: 12px;
          color: #374151;
          margin-bottom: 4px;
        }
        
        .mood-count {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }
        
        .mood-average {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: #faf5ff;
          border-radius: 10px;
          color: #7c3aed;
          font-weight: 500;
        }
        
        .mood-grid-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        
        .mood-stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          color: #a855f7;
        }
        
        .mood-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          display: block;
        }
        
        .mood-stat-label {
          font-size: 12px;
          color: #6b7280;
        }
        
        .report-grid {
          display: grid;
          gap: 24px;
        }
        
        .report-summary {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .report-summary h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 20px;
        }
        
        .report-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        .report-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }
        
        .report-stat.normal {
          background: #dcfce7;
          color: #16a34a;
        }
        
        .report-stat.abnormal {
          background: #fef3c7;
          color: #d97706;
        }
        
        .report-stat.critical {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .report-value {
          font-size: 32px;
          font-weight: 700;
        }
        
        .report-label {
          font-size: 12px;
          margin-top: 4px;
          opacity: 0.8;
        }
        
        .users-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        .top-users {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .top-users h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 16px;
        }
        
        .users-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .user-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 10px;
        }
        
        .user-rank {
          width: 24px;
          height: 24px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }
        
        .user-item:first-child .user-rank {
          background: #fbbf24;
          color: white;
        }
        
        .user-item:nth-child(2) .user-rank {
          background: #9ca3af;
          color: white;
        }
        
        .user-item:nth-child(3) .user-rank {
          background: #cd7f32;
          color: white;
        }
        
        .user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }
        
        .user-metric {
          font-size: 12px;
          color: #6b7280;
        }
        
        .user-badge {
          color: #fbbf24;
        }
        
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        
        .spinner-lg {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @media (max-width: 1024px) {
          .overview-grid, .content-grid, .mood-grid-layout, .users-grid {
            grid-template-columns: 1fr;
          }
          
          .community-stats, .report-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 640px) {
          .analytics-page {
            padding: 16px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .mood-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .community-stats, .report-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}