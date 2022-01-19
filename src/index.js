import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "./config";

const key = firebaseConfig.apiKey;

// init firebase app
initializeApp(firebaseConfig);

//init serivices
const db = getFirestore();

// connect to collection (ref)
const colRef = collection(db, "kocurros");

// get data
getDocs(colRef)
  .then((snapshot) => {
    let kocurros = [];
    snapshot.docs.forEach((doc) => {
      kocurros.push({ ...doc.data(), id: doc.id });
    });
    console.log(kocurros);
  })
  .catch((err) => console.log(err.message));
