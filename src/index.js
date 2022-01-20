import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
} from "firebase/firestore";

import { firebaseConfig } from "./config";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import "./styles.css";

import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/brands";

const key = firebaseConfig.apiKey;

// init firebase app and storage
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

//init serivices
const db = getFirestore();

// connect to collection (ref)
const colRef = collection(db, "kocurros");

// get data (that whould be getDocs) but in real time (onSnapshot)
const catlist = document.getElementsByClassName("catList")[0];

const realTimeGetData = onSnapshot(colRef, (snapshot) => {
  catlist.innerHTML = "";
  let kocurros = [];
  snapshot.docs.forEach((doc) => {
    kocurros.push({ ...doc.data(), id: doc.id });
  });
  kocurros.forEach((cat) => showData(cat));
});

//show data

const showData = (cat) => {
  const html = `
    <div class="cat" name=${cat.id}>
    <div class="img" style="background-image: url(${cat.imgURL});"></div>
      <div class="description">
        <p>${cat.cat_name}</p>
        <p>Age: ${cat.age}</p>
        <p>Castration: ${cat.castration}</p>
        <p>Vaccinated: ${cat.vaccinated}</p>
        <p>Likes other cats: ${cat.likes_cats}</p>
        <p>Likes dogs: ${cat.likes_dogs}</p>
        <p>Notes: ${cat.notes}</p>
      </div>
    </div>
    `;
  catlist.innerHTML += html;
};

//form
const formCont = document.getElementsByClassName("form")[0];
const showForm = document.getElementsByClassName("add")[0];
const close = document.getElementsByClassName("close")[0];
const form = document.getElementsByClassName("quest")[0];
const subBtn = document.getElementsByClassName("submit")[0];

showForm.addEventListener("click", () => {
  formCont.classList.remove("no-show");
});

//closing form window
const closeForm = () => {
  form.reset();
  subBtn.textContent = "Submit";
  formCont.classList.add("no-show");
};

close.addEventListener("click", () => closeForm());

//adding cats to the base

const uploadFiles = (file, cat) => {
  const storageRef = ref(storage, `kocurros/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  uploadTask.on(
    "state_changed",
    (snapshot) => console.log("file uploading..."),
    (error) => console.log(error),
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        addDoc(colRef, { ...cat, imgURL: downloadURL })
          .then(() => closeForm())
          .catch((err) => err.message);
      });
    }
  );
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const file = e.target.imgURL.files[0];
  let cat = {
    cat_name: e.target.catname.value.trim(),
    age: e.target.age.value,
    castration: e.target.castration.value,
    vaccinated: e.target.vaccinated.value,
    likes_cats: e.target.likes_cats.value.trim(),
    likes_dogs: e.target.likes_dogs.value.trim(),
    adopted: e.target.adopted.value,
    notes: e.target.notes.value.trim(),
  };
  subBtn.textContent = "Loading...";
  uploadFiles(file, cat);
});
