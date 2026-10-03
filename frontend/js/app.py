const selectedOptions = new Set();

const optionButtons = document.querySelectorAll(".option");
const continueButton = document.getElementById("continue-button");


// SELECT ALL THAT APPLY

optionButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const value = button.dataset.value;

        if (selectedOptions.has(value)) {

            selectedOptions.delete(value);
            button.classList.remove("selected");

        } else {

            selectedOptions.add(value);
            button.classList.add("selected");

        }

        continueButton.disabled = selectedOptions.size === 0;

    });

});


// CONTINUE

continueButton.addEventListener("click", () => {

    console.log(
        "User is balancing:",
        Array.from(selectedOptions)
    );

    continueButton.textContent = "Saved ✓";

});


// CHECK PYTHON BACKEND

async function checkBackend() {

    const statusText =
        document.getElementById("server-status");

    const statusDot =
        document.getElementById("status-dot");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/health"
        );

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const data = await response.json();

        console.log("Backend:", data);

        statusText.textContent = "Connected";
        statusDot.style.background = "#42c77a";

    } catch (error) {

        console.error(error);

        statusText.textContent = "Offline";
        statusDot.style.background = "#e35454";

    }

}


checkBackend();