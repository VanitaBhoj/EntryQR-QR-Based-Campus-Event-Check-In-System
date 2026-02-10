const resultDiv = document.getElementById("result");
const beep = document.getElementById("beep");

const ADMIN_OR_VOLUNTEER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ODg5MGU2ZTQ2YmU2ZDg3Mzg4NDlkYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MDcyMjI5MywiZXhwIjoxNzcwODA4NjkzfQ.96zxs2shvQB0GCGCBRkjfWK5_VNyXNPDxfPQnSbVez4";

let lastScanned = null;

function onScanSuccess(decodedText) {
  if (decodedText === lastScanned) return;
  lastScanned = decodedText;

  beep.play();
  navigator.vibrate?.(200);

  fetch(`http://localhost:5000/api/checkin/${decodedText}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ADMIN_OR_VOLUNTEER_TOKEN}`
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      resultDiv.innerHTML =
        `✅ Checked in: <b>${data.name}</b>`;
      resultDiv.className = "msg success";
    } 
    else if (data.status === "already_checked_in") {
      resultDiv.innerHTML = "⚠ Already checked in";
      resultDiv.className = "msg error";
    } 
    else {
      resultDiv.innerHTML = "❌ Invalid QR";
      resultDiv.className = "msg error";
    }
  })
  .catch(() => {
    resultDiv.innerHTML = "❌ Server error";
    resultDiv.className = "msg error";
  });

  setTimeout(() => lastScanned = null, 2000);
}

new Html5Qrcode("reader").start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  onScanSuccess
);
