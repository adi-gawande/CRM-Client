// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// const BASE_URL = 'https://crm-server-ecru.vercel.app';
const BASE_URL = "http://localhost:5001";

export async function get(endpoint, companyId = null) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (companyId) {
    url.searchParams.append("companyId", companyId);
  }

  const res = await fetch(url.toString(), {
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

export async function del(endpoint, body = null) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  return res.json();
}
