// ==========================================
// DAYFLOW
// Interactive frontend + Python planner
// ==========================================

const API_URL =
    "http://127.0.0.1:8000";

const CALENDAR_START_HOUR = 8;
const CALENDAR_END_HOUR = 21;
const HOUR_HEIGHT = 72;


// ==========================================
// STATE
// ==========================================

let tasks =
    loadStorage(
        "dayflow_tasks",
        []
    );

let fixedBlocks =
    loadStorage(
        "dayflow_blocks",
        []
    );

let generatedPlan =
    loadStorage(
        "dayflow_current_plan",
        []
    );

let weekOffset = 0;


// ==========================================
// DOM
// ==========================================

const blockModal =
    document.getElementById(
        "block-modal"
    );

const taskModal =
    document.getElementById(
        "task-modal"
    );

const chatArea =
    document.getElementById(
        "chat-area"
    );

const chatInput =
    document.getElementById(
        "chat-input"
    );


// ==========================================
// INITIALIZE
// ==========================================

initialize();


function initialize() {

    setupGreeting();

    checkBackend();

    renderCalendar();

    renderTasks();

    updateStats();

    bindEvents();

}


// ==========================================
// EVENTS
// ==========================================

function bindEvents() {

    document
        .getElementById(
            "add-block-button"
        )
        .addEventListener(
            "click",
            () => openBlockModal()
        );


    document
        .getElementById(
            "close-block-modal"
        )
        .addEventListener(
            "click",
            closeBlockModal
        );


    document
        .getElementById(
            "cancel-block"
        )
        .addEventListener(
            "click",
            closeBlockModal
        );


    document
        .getElementById(
            "save-block"
        )
        .addEventListener(
            "click",
            saveBlock
        );


    document
        .getElementById(
            "add-task-button"
        )
        .addEventListener(
            "click",
            openTaskModal
        );


    document
        .getElementById(
            "close-task-modal"
        )
        .addEventListener(
            "click",
            closeTaskModal
        );


    document
        .getElementById(
            "cancel-task"
        )
        .addEventListener(
            "click",
            closeTaskModal
        );


    document
        .getElementById(
            "save-task"
        )
        .addEventListener(
            "click",
            saveTask
        );


    document
        .getElementById(
            "plan-day-button"
        )
        .addEventListener(
            "click",
            planMyDay
        );


    document
        .getElementById(
            "insight-plan-button"
        )
        .addEventListener(
            "click",
            planMyDay
        );


    document
        .getElementById(
            "previous-week"
        )
        .addEventListener(
            "click",
            () => {

                weekOffset--;

                renderCalendar();

            }
        );


    document
        .getElementById(
            "next-week"
        )
        .addEventListener(
            "click",
            () => {

                weekOffset++;

                renderCalendar();

            }
        );


    document
        .getElementById(
            "today-button"
        )
        .addEventListener(
            "click",
            () => {

                weekOffset = 0;

                renderCalendar();

            }
        );


    document
        .querySelectorAll(
            ".quick-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openBlockModal(
                        button.dataset.quickType
                    );

                }
            );

        });


    document
        .getElementById(
            "send-chat"
        )
        .addEventListener(
            "click",
            sendChatMessage
        );


    chatInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
                &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendChatMessage();

            }

        }
    );


    blockModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                blockModal
            ) {

                closeBlockModal();

            }

        }
    );


    taskModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                taskModal
            ) {

                closeTaskModal();

            }

        }
    );

}


// ==========================================
// GREETING
// ==========================================

function setupGreeting() {

    const now =
        new Date();

    const hour =
        now.getHours();

    let greeting =
        "Good evening";


    if (hour < 12) {

        greeting =
            "Good morning";

    }

    else if (hour < 17) {

        greeting =
            "Good afternoon";

    }


    document
        .getElementById(
            "greeting"
        )
        .textContent =
        `${greeting} 👋`;


    document
        .getElementById(
            "today-label"
        )
        .textContent =
        now
            .toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                }
            )
            .toUpperCase();

}


