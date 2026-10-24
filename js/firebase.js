// js/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBKTKw3az-6zAaEYRTG0ctw2ey57h666AI",
  authDomain: "app-respira-d5ef4.firebaseapp.com",
  projectId: "app-respira-d5ef4",
  storageBucket: "app-respira-d5ef4.firebasestorage.app",
  messagingSenderId: "225988879984",
  appId: "1:225988879984:web:4a3e3e60a79d44519bf6b5"
};
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
auth.languageCode = 'pt-BR';
export const db = firebase.firestore();
// Ativa persistência offline para o app funcionar sem internet
// (dados ficam em cache e sincronizam quando a conexão volta).
db.enablePersistence({ synchronizeTabs: false }).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistência offline desativada: múltiplas abas abertas.');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistência offline não suportada neste navegador.');
  }
});
// Exporta FieldValue para os outros módulos não dependerem do global `firebase`
export const FieldValue = firebase.firestore.FieldValue;
// Firebase Storage não é usado (mídia fica em base64 no Firestore).