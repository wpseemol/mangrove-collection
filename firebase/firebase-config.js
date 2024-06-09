import { getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyB3owVOhJJ7AP3frHvIwofnPJxZ-6v14Gk',
    authDomain: 'mangrove-collection.firebaseapp.com',
    projectId: 'mangrove-collection',

    storageBucket: 'mangrove-collection.appspot.com',
    messagingSenderId: '61693115052',
    appId: '1:61693115052:web:876ff5db40bc781a05bd09',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firebaseApp = getApp();
export const storage = getStorage(
    firebaseApp,
    'gs://mangrove-collection.appspot.com'
);