// ==========================================
// BACKEND STATUS
// ==========================================

async function checkBackend() {

    const status =
        document.getElementById(
            "server-status"
        );

    const dot =
        document.getElementById(
            "status-dot"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/api/health`
            );


        if (!response.ok) {

            throw new Error(
                "Backend offline"
            );

        }


        const data =
            await response.json();


        console.log(
            "DayFlow API:",
            data
        );


        status.textContent =
            "Planner online";

        dot.style.background =
            "#91b85e";

        dot.style.boxShadow =
            "0 0 8px rgba(145,184,94,.55)";

    }

    catch (error) {

        status.textContent =
            "Planner offline";

        dot.style.background =
            "#d86464";

    }

}


// ==========================================
// CALENDAR DATES
// ==========================================

function getMonday(
    offset = 0
) {

    const date =
        new Date();

    const day =
        date.getDay();

    const difference =
        day === 0
            ? -6
            : 1 - day;


    date.setDate(
        date.getDate()
        + difference
        + offset * 7
    );


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date;

}


function getWeekDates() {

    const monday =
        getMonday(
            weekOffset
        );

    const dates = [];


    for (
        let index = 0;
        index < 7;
        index++
    ) {

        const date =
            new Date(
                monday
            );


        date.setDate(
            monday.getDate()
            + index
        );


        dates.push(
            date
        );

    }


    return dates;

}


// ==========================================
// CALENDAR
// ==========================================

function renderCalendar() {

    renderCalendarHeader();

    renderCalendarGrid();

    renderCalendarBlocks();

}


function renderCalendarHeader() {

    const header =
        document.getElementById(
            "calendar-header"
        );

    const dates =
        getWeekDates();

    const today =
        new Date();


    const dayNames = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ];


    let html = `

        <div
            class="time-header"
        >
        </div>

    `;


    dates.forEach(
        (date, index) => {

            const isToday =
                sameDate(
                    date,
                    today
                );


            html += `

                <div
                    class="
                        day-header
                        ${
                            isToday
                                ? "today"
                                : ""
                        }
                    "
                >

                    <strong>
                        ${dayNames[index]}
                    </strong>

                    <span
                        class="day-number"
                    >
                        ${date.getDate()}
                    </span>

                </div>

            `;

        }
    );


    header.innerHTML =
        html;


    const first =
        dates[0];

    const last =
        dates[6];


    document
        .getElementById(
            "week-range"
        )
        .textContent =
        `${formatShortDate(first)} – ${formatShortDate(last)}`;

}


function renderCalendarGrid() {

    const grid =
        document.getElementById(
            "calendar-grid"
        );

    const dates =
        getWeekDates();

    const today =
        new Date();


    let timeColumn = `

        <div
            class="time-column"
        >

    `;


    for (
        let hour =
            CALENDAR_START_HOUR;
        hour <=
            CALENDAR_END_HOUR;
        hour++
    ) {

        const top =
            (
                hour
                -
                CALENDAR_START_HOUR
            )
            *
            HOUR_HEIGHT;


        timeColumn += `

            <span
                class="time-label"
                style="
                    top: ${top}px
                "
            >
                ${formatHour(hour)}
            </span>

        `;

    }


    timeColumn +=
        "</div>";


    let html =
        timeColumn;


    dates.forEach(
        (date, index) => {

            const isToday =
                sameDate(
                    date,
                    today
                );


            html += `

                <div
                    class="
                        day-column
                        ${
                            isToday
                                ? "today-column"
                                : ""
                        }
                    "
                    data-day="${index}"
                >
                </div>

            `;

        }
    );


    grid.innerHTML =
        html;

}


function renderCalendarBlocks() {

    fixedBlocks.forEach(
        block => {

            addCalendarBlock(
                block,
                false
            );

        }
    );


    if (
        weekOffset === 0
    ) {

        generatedPlan.forEach(
            block => {

                addGeneratedBlock(
                    block
                );

            }
        );

    }

}


// ==========================================
// FIXED BLOCKS
// ==========================================

function addCalendarBlock(
    block,
    isAI
) {

    const column =
        document.querySelector(
            `.day-column[data-day="${block.day}"]`
        );


    if (!column) {
        return;
    }


    const startMinutes =
        timeToMinutes(
            block.start
        );

    const endMinutes =
        timeToMinutes(
            block.end
        );


    const calendarStart =
        CALENDAR_START_HOUR
        *
        60;


    const top =
        (
            startMinutes
            -
            calendarStart
        )
        /
        60
        *
        HOUR_HEIGHT;


    const height =
        (
            endMinutes
            -
            startMinutes
        )
        /
        60
        *
        HOUR_HEIGHT;


    if (
        height <= 0
    ) {
        return;
    }


    const element =
        document.createElement(
            "div"
        );


    const typeClass =
        isAI
            ? "block-ai"
            : getBlockClass(
                block.type
            );


    element.className =
        `calendar-block ${typeClass}`;


    element.style.top =
        `${top}px`;

    element.style.height =
        `${Math.max(
            height - 4,
            30
        )}px`;


    element.innerHTML = `

        <strong>
            ${
                isAI
                    ? "✦ "
                    : ""
            }
            ${escapeHTML(
                block.title
            )}
        </strong>

        <span>
            ${formatTime12(
                block.start
            )}
            –
            ${formatTime12(
                block.end
            )}
        </span>

        <small>
            ${
                isAI
                    ? "AI planned"
                    : `${escapeHTML(block.type)} 🔒`
            }
        </small>

    `;


    if (!isAI) {

        element.title =
            "Double-click to remove";


        element.addEventListener(
            "dblclick",
            () => {

                deleteBlock(
                    block.id
                );

            }
        );

    }


    column.appendChild(
        element
    );

}


// ==========================================
// GENERATED PLAN
// ==========================================

function addGeneratedBlock(
    block
) {

    const today =
        new Date();

    let dayIndex =
        today.getDay() - 1;


    if (
        dayIndex < 0
    ) {

        dayIndex = 6;

    }


    const converted = {

        title:
            block.title,

        day:
            dayIndex,

        start:
            convertApiTime(
                block.start
            ),

        end:
            convertApiTime(
                block.end
            ),

        type:
            "Study"

    };


    addCalendarBlock(
        converted,
        true
    );

}


// ==========================================
// BLOCK MODAL
// ==========================================

function openBlockModal(
    type = "Class"
) {

    document
        .getElementById(
            "block-type"
        )
        .value =
        type;


    document
        .getElementById(
            "block-title"
        )
        .value =
        "";


    blockModal.classList.remove(
        "hidden"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "block-title"
                )
                .focus();

        },
        50
    );

}


function closeBlockModal() {

    blockModal.classList.add(
        "hidden"
    );

}


function saveBlock() {

    const title =
        document
            .getElementById(
                "block-title"
            )
            .value
            .trim();


    const type =
        document
            .getElementById(
                "block-type"
            )
            .value;


    const day =
        Number(
            document
                .getElementById(
                    "block-day"
                )
                .value
        );


    const start =
        document
            .getElementById(
                "block-start"
            )
            .value;


    const end =
        document
            .getElementById(
                "block-end"
            )
            .value;


    if (!title) {

        showToast(
            "Give the block a name.",
            "!"
        );

        return;

    }


    if (
        timeToMinutes(end)
        <=
        timeToMinutes(start)
    ) {

        showToast(
            "End time must be after start time.",
            "!"
        );

        return;

    }


    const block = {

        id:
            Date.now(),

        title,

        type,

        day,

        start,

        end

    };


    fixedBlocks.push(
        block
    );


    saveBlocks();


    closeBlockModal();

    renderCalendar();

    updateStats();


    showToast(
        `${type} added to your week.`,
        "✓"
    );

}


function deleteBlock(
    id
) {

    fixedBlocks =
        fixedBlocks.filter(
            block =>
                block.id !== id
        );


    saveBlocks();

    renderCalendar();

    updateStats();


    showToast(
        "Calendar block removed.",
        "×"
    );

}


// ==========================================
// TASK MODAL
// ==========================================

function openTaskModal() {

    taskModal.classList.remove(
        "hidden"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "task-title"
                )
                .focus();

        },
        50
    );

}


function closeTaskModal() {

    taskModal.classList.add(
        "hidden"
    );

}


function saveTask() {

    const title =
        document
            .getElementById(
                "task-title"
            )
            .value
            .trim();


    if (!title) {

        showToast(
            "Give the task a name.",
            "!"
        );

        return;

    }


    const task = {

        id:
            Date.now(),

        title,

        category:
            document
                .getElementById(
                    "task-category"
                )
                .value,

        date:
            document
                .getElementById(
                    "task-date"
                )
                .value,

        duration:
            Number(
                document
                    .getElementById(
                        "task-duration"
                    )
                    .value
            ),

        priority:
            document
                .getElementById(
                    "task-priority"
                )
                .value,

        completed:
            false

    };


    tasks.push(
        task
    );


    saveTasks();


    document
        .getElementById(
            "task-title"
        )
        .value =
        "";


    document
        .getElementById(
            "task-date"
        )
        .value =
        "";


    closeTaskModal();

    renderTasks();

    updateStats();


    showToast(
        "Task added.",
        "✓"
    );

}


// ==========================================
// TASK LIST
// ==========================================

function renderTasks() {

    const container =
        document.getElementById(
            "task-list"
        );


    if (
        tasks.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div>
                    🌿
                </div>

                <strong>
                    Your workload is clear.
                </strong>

                Add an assignment or task
                when something comes up.

            </div>

        `;

        return;

    }


    container.innerHTML =
        "";


    tasks.forEach(
        task => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                `task-row ${
                    task.completed
                        ? "completed"
                        : ""
                }`;


            row.innerHTML = `

                <button
                    class="
                        task-check
                        ${
                            task.completed
                                ? "checked"
                                : ""
                        }
                    "
                >

                    ${
                        task.completed
                            ? "✓"
                            : ""
                    }

                </button>


                <div
                    class="task-info"
                >

                    <strong>
                        ${escapeHTML(
                            task.title
                        )}
                    </strong>

                    <span>

                        ${categoryIcon(
                            task.category
                        )}

                        ${task.category}

                        ·

                        ${formatDuration(
                            task.duration
                        )}

                        ${
                            task.date
                                ? (
                                    " · Due " +
                                    formatTaskDate(
                                        task.date
                                    )
                                )
                                : ""
                        }

                    </span>

                </div>


                <span
                    class="
                        priority
                        priority-${task.priority}
                    "
                >
                    ${task.priority}
                </span>


                <button
                    class="delete-task"
                    title="Delete"
                >
                    ×
                </button>

            `;


            row
                .querySelector(
                    ".task-check"
                )
                .addEventListener(
                    "click",
                    () => {

                        toggleTask(
                            task.id
                        );

                    }
                );


            row
                .querySelector(
                    ".delete-task"
                )
                .addEventListener(
                    "click",
                    () => {

                        deleteTask(
                            task.id
                        );

                    }
                );


            container.appendChild(
                row
            );

        }
    );

}


