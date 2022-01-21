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
        <p>${cat.gender}
        <p>Age: ${cat.age}</p>
        <p>Status: ${cat.adopted}</p>
        <p>Castration: ${cat.castrated}</p>
        <p>Vaccinated: ${cat.vaccinated}</p>
        <p>Likes other cats: ${cat.likes_cats}</p>
        <p>Likes dogs: ${cat.likes_dogs}</p>
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
    gender: e.target.gender.value,
    age: Number(e.target.age.value),
    castrated: e.target.castrated.value === "true",
    vaccinated: e.target.vaccinated.value === "true",
    likes_cats: e.target.likes_cats.value === "true",
    likes_dogs: e.target.likes_dogs.value === "true",
    adopted: e.target.adopted.value === "true",
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
const loginErr = document.getElementsByClassName("mssg")[0];
logForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const mail = logForm.login.value;
  const password = logForm.password.value;
  signInWithEmailAndPassword(auth, mail, password)
    .then((cred) => {
      console.log("Admin logged in!:", cred.user);
      showLog.classList.add("no-show");
      logoutBtn.classList.remove("no-show");
      showForm.classList.remove("no-show");
      closeForm(logForm);
    })
    .catch((err) => {
      loginErr.textContent = err.message.split("/")[1].slice(0, -2);
      setTimeout(() => {
        logForm.reset();
        loginErr.textContent = "";
      }, 1000);
    });
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
