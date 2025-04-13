const evtSource = new EventSource("sse");

document.addEventListener("DOMContentLoaded", () => {
    const eventList = document.querySelector("ul");
    evtSource.onmessage = (e) => {
        const newElement = document.createElement("li");

        newElement.textContent = `message: ${e.data}`;
        eventList.appendChild(newElement);
    };

    evtSource.onerror = (e) => {
        console.log(e)
    };
});