function toggleTask(
    id
) {

    const task =
        tasks.find(
            item =>
                item.id === id
        );


    if (!task) {
        return;
    }


    task.completed =
        !task.completed;


    saveTasks();

    renderTasks();

    updateStats();


    showToast(
        task.completed
            ? "Nice — one less thing."
            : "Task reopened.",
        task.completed
            ? "⚡"
            : "↻"
    );

}


function deleteTask(
    id
) {

    tasks =
        tasks.filter(
            task =>
                task.id !== id
        );


    saveTasks();

    renderTasks();

    updateStats();


    showToast(
        "Task removed.",
        "×"
    );

}


// ==========================================
// PYTHON PLANNER
// ==========================================

async function planMyDay() {

    const openTasks =
        tasks.filter(
            task =>
                !task.completed
        );


    if (
        openTasks.length === 0
    ) {

        showToast(
            "Add a task first so I have something to plan.",
            "💡"
        );

        openTaskModal();

        return;

    }


    setPlanningState(
        true
    );


    addAssistantMessage(
        "Give me a second — I'm sorting your tasks by priority and finding focus blocks."
    );


    try {

        const response =
            await fetch(
                `${API_URL}/api/plan`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            tasks:
                                openTasks
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Planner request failed"
            );

        }


        const data =
            await response.json();


        console.log(
            "Generated plan:",
            data
        );


        generatedPlan =
            data.schedule;


        localStorage.setItem(
            "dayflow_current_plan",
            JSON.stringify(
                generatedPlan
            )
        );


        renderCalendar();

        updateStats();


        addAssistantMessage(
            buildPlannerMessage(
                data
            )
        );


        showToast(
            "Your plan is ready.",
            "✦"
        );

    }

    catch (error) {

        console.error(
            error
        );


        addAssistantMessage(
            "I couldn't reach the Python planner. Make sure the FastAPI server is running on port 8000."
        );


        showToast(
            "Planner connection failed.",
            "!"
        );

    }

    finally {

        setPlanningState(
            false
        );

    }

}


