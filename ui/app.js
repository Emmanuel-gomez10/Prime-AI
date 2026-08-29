const micButton = document.getElementById("micButton");
const voiceText = document.getElementById("voiceText");
const state = document.getElementById("state");

const API_URL = "http://127.0.0.1:8000";

let mediaRecorder = null;
let audioChunks = [];
let stream = null;
let listening = false;


// ============================================================
// UI STATE
// ============================================================

function setState(newState) {
    state.textContent = newState;
}

function setVoiceText(text) {
    voiceText.textContent = text;
}


// ============================================================
// TEXT TO SPEECH
// ============================================================

function speakPrime(text) {

    if (!("speechSynthesis" in window)) {
        console.warn("Browser speech synthesis is not available.");
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 1.0;
    speech.pitch = 1.0;
    speech.volume = 1.0;

    speech.onstart = () => {
        setState("SPEAKING");
        setVoiceText("PRIME IS SPEAKING...");
    };

    speech.onend = () => {
        setState("STANDBY");
        setVoiceText("VOICE SYSTEM READY");
    };

    speech.onerror = (error) => {
        console.error("Speech error:", error);

        setState("STANDBY");
        setVoiceText("VOICE SYSTEM READY");
    };

    window.speechSynthesis.speak(speech);
}


// ============================================================
// START LISTENING
// ============================================================

async function startListening() {

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        audioChunks = [];

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {

            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }

        };

        mediaRecorder.onstop = async () => {

            const audioBlob = new Blob(
                audioChunks,
                {
                    type: mediaRecorder.mimeType || "audio/webm"
                }
            );

            stream.getTracks().forEach(
                track => track.stop()
            );

            await sendToWhisper(audioBlob);
        };

        mediaRecorder.start();

        listening = true;

        micButton.classList.add("active");

        setState("LISTENING");

        setVoiceText(
            "LISTENING... SPEAK NOW"
        );

        console.log(
            "🎤 PRIME is listening"
        );

    } catch (error) {

        console.error(
            "Microphone error:",
            error
        );

        setState("MIC ERROR");

        setVoiceText(
            "MICROPHONE ERROR"
        );
    }
}


// ============================================================
// STOP LISTENING
// ============================================================

function stopListening() {

    if (
        !mediaRecorder ||
        mediaRecorder.state !== "recording"
    ) {
        return;
    }

    mediaRecorder.stop();

    listening = false;

    micButton.classList.remove("active");

    setState("THINKING");

    setVoiceText(
        "PROCESSING VOICE..."
    );
}


// ============================================================
// SEND AUDIO TO WHISPER
// ============================================================

async function sendToWhisper(audioBlob) {

    try {

        console.log(
            "📡 Sending audio to Whisper..."
        );

        const formData = new FormData();

        formData.append(
            "file",
            audioBlob,
            "prime_voice.webm"
        );

        const response = await fetch(
            `${API_URL}/transcribe`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {

            throw new Error(
                `Whisper HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        console.log(
            "📝 WHISPER RESULT:",
            result
        );

        const text =
            typeof result === "string"
                ? result
                : result.text || "";

        if (!text.trim()) {

            setState("STANDBY");

            setVoiceText(
                "NOTHING HEARD"
            );

            return;
        }

        console.log(
            "🎤 PRIME HEARD:",
            text
        );

        // Show what PRIME heard.
        setVoiceText(text);

        // Send transcription to PRIME.
        await sendToPrime(text);

    } catch (error) {

        console.error(
            "Whisper error:",
            error
        );

        setState("WHISPER ERROR");

        setVoiceText(
            "VOICE TRANSCRIPTION FAILED"
        );
    }
}


// ============================================================
// SEND TEXT TO PRIME
// ============================================================

async function sendToPrime(text) {

    try {

        setState("THINKING");

        setVoiceText(
            "PRIME IS THINKING..."
        );

        console.log(
            "🧠 Sending to PRIME:",
            text
        );

        const response = await fetch(
            `${API_URL}/chat`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message: text
                })
            }
        );

        if (!response.ok) {

            throw new Error(
                `PRIME HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        console.log(
            "🧠 PRIME RESULT:",
            result
        );

        const answer =
            result.response || "";

        if (!answer.trim()) {

            setState("STANDBY");

            setVoiceText(
                "PRIME RETURNED NO RESPONSE"
            );

            return;
        }

        console.log(
            "🔊 PRIME RESPONSE:",
            answer
        );

        // Display PRIME's response.
        setVoiceText(answer);

        // Speak PRIME's response.
        speakPrime(answer);

    } catch (error) {

        console.error(
            "PRIME error:",
            error
        );

        setState("PRIME ERROR");

        setVoiceText(
            "PRIME COULD NOT RESPOND"
        );
    }
}


// ============================================================
// MICROPHONE BUTTON
// ============================================================

micButton.addEventListener(
    "click",
    () => {

        if (listening) {

            stopListening();

        } else {

            startListening();

        }

    }
);