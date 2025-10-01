import axios from 'axios';

const API_LOGIN = 'http://localhost:3000';

function authHeaders() {
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (_) {
    return {};
  }
}

export async function saveIeltsResult({ type, payload, band }) {
  const res = await axios.post(`${API_LOGIN}/ielts/save`, { type, payload, band }, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    withCredentials: true,
  });
  return res.data;
}

export async function listIeltsResults() {
  const res = await axios.get(`${API_LOGIN}/ielts/list`, {
    headers: { ...authHeaders() },
    withCredentials: true,
  });
  return res.data;
}

export async function getWritingTask(difficulty) {
  const res = await axios.post(`${API_LOGIN}/ielts/writing/task`, { difficulty }, { headers: { ...authHeaders() } });
  return res.data;
}

export async function getReadingTask(difficulty) {
  const res = await axios.post(`${API_LOGIN}/ielts/reading/task`, { difficulty }, { headers: { ...authHeaders() } });
  return res.data;
}

export async function scoreReading(answers, correct) {
  const res = await axios.post(`${API_LOGIN}/ielts/reading/score`, { answers, correct }, { headers: { ...authHeaders() } });
  return res.data;
}

export async function scoreWriting(essay) {
  const res = await axios.post(`${API_LOGIN}/ielts/writing/score`, { essay }, { headers: { ...authHeaders() } });
  return res.data;
}

export async function aiCheckWriting(essay) {
  const res = await axios.post(`${API_LOGIN}/ielts/check-writing`, { essay }, { headers: { ...authHeaders() } });
  return res.data;
}

export async function resultsList() {
  const res = await axios.get(`${API_LOGIN}/ielts/results`, { headers: { ...authHeaders() } });
  return res.data;
}

export async function resultsSave({ type, payload, band }) {
  const res = await axios.post(`${API_LOGIN}/ielts/results/save`, { type, payload, band }, { headers: { ...authHeaders() } });
  return res.data;
}