function buildPlannerMessage(
    data
) {

    if (
        data.unscheduled_minutes > 0
    ) {

        return (
            `I built what fits, but you still have ` +
            `${formatDuration(data.unscheduled_minutes)} ` +
            `that doesn't fit in today's current planning window. ` +
            `We should move something or plan part of it tomorrow.`
        );

    }


    return (
        `${data.message} ` +
        `I placed ${data.schedule.length} focus block` +
        `${data.schedule.length === 1 ? "" : "s"} ` +
        `on today's calendar.`
    );

}


function setPlanningState(
    active
) {

    const buttons = [
        document.getElementById(
            "plan-day-button"
        ),

        document.getElementById(
            "insight-plan-button"
        )
    ];


    buttons.forEach(
        button => {

            button.disabled =
                active;

        }
    );


    document
        .getElementById(
            "plan-day-button"
        )
        .innerHTML =
        active
            ? "✦ Building your day..."
            : "✦ Plan my day";


    document
        .getElementById(
            "insight-plan-button"
        )
        .textContent =
        active
            ? "Building..."
            : "✦ Build my plan";

}


// ==========================================
// CHAT
// ==========================================

function sendChatMessage() {

    const message =
        chatInput
            .value
            .trim();


    if (!message) {
        return;
    }


    addUserMessage(
        message
    );


    chatInput.value =
        "";


    showTyping();


    setTimeout(
        () => {

            removeTyping();


            addAssistantMessage(
                getTemporaryAssistantReply(
                    message
                )
            );

        },
        650
    );

}


