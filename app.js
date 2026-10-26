import LucidDOM from "luciddom";

const STORAGE_KEY = "daylight-todos";
const root = document.querySelector("#app");

if (!root) {
    throw new Error("The todo app root element was not found.");
}

let todos = [];
const savedTodos = localStorage.getItem(STORAGE_KEY);

if (savedTodos) {
    try {
        const parsedTodos = JSON.parse(savedTodos);
        if (
            !Array.isArray(parsedTodos) ||
            !parsedTodos.every((todo) =>
                todo &&
                typeof todo.id === "string" &&
                typeof todo.text === "string" &&
                typeof todo.completed === "boolean"
            )
        ) {
            throw new TypeError("Saved todo data has an unexpected format.");
        }
        todos = parsedTodos;
    } catch (error) {
        console.error("Could not load saved todos; starting with an empty list.", error);
    }
}

let currentFilter = "all";

const app = new LucidDOM(root);
app.addElement({ tag: "div", className: "page-shell" });
const pageElement = app.element;

const page = new LucidDOM(pageElement);
page.addElement({ tag: "header", className: "topbar" });
const headerElement = page.element;

const header = new LucidDOM(headerElement);
header.addElement({ tag: "a", className: "brand" });
const brandElement = header.element;
brandElement.href = "#app";
brandElement.setAttribute("aria-label", "Daylight home");

const brand = new LucidDOM(brandElement);
brand.addElement({ tag: "span", className: "brand-mark", value: "d" });
brand.addElement({ tag: "span", value: "daylight" });

header.addElement({ tag: "span", className: "top-note", value: "A LITTLE MORE CLARITY" });

page.addElement({ tag: "section", className: "intro" });
const introElement = page.element;
const intro = new LucidDOM(introElement);
intro.addElement({ tag: "p", className: "eyebrow", value: "YOUR SPACE TO FOCUS" });
intro.addElement({ tag: "h1", value: "Make room for what matters." });
intro.addElement({
    tag: "p",
    className: "subtitle",
    value: "A calm place to gather your thoughts and take things one step at a time."
});

page.addElement({ tag: "section", className: "todo-card" });
const cardElement = page.element;
cardElement.setAttribute("aria-label", "Todo list");

const card = new LucidDOM(cardElement);
card.addElement({ tag: "form", className: "todo-form" });
const formElement = card.element;

const form = new LucidDOM(formElement);
form.addElement({
    tag: "input",
    className: "todo-input",
    id: "todo-input",
    type: "text",
    name: "todo",
    value: "",
    placeholder: "What needs to get done?",
    ariaLabel: "New task",
    title: "Enter a task"
});
const inputElement = form.element;
inputElement.maxLength = 160;
inputElement.required = true;
form.addElement({ tag: "button", className: "add-button", type: "submit", value: "Add task" });
const formHandle = new LucidDOM(cardElement).select(".todo-form");
const inputHandle = form.select("#todo-input");

card.addElement({ tag: "div", className: "list-toolbar" });
const toolbarElement = card.element;
toolbarElement.setAttribute("aria-label", "Filter tasks");

const toolbar = new LucidDOM(toolbarElement);
toolbar.addElement({ tag: "div", className: "filters" });
const filtersElement = toolbar.element;
filtersElement.setAttribute("aria-label", "Task filters");

const filters = new LucidDOM(filtersElement);
const filterHandles = new Map();

for (const [filter, label] of [
    ["all", "All"],
    ["active", "Active"],
    ["completed", "Completed"]
]) {
    filters.addElement({
        tag: "button",
        id: `filter-${filter}`,
        className: `filter-button${filter === "all" ? " is-active" : ""}`,
        type: "button",
        value: label
    });
    const filterHandle = filters.select(`#filter-${filter}`);
    filterHandles.set(filter, filterHandle);
    filterHandle.on("click", () => {
        currentFilter = filter;
        render();
    });
}

toolbar.addElement({
    tag: "button",
    className: "clear-button",
    type: "button",
    value: "Clear completed"
});
const clearButtonHandle = toolbar.select(".clear-button");
const clearButtonElement = clearButtonHandle.current;

card.addElement({ tag: "ul", className: "todo-list" });
const taskListElement = card.element;
taskListElement.setAttribute("aria-label", "Tasks");
const taskList = new LucidDOM(taskListElement);

