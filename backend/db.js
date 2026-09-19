const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

if (!getApps().length) initializeApp();
const db = getFirestore();

const clients = db.collection("clients");

async function createClient({ name, website, socials }) {
  const ref = clients.doc();
  const client = {
    id: ref.id,
    name,
    website,
    socials: socials || {},
    competitors: [],
    icps: [],
    createdAt: FieldValue.serverTimestamp(),
  };
  await ref.set(client);
  return client;
}

async function getClient(id) {
  const doc = await clients.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function updateClient(id, data) {
  await clients.doc(id).update(data);
  return getClient(id);
}

async function listClients() {
  const snap = await clients.orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = { db, createClient, getClient, updateClient, listClients };