function addUserMessage(
    text
) {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        "chat-message user-message";


    message.innerHTML = `

        <div class="chat-bubble">

            ${escapeHTML(text)}

        </div>

    `;


    chatArea.appendChild(
        message
    );


    scrollChat();

}


function addAssistantMessage(
    text
) {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        "chat-message assistant-message";


    message.innerHTML = `

        <div class="assistant-avatar">
            ✦
        </div>

        <div class="chat-bubble">
            ${escapeHTML(text)}
        </div>

    `;


    chatArea.appendChild(
        message
    );


    scrollChat();

}


function showTyping() {

    removeTyping();


    const message =
        document.createElement(
            "div"
        );


    message.id =
        "typing-message";


    message.className =
        "chat-message assistant-message";


    message.innerHTML = `

        <div class="assistant-avatar">
            ✦
        </div>

        <div class="chat-bubble">

            <div class="typing-dots">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatArea.appendChild(
        message
    );


    scrollChat();

}


function removeTyping() {

    const typing =
        document.getElementById(
            "typing-message"
        );


    if (typing) {

        typing.remove();

    }

}


function scrollChat() {

    chatArea.scrollTop =
        chatArea.scrollHeight;

}


// Temporary until Gemini endpoint is connected.

function getTemporaryAssistantReply(
    message
) {

    const lower =
        message.toLowerCase();


    if (
        lower.includes("work")
        &&
        lower.includes("class")
    ) {

        return (
            "Got it — you're balancing school and work. " +
            "Add those fixed times with the quick buttons, " +
            "then I'll build your flexible tasks around them."
        );

    }


    if (
        lower.includes("assignment")
        ||
        lower.includes("project")
        ||
        lower.includes("homework")
    ) {

        return (
            "That sounds like a flexible task. " +
            "Add it below with an estimated duration and deadline, " +
            "then I can send it to the Python planner."
        );

    }


    if (
        lower.includes("overwhelmed")
        ||
        lower.includes("stressed")
        ||
        lower.includes("too much")
    ) {

        return (
            "Let's get everything out of your head first. " +
            "Add the things that cannot move, then your tasks. " +
            "I'll help organize the rest."
        );

    }


    return (
        "I hear you. The conversational AI connection is coming next. " +
        "For now, use the quick-add controls and I'll use the real Python planner to build the schedule."
    );

}


// ==========================================
// STATS
// ==========================================

function updateStats() {

    const open =
        tasks.filter(
            task =>
                !task.completed
        );


    const completed =
        tasks.filter(
            task =>
                task.completed
        );


    const workload =
        open.reduce(
            (
                total,
                task
            ) =>
                total +
                task.duration,
            0
        );


    const planned =
        generatedPlan.reduce(
            (
                total,
                block
            ) =>
                total +
                block.duration,
            0
        );


    document
        .getElementById(
            "open-task-count"
        )
        .textContent =
        open.length;


    document
        .getElementById(
            "workload-total"
        )
        .textContent =
        formatDuration(
            workload
        );


    document
        .getElementById(
            "block-count"
        )
        .textContent =
        fixedBlocks.length;


    document
        .getElementById(
            "completed-count"
        )
        .textContent =
        completed.length;


    document
        .getElementById(
            "task-count-badge"
        )
        .textContent =
        tasks.length;


    document
        .getElementById(
            "focus-block-count"
        )
        .textContent =
        generatedPlan.length;


    document
        .getElementById(
            "planned-time"
        )
        .textContent =
        formatDuration(
            planned
        );


    updateInsight(
        open,
        workload
    );

}


function updateInsight(
    open,
    workload
) {

    const title =
        document.getElementById(
            "insight-title"
        );

    const description =
        document.getElementById(
            "insight-description"
        );


    if (
        open.length === 0
    ) {

        title.textContent =
            "A plan that leaves space.";

        description.textContent =
            (
                "Add your commitments and tasks. " +
                "DayFlow will build focus time around " +
                "the things that can't move."
            );

        return;

    }


    if (
        workload <= 120
    ) {

        title.textContent =
            "You've got breathing room.";

        description.textContent =
            (
                `About ${formatDuration(workload)} ` +
                "of flexible work is waiting. " +
                "This should fit comfortably."
            );

    }

    else if (
        workload <= 300
    ) {

        title.textContent =
            "A focused day.";

        description.textContent =
            (
                `You have ${formatDuration(workload)} ` +
                "of open work. We'll protect the important " +
                "tasks first and keep breaks between blocks."
            );

    }

    else {

        title.textContent =
            "That's a packed workload.";

        description.textContent =
            (
                `You're carrying ${formatDuration(workload)} ` +
                "of unfinished work. We may need to spread " +
                "some of it across multiple days."
            );

    }

}


