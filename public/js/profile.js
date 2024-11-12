// For Fetching Data

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/profile")
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error("Error fetching profile data:", data.error);
        return;
      }
      document.getElementById("firstname").value = data.firstname;
      document.getElementById("lastname").value = data.lastname;
      document.getElementById("phone").value = data.phone;
      document.getElementById("residence").value = data.residence;
      document.getElementById("email").value = data.email;
      document.getElementById("username").value = data.username;
    })
    .catch((error) => console.error("Error:", error));
});
