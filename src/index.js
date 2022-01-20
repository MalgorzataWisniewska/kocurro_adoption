import { initializeApp } from "firebase/app";

//imports from firebase
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
} from "firebase/firestore";

//imports from storage
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

//imports from auth
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";

//import (from) files

import { firebaseConfig } from "./config";
import "./styles.css";

//other imports

import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/brands";

// init firebase app and storage and auth
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth();

//init services
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
const qFormCont = document.getElementsByClassName("form")[0];
const showForm = document.getElementsByClassName("add")[0];
const form = document.getElementsByClassName("quest")[0];
const subBtn = document.getElementsByClassName("submit")[0];

showForm.addEventListener("click", () => {
  qFormCont.classList.remove("no-show");
});

//closing form window
const closeForm = (currentForm) => {
  currentForm.reset();
  currentForm.parentElement.classList.add("no-show");
};

Array.from(document.getElementsByClassName("close")).forEach((x) =>
  x.addEventListener("click", () => closeForm(x.nextElementSibling))
);

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
          .then(() => {
            closeForm(form);
            form.getElementsByTagName("button")[0].textContent = "Submit";
          })
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
  subBtn.textContent = "Uploading...";
  uploadFiles(file, cat);
});

// ADMIN
// creating admin account - DONE
// createUserWithEmailAndPassword(auth, "admin@admin.com", "admin123")
//   .then(() => console.log("Admin created"))
//   .catch((err) => console.log(err.message));

//show login form
const showLog = document.getElementsByClassName("loginBtn")[0];
const logoutBtn = document.getElementsByClassName("logout")[0];
const logFormCont = document.getElementsByClassName("form")[1];

showLog.addEventListener("click", (e) => {
  logFormCont.classList.remove("no-show");
});

//login admin
const logForm = document.getElementsByClassName("logForm")[0];
logForm.addEventListener("submit", (e) => {
  e.preventDefault();
  showLog.classList.add("no-show");
  const mail = logForm.login.value;
  const password = logForm.password.value;
  signInWithEmailAndPassword(auth, mail, password)
    .then((cred) => {
      console.log("Admin logged in!:", cred.user);
      logoutBtn.classList.remove("no-show");
      showForm.classList.remove("no-show");
      closeForm(logForm);
    })
    .catch((err) => console.log(err.message));
});

//logout admin
logoutBtn.addEventListener("click", (e) => {
  logoutBtn.classList.add("no-show");
  signOut(auth)
    .then(() => {
      console.log("Admin logged out!");
      showLog.classList.remove("no-show");
      showForm.classList.add("no-show");
    })
    .catch((err) => console.log(err.message));
});

//auth.currentUser