// ==========================================
// STORAGE
// ==========================================

function saveTasks() {

    localStorage.setItem(
        "dayflow_tasks",
        JSON.stringify(
            tasks
        )
    );

}


function saveBlocks() {

    localStorage.setItem(
        "dayflow_blocks",
        JSON.stringify(
            fixedBlocks
        )
    );

}


function loadStorage(
    key,
    fallback
) {

    try {

        const value =
            localStorage.getItem(
                key
            );


        if (!value) {

            return fallback;

        }


        return JSON.parse(
            value
        );

    }

    catch (error) {

        console.error(
            `Could not load ${key}`,
            error
        );


        return fallback;

    }

}


// ==========================================
// TOAST
// ==========================================

let toastTimer;


function showToast(
    message,
    icon = "✓"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    document
        .getElementById(
            "toast-message"
        )
        .textContent =
        message;


    document
        .getElementById(
            "toast-icon"
        )
        .textContent =
        icon;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2400
        );

}


// ==========================================
// HELPERS
// ==========================================

function timeToMinutes(
    time
) {

    const [
        hour,
        minute
    ] =
        time
            .split(":")
            .map(Number);


    return (
        hour * 60
        +
        minute
    );

}


function convertApiTime(
    time
) {

    const match =
        time.match(
            /(\d+):(\d+)\s(AM|PM)/
        );


    if (!match) {

        return "09:00";

    }


    let hour =
        Number(
            match[1]
        );

    const minute =
        match[2];

    const period =
        match[3];


    if (
        period === "PM"
        &&
        hour !== 12
    ) {

        hour += 12;

    }


    if (
        period === "AM"
        &&
        hour === 12
    ) {

        hour = 0;

    }


    return (
        `${String(hour).padStart(2, "0")}:${minute}`
    );

}


