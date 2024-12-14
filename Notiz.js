const LOCAL_STORAGE_KEY = "notespage-notes";
const notesListEl = document.querySelector(".notes-list");
const saveButtonEL = document.querySelector(".save-note");
const deleteButtonEl = document.querySelector(".delete-note");
const newNoteButtonEl = document.querySelector(".create-new");
const titleInputEL = document.getElementById("title-input");
const contentInputEL = document.getElementById("content-input");

saveButtonEL.addEventListener("click", clickSaveButton);
newNoteButtonEl.addEventListener("click", newNote);
deleteButtonEl.addEventListener("click", clickDeleteButton);
displayNotesList();
applyListeners();

function applyListeners() {
  const noteEntriesEls = document.querySelectorAll(".note-entry");

  noteEntriesEls.forEach((noteEntry) => {
    noteEntry.addEventListener("click", () =>
      selectNote(noteEntry.getAttribute("data-id"))
    );
  });
}

function displayNotesList() {
  const notes = getNotes();
  const sortedNotes = notes.sort(
    (noteA, noteB) => noteB.lastUpdated - noteA.lastUpdated
  );
  let html = "";

  sortedNotes.forEach((note) => {
    html += `
  
          <div class="note-entry" data-id="${note.id}">
            <h2 class="note-title">${escapeHtml(note.title)}</h2>
            <div class="note-content-teaser">
           ${escapeHtml(note.content)}
            </div>
            <div class="note-date">${new Date(
              note.lastUpdate
            ).toLocaleDateString("de-CH")}</div>
          </div>
        
    `;
  });

  notesListEl.innerHTML = html;
}

function clickSaveButton() {
  const title = titleInputEL.value;
  const content = contentInputEL.value;

  if (!title || !content) {
    alert("Bitte Title und Inhalt eingeben.");
    return;
  }

  saveNotes(title, content, Number(getCurrentlySelectedId()));
  displayNotesList();
  applyListeners();

  titleInputEL.value = "";
  contentInputEL.value = "";
}

function getNotes() {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
}

function saveNotes(title, content, id = undefined) {
  const notes = getNotes();

  if (!id) {
    notes.push({
      title,
      content,
      id: getNextId(),
      lastUpdate: new Date().getTime(),
    });
  } else {
    const indexOfNoteWithId = notes.findIndex((note) => note.id === id);

    if (indexOfNoteWithId > -1) {
      notes[indexOfNoteWithId] = {
        title,
        content,
        id,
        lastUpdate: new Date().getTime(),
      };
    }
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
}

function deleteNote(id) {
  if (!id) return;

  const notes = getNotes();

  const filteredNotes = notes.filter((note) => note.id !== Number(id));

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredNotes));
}

function getNextId() {
  const notes = getNotes();
  const sortedNotes = notes.sort((noteA, noteB) => noteA.id - noteB.id);
  let nextId = 1;
  for (let note of sortedNotes) {
    if (nextId < note.id) break;
    nextId = note.id + 1;
  }

  return nextId;
}

function clickDeleteButton() {
  const CurrentlySelectedId = getCurrentlySelectedId();
  if (!CurrentlySelectedId) return;

  deleteNote(CurrentlySelectedId);

  titleInputEL.value = "";
  contentInputEL.value = "";

  displayNotesList();
  applyListeners();
}

function selectNote(id) {
  const selectedNoteEl = document.querySelector(`.note-entry[data-id="${id}"]`);

  removeSelectedClassFromAllNotes();

  if (selectedNoteEl.classList.contains("selected-note")) return;

  selectedNoteEl.classList.add("selected-note");

  const notes = getNotes();

  const selectedNote = notes.find((note) => note.id === Number(id));
  if (!selectedNote) return;

  titleInputEL.value = selectedNote.title;
  contentInputEL.value = selectedNote.content;
}

function newNote() {
  titleInputEL.value = "";
  contentInputEL.value = "";
  removeSelectedClassFromAllNotes();
}

function removeSelectedClassFromAllNotes() {
  const noteEntriesEls = document.querySelectorAll(".note-entry");
  noteEntriesEls.forEach((noteEntry) => {
    noteEntry.classList.remove("selected-note");
  });
}

function getCurrentlySelectedId() {
  let currentId = undefined;

  const currentlySelectedNoteEl = document.querySelector(".selected-note");
  if (currentlySelectedNoteEl) {
    currentId = currentlySelectedNoteEl.getAttribute("data-id");
  }

  return currentId;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
