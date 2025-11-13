import React, { useEffect, useMemo, useState } from "react";
import { getReports, createReport, deleteReport, getRelationshipsSummary } from "../services/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#6A5ACD"];

function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

const KPI = ({ title, value }) => (
  <div style={{ padding: 12, background: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.06)', minWidth: 160 }}>
    <div style={{ fontSize: 12, color: '#666' }}>{title}</div>
    <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
  </div>
);

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rangeDays, setRangeDays] = useState(7);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => { fetchReports(); }, []);
  useEffect(() => { fetchRelationships(); }, []);

  const [relationships, setRelationships] = useState(null);
  const fetchRelationships = async () => {
    try {
      const res = await getRelationshipsSummary();
      if (res && res.ok) setRelationships(res);
    } catch (e) { console.error('Failed to fetch relationships', e); }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReports();
      if (res && res.ok) setReports(res.reports || []);
    } catch (e) {
      console.error('Failed to load reports', e);
    } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return alert('Title and description required');
    try {
      const res = await createReport({ title, description });
      if (res && res.ok) {
        setReports(prev => [res.report, ...prev]);
        setTitle(''); setDescription('');
      }
    } catch (e) { console.error(e); alert('Create failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const res = await deleteReport(id);
      if (res && res.ok) setReports(prev => prev.filter(r => String(r._id) !== String(id)));
    } catch (e) { console.error(e); alert('Delete failed'); }
  };

  // Data transforms
  const lastNDays = (n) => {
    const arr = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(formatDate(d));
    }
    return arr;
  };

  const reportsInRange = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (rangeDays - 1));
    return reports.filter(r => new Date(r.createdAt) >= cutoff);
  }, [reports, rangeDays]);

  const trendData = useMemo(() => {
    const days = lastNDays(rangeDays);
    const counts = days.map(day => ({ day, count: 0 }));
    reportsInRange.forEach(r => {
      const d = formatDate(r.createdAt);
      const idx = counts.findIndex(c => c.day === d);
      if (idx >= 0) counts[idx].count += 1;
    });
    return counts;
  }, [reportsInRange, rangeDays]);

  const reporterDistribution = useMemo(() => {
    const map = {};
    reportsInRange.forEach(r => {
      const who = r.reportedBy || 'anonymous';
      map[who] = (map[who] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [reportsInRange]);

  const totalReports = reports.length;
  const reportsThisRange = reportsInRange.length;
  const avgPerDay = reportsInRange.length ? (reportsInRange.length / rangeDays).toFixed(2) : 0;

  return (
    <div style={{ padding: 20 }}>
      <h1>Reports Dashboard</h1>

      {/* Top controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <KPI title="Total Reports" value={totalReports} />
          <KPI title={`Last ${rangeDays} days`} value={reportsThisRange} />
          <KPI title="Avg / day" value={avgPerDay} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label>Range:</label>
          <select value={rangeDays} onChange={(e)=>setRangeDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Layout: left column charts, right column list & pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 16 }}>
          <div style={{ padding: 12, background: '#fff', borderRadius: 8 }}>
            <h3>Reports Trend</h3>
            {trendData && trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No data to plot for trend.</p>
            )}
          </div>

          <div style={{ padding: 12, background: '#fff', borderRadius: 8 }}>
            <h3>Top Reporters</h3>
            {reporterDistribution && reporterDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={reporterDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={140} />
                  <Tooltip />
                  <Bar dataKey="value">{reporterDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No reporters to show.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 12, background: '#fff', borderRadius: 8 }}>
            <h3>Distribution (Reporters)</h3>
            {reporterDistribution && reporterDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={reporterDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {reporterDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No distribution to show.</p>
            )}
          </div>

          <div style={{ padding: 12, background: '#fff', borderRadius: 8, overflow: 'auto' }}>
            <h3>Recent Reports</h3>
            {loading ? <p>Loading...</p> : (
              reports.length === 0 ? <p>No reports</p> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {reports.slice(0, 20).map(r => (
                    <li key={r._id} style={{ padding: 8, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{r.description}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{r.reportedBy || 'anonymous'} • {new Date(r.createdAt).toLocaleString()}</div>
                      </div>
                      <div>
                        <button style={{ color: 'red' }} onClick={() => handleDelete(r._id)}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </div>
      </div>

      {/* Relationships Section */}
      <div style={{ marginTop: 20 }}>
        <h2>Relationships & Correlations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
          <div style={{ padding: 12, background: '#fff', borderRadius: 8 }}>
            <h4>Groups & Members</h4>
            {relationships && relationships.groupsUsers && relationships.groupsUsers.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr><th style={{ textAlign: 'left', padding: 8 }}>Group</th><th style={{ textAlign: 'left', padding: 8 }}>Members</th><th style={{ padding: 8 }}>Count</th></tr>
                </thead>
                <tbody>
                  {relationships.groupsUsers.map(g => (
                    <tr key={String(g.groupId)} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: 8 }}>{g.name}</td>
                      <td style={{ padding: 8 }}>{(g.members||[]).map(m=>m.nickname||m.userId).join(', ')}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>{g.memberCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No group membership data available.</p>
            )}
          </div>

          <div style={{ padding: 12, background: '#fff', borderRadius: 8 }}>
            <h4>Top Terms (Overall)</h4>
            {relationships && relationships.topTermsOverall && relationships.topTermsOverall.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={relationships.topTermsOverall.slice(0,20)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="term" type="category" width={160} />
                  <Tooltip />
                  <Bar dataKey="count">{(relationships.topTermsOverall.slice(0,20)).map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No term data available.</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 8 }}>
          <h4>User Chat Counts</h4>
          {relationships && relationships.userChatCounts && relationships.userChatCounts.length > 0 ? (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 8, textAlign: 'left' }}>User</th>
                    <th style={{ padding: 8 }}>Group Msgs</th>
                    <th style={{ padding: 8 }}>Private Msgs</th>
                    <th style={{ padding: 8 }}>Chat History</th>
                    <th style={{ padding: 8 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {relationships.userChatCounts.map(u => (
                    <tr key={u.userId} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: 8 }}>{u.name || u.userId}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>{u.groupMessages}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>{u.privateMessages}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>{u.chatHistory}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>{u.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No user chat counts available.</p>
          )}
        </div>
      </div>

      {/* Create lightweight report form at bottom */}
      <div style={{ marginTop: 16, padding: 12, background: '#fff', borderRadius: 8 }}>
        <h3>Create Quick Report</h3>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} style={{ flex: 1 }} />
          <input placeholder="Short description" value={description} onChange={(e)=>setDescription(e.target.value)} style={{ flex: 2 }} />
          <button onClick={handleCreate}>Create</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
