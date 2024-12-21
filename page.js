import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGTLfT_jA9DeHOzwNz2CorRsfT5pA5iXc",
    authDomain: "loanlogin-cbbed.firebaseapp.com",
    databaseURL: "https://loanlogin-cbbed-default-rtdb.firebaseio.com",
    projectId: "loanlogin-cbbed",
    storageBucket: "loanlogin-cbbed.firebasestorage.app",
    messagingSenderId: "1063577623718",
    appId: "1:1063577623718:web:92d5778a3b58d953fa2867"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

console.log("Firebase connected successfully!");

async function addMoodData(userId, mood) {
    try {
        // Firebase reference
        const moodRef = collection(db, "Users", userId, "Moods");
        const docRef = await addDoc(moodRef, {
            Mood: mood,
            Date: new Date().toISOString(),
        });
        console.log("Mood added with ID: ", docRef.id);
        animateButtonClick(mood); // Add animation after mood is saved
    } catch (error) {
        console.error("Error adding mood: ", error);
        displayError("Oops, something went wrong while saving your mood. Please try again.");
    }
}

// Function to trigger button animation
function animateButtonClick(mood) {
    const button = document.getElementById(mood.toLowerCase() + "Btn");
    button.classList.add("active");
    setTimeout(() => {
        button.classList.remove("active");
    }, 200); // Animation duration
}

// Fetch the latest mood and respond accordingly
async function fetchLatestMoodAndRespond(userId) {
    try {
        const moodRef = collection(db, "Users", userId, "Moods");
        const q = query(moodRef, orderBy("Date", "desc"), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const latestMood = querySnapshot.docs[0].data().Mood;
            console.log("Latest Mood:", latestMood);

            // Display chatbot response based on the latest mood
            displayChatResponse(latestMood);
            updateMoodChart(userId);
        } else {
            console.log("No mood data found for this user.");
            displayChatResponse("Neutral"); // Default response if no mood data
            updateMoodChart(userId, true); // Display empty graph if no data
        }
    } catch (error) {
        console.error("Error fetching mood from Firestore:", error);
        displayError("There was an issue fetching your mood data. Please try again later.");
    }
}

// Get the chatbot response based on the mood
function getChatResponse(mood) {
    const responses = {
        Happy: "That's great to hear! Keep smiling and spreading positivity! 😊",
        Sad: "I'm sorry you're feeling this way. Remember, it's okay to feel sad sometimes. Take care of yourself! ❤️",
        Neutral: "Feeling neutral is perfectly fine. Take a moment to relax and reflect. ✨",
        Angry: "It’s okay to feel angry, but try to express it in a healthy way. Take a deep breath. 💨",
    };
    return responses[mood] || "I'm here for you. Please share how you're feeling. 💬";
}

// Display the chatbot response
function displayChatResponse(mood) {
    const response = getChatResponse(mood);
    const chatResponseEl = document.getElementById("chatResponse");
    chatResponseEl.textContent = response;
    chatResponseEl.style.display = "block"; // Show the response
}

// Display error message
function displayError(message) {
    const chatResponseEl = document.getElementById("chatResponse");
    chatResponseEl.textContent = message;
    chatResponseEl.style.color = "red"; // Set error message color
}

// Update the mood chart with user data
async function updateMoodChart(userId, isEmpty = false) {
    if (isEmpty) {
        // Show an empty chart or a placeholder message
        const ctx = document.getElementById('moodChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Happy', 'Sad', 'Neutral', 'Angry'],
                datasets: [{
                    label: 'Mood Counts',
                    data: [0, 0, 0, 0], // No mood data yet
                    backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF8C00']
                }]
            },
            options: {
                animation: {
                    duration: 1000, // Smooth chart animation
                    easing: 'easeInOutQuad',
                }
            }
        });
        return;
    }

    // If mood data is available, proceed with chart update
    const moodRef = collection(db, "Users", userId, "Moods");
    const querySnapshot = await getDocs(moodRef);
    
    const moodCounts = { Happy: 0, Sad: 0, Neutral: 0, Angry: 0 };
    querySnapshot.forEach(doc => {
        const mood = doc.data().Mood;
        moodCounts[mood]++;
    });

    const ctx = document.getElementById('moodChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Happy', 'Sad', 'Neutral', 'Angry'],
            datasets: [{
                label: 'Mood Counts',
                data: [moodCounts.Happy, moodCounts.Sad, moodCounts.Neutral, moodCounts.Angry],
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF8C00']
            }]
        },
        options: {
            animation: {
                duration: 1000, // Smooth chart animation
                easing: 'easeInOutQuad',
            }
        }
    });
}

// Event listeners for mood buttons
document.getElementById("happyBtn").addEventListener("click", () => {
    addMoodData("user123", "Happy");
    displayChatResponse("Happy");
    updateMoodChart("user123");
});

document.getElementById("sadBtn").addEventListener("click", () => {
    addMoodData("user123", "Sad");
    displayChatResponse("Sad");
    updateMoodChart("user123");
});

document.getElementById("neutralBtn").addEventListener("click", () => {
    addMoodData("user123", "Neutral");
    displayChatResponse("Neutral");
    updateMoodChart("user123");
});

document.getElementById("angryBtn").addEventListener("click", () => {
    addMoodData("user123", "Angry");
    displayChatResponse("Angry");
    updateMoodChart("user123");
});

// Fetch the latest mood data and respond
fetchLatestMoodAndRespond("user123");