function formatTime12(
    time
) {

    const [
        rawHour,
        minute
    ] =
        time
            .split(":")
            .map(Number);


    const period =
        rawHour >= 12
            ? "pm"
            : "am";


    let hour =
        rawHour % 12;


    if (
        hour === 0
    ) {

        hour = 12;

    }


    return (
        `${hour}:${String(minute).padStart(2, "0")}${period}`
    );

}


function formatHour(
    hour
) {

    const period =
        hour >= 12
            ? "pm"
            : "am";


    let display =
        hour % 12;


    if (
        display === 0
    ) {

        display = 12;

    }


    return (
        `${display}${period}`
    );

}


function formatDuration(
    minutes
) {

    if (
        minutes === 0
    ) {

        return "0h";

    }


    if (
        minutes < 60
    ) {

        return `${minutes}m`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const remaining =
        minutes % 60;


    if (
        remaining === 0
    ) {

        return `${hours}h`;

    }


    return (
        `${hours}h ${remaining}m`
    );

}


function formatTaskDate(
    dateString
) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date
        .toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        );

}


function formatShortDate(
    date
) {

    return date
        .toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        );

}


function sameDate(
    first,
    second
) {

    return (
        first.getFullYear()
        ===
        second.getFullYear()
        &&
        first.getMonth()
        ===
        second.getMonth()
        &&
        first.getDate()
        ===
        second.getDate()
    );

}


function getBlockClass(
    type
) {

    const classes = {

        Class:
            "block-class",

        Work:
            "block-work",

        Study:
            "block-study",

        Personal:
            "block-personal"

    };


    return (
        classes[type]
        ||
        "block-personal"
    );

}


function categoryIcon(
    category
) {

    const icons = {

        School: "🎓",

        Work: "💼",

        Personal: "🏠",

        Clubs: "👥"

    };


    return (
        icons[category]
        ||
        "•"
    );

}


function escapeHTML(
    text
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        text;


    return element.innerHTML;

}