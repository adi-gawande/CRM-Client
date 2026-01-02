// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = 'https://crm-server-ecru.vercel.app';
// const BASE_URL = "http://localhost:5001";

export async function get(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

export async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function put(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function del(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}
