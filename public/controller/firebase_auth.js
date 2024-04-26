import { 
    getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

import { app } from "./firebase_core.js";
import { DEV } from "../model/constants.js";
import { homePageView, resetInventoryList } from "../view/home_page.js";
import { signinPageView } from "../view/signin_page.js";
import { routePathnames, routing } from "./route_controller.js";
import { userInfo } from "../view/elements.js";

const auth = getAuth(app);

export let currentUser = null;

export async function signinFirebase(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
    } catch (error) {
        handleAuthError(error);
    }
}

export function attachAuthStateChangeObserver() {
    onAuthStateChanged(auth, authStateChangeListener);
}

function authStateChangeListener(user) {
    currentUser = user;
    if (user) {
        handleUserAuthenticated();
    } else {
        handleUserNotAuthenticated();
    }
}

export async function signOutFirebase() {
    await signOut(auth);
}

function handleAuthError(error) {
    if (DEV) console.log('Sign-in error:', error);
    const errorCode = error.code;
    const errorMessage = error.message;
    alert('Sign-in Error: ' + errorCode + ' ' + errorMessage);
}

function handleUserAuthenticated() {
    userInfo.textContent = currentUser.email;
    showElementsWithClass('myclass-postauth');
    hideElementsWithClass('myclass-preauth');
    routing(window.location.pathname, window.location.hash);
}

function handleUserNotAuthenticated() {
    userInfo.textContent = 'No User';
    resetInventoryList();
    hideElementsWithClass('myclass-postauth');
    showElementsWithClass('myclass-preauth');
    history.pushState(null, null, routePathnames.HOME);
    signinPageView();
}

function showElementsWithClass(className) {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.replace('d-none', 'd-block');
    }
}

function hideElementsWithClass(className) {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.replace('d-block', 'd-none');
    }
}