card.addElement({ tag: "div", className: "empty-state" });
const emptyStateElement = card.element;
emptyStateElement.setAttribute("role", "status");

const emptyState = new LucidDOM(emptyStateElement);
emptyState.addElement({ tag: "span", className: "empty-icon", value: "✦" });
emptyState.addElement({ tag: "p", className: "empty-title", value: "A fresh start" });
emptyState.addElement({
    tag: "p",
    className: "empty-copy",
    value: "Add a task above and make today yours."
});
const emptyTitle = emptyState.select(".empty-title");
const emptyCopy = emptyState.select(".empty-copy");

card.addElement({ tag: "footer", className: "card-footer" });
const footerElement = card.element;
const footer = new LucidDOM(footerElement);
footer.addElement({ tag: "span", className: "task-count" });
const taskCount = footer.select(".task-count");
footer.addElement({ tag: "span", className: "footer-note" });
const footerNoteElement = footer.element;
const footerNote = new LucidDOM(footerNoteElement);
footerNote.addElement({ tag: "span", className: "footer-sparkle", value: "✳" });
footerNote.addElement({ tag: "span", value: "One thing at a time" });

page.addElement({
    tag: "p",
    className: "bottom-note",
    value: "Your tasks stay on this device. Take a breath — you've got this."
});

function render() {
    taskList.selectAll(".todo-item").remove();

    const visibleTodos = todos.filter((todo) => {
        if (currentFilter === "active") return !todo.completed;
        if (currentFilter === "completed") return todo.completed;
        return true;
    });

    for (const todo of visibleTodos) {
        taskList.addElement({
            tag: "li",
            className: `todo-item${todo.completed ? " is-complete" : ""}`
        });
        const itemElement = taskList.element;

        const item = new LucidDOM(itemElement);
        item.addElement({ tag: "label", className: "todo-label" });
        const labelElement = item.element;

        const label = new LucidDOM(labelElement);
        label.addElement({
            tag: "input",
            className: "todo-checkbox",
            type: "checkbox",
            value: "",
            ariaLabel: `Mark "${todo.text}" ${todo.completed ? "active" : "complete"}`
        });
        const checkboxElement = label.element;
        checkboxElement.checked = todo.completed;

        label.addElement({ tag: "span", className: "todo-text", value: todo.text });
        const checkboxHandle = new LucidDOM(labelElement).select(".todo-checkbox");
        checkboxHandle.on("change", () => {
            todo.completed = checkboxElement.checked;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
            render();
        });

        item.addElement({
            tag: "button",
            className: "remove-button",
            type: "button",
            value: "×",
            ariaLabel: `Delete "${todo.text}"`,
            title: "Delete task"
        });
        const removeButton = new LucidDOM(itemElement).select(".remove-button");
        removeButton.on("click", () => {
            todos = todos.filter((entry) => entry.id !== todo.id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
            render();
        });
    }

    const remaining = todos.filter((todo) => !todo.completed).length;
    taskCount.update({ value: `${remaining} ${remaining === 1 ? "task" : "tasks"} left` });
    emptyStateElement.hidden = visibleTodos.length > 0;
    taskListElement.hidden = visibleTodos.length === 0;
    clearButtonElement.disabled = !todos.some((todo) => todo.completed);

    if (visibleTodos.length === 0 && todos.length > 0) {
        emptyTitle.update({
            value: currentFilter === "active" ? "All caught up" : "Nothing completed yet"
        });
        emptyCopy.update({
            value: currentFilter === "active"
                ? "You've checked everything off. Enjoy the breathing room."
                : "Finish a task and it will be waiting here."
        });
    } else if (todos.length === 0) {
        emptyTitle.update({ value: "A fresh start" });
        emptyCopy.update({ value: "Add a task above and make today yours." });
    }

    for (const [filter, button] of filterHandles) {
        if (currentFilter === filter) {
            button.addClass("is-active");
        } else {
            button.removeClass("is-active");
        }
    }
}

formHandle.on("submit", (event) => {
    event.preventDefault();
    const text = inputElement.value.trim();
    if (!text) {
        inputHandle.current.focus();
        return;
    }

    todos.unshift({
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        text,
        completed: false
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    inputElement.value = "";
    currentFilter = "all";
    render();
    inputHandle.current.focus();
});

clearButtonHandle.on("click", () => {
    todos = todos.filter((todo) => !todo.completed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    render();
});

render();
