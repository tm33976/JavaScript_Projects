document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const sidebar = document.getElementById("sidebar")
  const toggleSidebarBtn = document.getElementById("toggle-sidebar")
  const showSidebarBtn = document.getElementById("show-sidebar-btn")
  const newNoteBtn = document.getElementById("new-note-btn")
  const newFolderBtn = document.getElementById("new-folder-btn")
  const searchInput = document.getElementById("search-notes")
  const viewOptions = document.querySelectorAll(".view-option")
  const foldersList = document.getElementById("folders-list")
  const tagsContainer = document.getElementById("tags-container")
  const importBtn = document.getElementById("import-btn")
  const exportBtn = document.getElementById("export-btn")
  const settingsBtn = document.getElementById("settings-btn")
  const themeToggle = document.getElementById("theme-toggle")
  const currentViewTitle = document.getElementById("current-view-title")
  const sortOptions = document.getElementById("sort-options")
  const listViewBtn = document.getElementById("list-view-btn")
  const gridViewBtn = document.getElementById("grid-view-btn")
  const notesContainer = document.getElementById("notes-container")
  const noteTitle = document.getElementById("note-title")
  const saveStatus = document.getElementById("save-status")
  const favoriteBtn = document.getElementById("favorite-btn")
  const calendarBtn = document.getElementById("calendar-btn")
  const historyBtn = document.getElementById("history-btn")
  const saveBtn = document.getElementById("save-btn")
  const deleteNoteBtn = document.getElementById("delete-note-btn")
  const noteTags = document.getElementById("note-tags")
  const wordCount = document.getElementById("word-count")
  const lastModified = document.getElementById("last-modified")
  const toastContainer = document.getElementById("toast-container")

  // Calendar Elements
  const calendarSection = document.getElementById("calendar-section")
  const notesListSection = document.getElementById("notes-list-section")
  const noteEditorSection = document.getElementById("note-editor-section")
  const prevMonthBtn = document.getElementById("prev-month-btn")
  const nextMonthBtn = document.getElementById("next-month-btn")
  const todayBtn = document.getElementById("today-btn")
  const prevYearBtn = document.getElementById("prev-year-btn")
  const nextYearBtn = document.getElementById("next-year-btn")
  const currentMonthDisplay = document.getElementById("current-month-display")
  const currentYearDisplay = document.getElementById("current-year-display")
  const calendarDays = document.getElementById("calendar-days")

  // Modals
  const folderModal = document.getElementById("folder-modal")
  const folderNameInput = document.getElementById("folder-name-input")
  const cancelFolderBtn = document.getElementById("cancel-folder")
  const createFolderBtn = document.getElementById("create-folder")

  const tagModal = document.getElementById("tag-modal")
  const tagNameInput = document.getElementById("tag-name-input")
  const cancelTagBtn = document.getElementById("cancel-tag")
  const createTagBtn = document.getElementById("create-tag")

  const quickNoteModal = document.getElementById("quick-note-modal")
  const quickNoteDate = document.getElementById("quick-note-date")
  const quickNoteTitle = document.getElementById("quick-note-title")
  const cancelQuickNoteBtn = document.getElementById("cancel-quick-note")
  const saveQuickNoteBtn = document.getElementById("save-quick-note")

  const calendarNoteModal = document.getElementById("calendar-note-modal")
  const calendarDate = document.getElementById("calendar-date")
  const calendarNoteSelect = document.getElementById("calendar-note-select")
  const cancelCalendarNoteBtn = document.getElementById("cancel-calendar-note")
  const addCalendarNoteBtn = document.getElementById("add-calendar-note")

  const settingsModal = document.getElementById("settings-modal")
  const fontSizeSelect = document.getElementById("font-size")
  const fontFamilySelect = document.getElementById("font-family")
  const lineSpacingSelect = document.getElementById("line-spacing")
  const autoSaveInput = document.getElementById("auto-save")
  const apiUrlInput = document.getElementById("api-url")
  const apiKeyInput = document.getElementById("api-key")
  const testApiBtn = document.getElementById("test-api")
  const clearAllDataBtn = document.getElementById("clear-all-data")
  const closeSettingsBtn = document.getElementById("close-settings")

  const historyModal = document.getElementById("history-modal")
  const historyList = document.getElementById("history-list")
  const closeHistoryBtn = document.getElementById("close-history")

  const confirmModal = document.getElementById("confirm-modal")
  const confirmTitle = document.getElementById("confirm-title")
  const confirmMessage = document.getElementById("confirm-message")
  const cancelConfirmBtn = document.getElementById("cancel-confirm")
  const confirmActionBtn = document.getElementById("confirm-action")

  // State
  let notes = []
  let folders = []
  let tags = []
  let calendarNotes = []
  let currentNote = null
  let currentFolder = null
  let currentTag = null
  let currentView = "calendar"
  let currentSort = "date-desc"
  let currentViewMode = "grid"
  let selectedDate = null
  let currentDate = new Date()
  let autoSaveInterval = 2000 // 2 seconds
  let autoSaveTimer = null
  let editorFontSize = "16px"
  let editorFontFamily = "Inter, sans-serif"
  let editorLineHeight = 1.5
  let isDarkTheme = false
  let confirmCallback = null
  let apiUrl = window.APP_CONFIG.apiUrl || ""
  let apiKey = window.APP_CONFIG.apiKey || ""
  let quill = null
  let quickNoteQuill = null
  let selectedDateForQuickNote = null

  // Initialize
  function init() {
    initQuillEditor()
    loadSettings()
    loadNotes()
    loadFolders()
    loadTags()
    loadCalendarNotes()
    renderFolders()
    renderTags()
    renderNotes()
    renderCalendar()
    setupEventListeners()
    applySettings()

    // Show empty editor state initially
    showEmptyEditor()

    // Set initial view
    switchView("calendar")

    // Set document title
    document.title = window.APP_CONFIG.appName || "Calendar Notes Pro"
  }

  // Initialize Quill Editor
  function initQuillEditor() {
    // Main editor
    quill = new Quill("#editor", {
      theme: "snow",
      placeholder: "Write something...",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image", "code-block", "blockquote"],
          ["clean"],
        ],
      },
    })

    // Quick note editor
    quickNoteQuill = new Quill("#quick-note-editor", {
      theme: "snow",
      placeholder: "Write a quick note...",
      modules: {
        toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["link"]],
      },
    })

    // Update word count on text change
    quill.on("text-change", () => {
      if (!currentNote) return

      // Clear previous timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }

      updateSaveStatus("Saving...")
      updateWordCount()

      // Set new timer
      autoSaveTimer = setTimeout(() => {
        updateNote()
      }, autoSaveInterval)
    })
  }

  // Load settings from localStorage
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("settings")) || {}
    autoSaveInterval = settings.autoSaveInterval || 2000
    editorFontSize = settings.editorFontSize || "16px"
    editorFontFamily = settings.editorFontFamily || "Inter, sans-serif"
    editorLineHeight = settings.editorLineHeight || 1.5
    isDarkTheme = settings.isDarkTheme || false
    currentViewMode = settings.viewMode || "grid"
    apiUrl = settings.apiUrl || window.APP_CONFIG.apiUrl || ""
    apiKey = settings.apiKey || window.APP_CONFIG.apiKey || ""

    // Update UI to reflect settings
    autoSaveInput.value = autoSaveInterval / 1000
    fontSizeSelect.value = editorFontSize === "14px" ? "small" : editorFontSize === "18px" ? "large" : "medium"
    fontFamilySelect.value = editorFontFamily
    lineSpacingSelect.value = editorLineHeight
    apiUrlInput.value = apiUrl
    apiKeyInput.value = apiKey

    if (isDarkTheme) {
      document.body.classList.add("dark-theme")
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
    }

    if (currentViewMode === "list") {
      notesContainer.classList.remove("grid-view")
      notesContainer.classList.add("list-view")
      listViewBtn.classList.add("active")
      gridViewBtn.classList.remove("active")
    } else {
      notesContainer.classList.add("grid-view")
      notesContainer.classList.remove("list-view")
      gridViewBtn.classList.add("active")
      listViewBtn.classList.remove("active")
    }
  }

  // Apply settings to the editor
  function applySettings() {
    document.documentElement.style.setProperty("--editor-font-size", editorFontSize)
    document.documentElement.style.setProperty("--editor-line-height", editorLineHeight)

    // Apply font family to Quill editor
    if (quill) {
      const editorElement = document.querySelector(".ql-editor")
      if (editorElement) {
        editorElement.style.fontFamily = editorFontFamily
      }
    }
  }

  // Save settings to localStorage
  function saveSettings() {
    const settings = {
      autoSaveInterval,
      editorFontSize,
      editorFontFamily,
      editorLineHeight,
      isDarkTheme,
      viewMode: currentViewMode,
      apiUrl,
      apiKey,
    }
    localStorage.setItem("settings", JSON.stringify(settings))
  }

  // Load notes from localStorage or API
  function loadNotes() {
    if (apiUrl && apiKey && window.APP_CONFIG.enableCloudSync) {
      // Try to load from API
      fetchNotes().catch(() => {
        // Fallback to localStorage if API fails
        notes = JSON.parse(localStorage.getItem("notes")) || []
      })
    } else {
      // Load from localStorage
      notes = JSON.parse(localStorage.getItem("notes")) || []
    }
  }

  // Fetch notes from API
  async function fetchNotes() {
    try {
      const response = await fetch(`${apiUrl}/notes`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch notes from API")
      }

      const data = await response.json()
      notes = data.notes
      return notes
    } catch (error) {
      showToast("error", "API Error", error.message)
      throw error
    }
  }

  // Save notes to localStorage or API
  function saveNotes() {
    try {
      // Check available storage space before saving
      const storageEstimate = getLocalStorageUsage()

      // Serialize notes to check size
      const notesString = JSON.stringify(notes)
      const notesSize = new Blob([notesString]).size

      // If we're approaching storage limits, warn the user
      if (storageEstimate.percentUsed > 80) {
        showToast(
          "warning",
          "Storage Warning",
          `Your local storage is ${Math.round(storageEstimate.percentUsed)}% full. Consider exporting and clearing old notes.`,
        )
      }

      // Save to localStorage
      localStorage.setItem("notes", notesString)

      // Also save to API if configured
      if (apiUrl && apiKey && window.APP_CONFIG.enableCloudSync) {
        // Also save to API
        saveNotesToApi().catch((error) => {
          showToast("warning", "API Warning", "Failed to sync with API, but notes are saved locally")
          if (window.APP_CONFIG.debug) {
            console.error("API sync error:", error)
          }
        })
      }

      return { success: true }
    } catch (error) {
      console.error("Error saving notes:", error)

      // Determine error type and provide specific guidance
      let errorMessage = "An unknown error occurred while saving your note."
      let recoveryMessage = "Please try again later."

      if (
        error.name === "QuotaExceededError" ||
        error.message.includes("quota") ||
        error.message.includes("storage") ||
        error.code === 22
      ) {
        errorMessage = "Storage quota exceeded."
        recoveryMessage = "Please export your notes, then delete some to free up space."
      } else if (error.name === "SecurityError") {
        errorMessage = "Browser security settings prevented saving."
        recoveryMessage = "Try enabling cookies and local storage in your browser settings."
      } else if (error.name === "InvalidStateError") {
        errorMessage = "The browser is in private browsing mode."
        recoveryMessage = "Try using regular browsing mode or export your notes."
      }

      showErrorModal("Save Error", errorMessage, recoveryMessage)
      return { success: false, error: error }
    }
  }

  // Helper function to estimate localStorage usage
  function getLocalStorageUsage() {
    let total = 0
    let used = 0

    try {
      // Estimate total localStorage size (5MB is common)
      total = 5 * 1024 * 1024

      // Calculate current usage
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length * 2 // UTF-16 uses 2 bytes per character
        }
      }

      return {
        used: used,
        total: total,
        percentUsed: (used / total) * 100,
      }
    } catch (e) {
      console.error("Error calculating storage usage:", e)
      return { used: 0, total: 1, percentUsed: 0 }
    }
  }

  // Show error modal with guidance
  function showErrorModal(title, errorMessage, recoveryMessage) {
    const modal = document.createElement("div")
    modal.className = "modal active error-modal"
    modal.innerHTML = `
      <div class="modal-content error-modal-content">
        <div class="error-icon"><i class="fas fa-exclamation-circle"></i></div>
        <h3>${title}</h3>
        <p class="error-message">${errorMessage}</p>
        <p class="recovery-message">${recoveryMessage}</p>
        <div class="error-actions">
          <button id="error-help-btn" class="secondary-button">Get Help</button>
          <button id="error-close-btn" class="primary-button">Close</button>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Add event listeners
    modal.querySelector("#error-close-btn").addEventListener("click", () => {
      document.body.removeChild(modal)
    })

    modal.querySelector("#error-help-btn").addEventListener("click", () => {
      // Open help documentation or support
      window.open("https://support.calendarnotespro.com/storage-issues", "_blank")
      document.body.removeChild(modal)
    })

    // Close when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal)
      }
    })
  }

  // Save notes to API
  async function saveNotesToApi() {
    try {
      const response = await fetch(`${apiUrl}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        throw new Error("Failed to save notes to API")
      }

      return await response.json()
    } catch (error) {
      showToast("error", "API Error", error.message)
      throw error
    }
  }

  // Load folders from localStorage
  function loadFolders() {
    folders = JSON.parse(localStorage.getItem("folders")) || []
  }

  // Save folders to localStorage
  function saveFolders() {
    try {
      localStorage.setItem("folders", JSON.stringify(folders))
      if (window.APP_CONFIG && window.APP_CONFIG.debug) {
        console.log("Folders saved to localStorage", folders)
      }
    } catch (error) {
      console.error("Error saving folders to localStorage:", error)
      showToast("error", "Storage Error", "Failed to save folders. Local storage might be full or unavailable.")
    }
  }

  // Load tags from localStorage
  function loadTags() {
    tags = JSON.parse(localStorage.getItem("tags")) || []
  }

  // Save tags to localStorage
  function saveTags() {
    localStorage.setItem("tags", JSON.stringify(tags))
  }

  // Load calendar notes from localStorage
  function loadCalendarNotes() {
    calendarNotes = JSON.parse(localStorage.getItem("calendarNotes")) || []
  }

  // Save calendar notes to localStorage
  function saveCalendarNotes() {
    localStorage.setItem("calendarNotes", JSON.stringify(calendarNotes))
  }

  // Create a new note
  function createNote(date = null, title = "Untitled Note", content = "") {
    const newNote = {
      id: Date.now(),
      title: title,
      content: content,
      folder: currentFolder,
      tags: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    }

    notes.unshift(newNote)
    saveNotes()
    renderNotes()

    // If date is provided, associate the note with that date
    if (date) {
      addNoteToCalendar(newNote.id, date)
    }

    openNote(newNote.id)
    showToast("success", "Note Created", "New note has been created successfully")

    return newNote
  }

  // Open a note in the editor
  function openNote(noteId) {
    currentNote = notes.find((note) => note.id === noteId)

    if (!currentNote) {
      showEmptyEditor()
      return
    }

    // Update editor content
    noteTitle.value = currentNote.title
    quill.root.innerHTML = currentNote.content

    // Update favorite button
    if (currentNote.isFavorite) {
      favoriteBtn.innerHTML = '<i class="fas fa-star"></i>'
    } else {
      favoriteBtn.innerHTML = '<i class="far fa-star"></i>'
    }

    // Update last modified
    updateLastModified()

    // Update word count
    updateWordCount()

    // Update tags
    renderNoteTags()

    // Update active note in the list
    const noteCards = document.querySelectorAll(".note-card")
    noteCards.forEach((card) => {
      if (Number.parseInt(card.dataset.id) === currentNote.id) {
        card.classList.add("active")
      } else {
        card.classList.remove("active")
      }
    })

    // Show editor on mobile
    document.body.classList.add("note-editor-active")

    // Switch to editor view
    noteEditorSection.style.display = "flex"
    notesListSection.style.display = "flex"
    calendarSection.style.display = "none"
  }

  // Show empty editor state
  function showEmptyEditor() {
    noteTitle.value = ""
    if (quill) {
      quill.root.innerHTML = ""
    }
    favoriteBtn.innerHTML = '<i class="far fa-star"></i>'
    noteTags.innerHTML = ""
    wordCount.textContent = "0 words"
    lastModified.textContent = "Last modified: Never"
    currentNote = null
  }

  // Update a note
  function updateNote() {
    if (!currentNote) {
      showToast("error", "Error", "No note to save")
      return false
    }

    try {
      // Save current state to history (only if content has changed)
      if (currentNote.title !== noteTitle.value || currentNote.content !== quill.root.innerHTML) {
        saveToHistory()
      }

      currentNote.title = noteTitle.value
      currentNote.content = quill.root.innerHTML
      currentNote.updatedAt = new Date().toISOString()

      // Try to save notes and handle any errors
      const saveResult = saveNotes()

      if (saveResult.success) {
        renderNotes()
        renderCalendar() // Re-render calendar to update note titles
        updateLastModified()
        updateSaveStatus("All changes saved")
        return true
      } else {
        updateSaveStatus("Save failed")
        return false
      }
    } catch (error) {
      console.error("Error updating note:", error)
      updateSaveStatus("Save failed")
      return false
    }
  }

  // Save current note state to history
  function saveToHistory() {
    if (!currentNote) return

    // Initialize history array if it doesn't exist
    if (!currentNote.history) {
      currentNote.history = []
    }

    // Limit history to 10 entries
    if (currentNote.history.length >= 10) {
      currentNote.history.pop()
    }

    // Add current state to history
    currentNote.history.unshift({
      title: currentNote.title,
      content: currentNote.content,
      timestamp: new Date().toISOString(),
    })
  }

  // Delete a note
  function deleteNote(noteId) {
    const noteToDelete = noteId || (currentNote ? currentNote.id : null)
    if (!noteToDelete) return

    // Remove note from calendar
    calendarNotes = calendarNotes.filter((cn) => cn.noteId !== noteToDelete)
    saveCalendarNotes()

    // Remove the note
    notes = notes.filter((note) => note.id !== noteToDelete)
    saveNotes()

    if (currentNote && currentNote.id === noteToDelete) {
      showEmptyEditor()
    }

    renderNotes()
    renderCalendar()
    showToast("info", "Note Deleted", "Note has been deleted successfully")
  }

  // Toggle favorite status of a note
  function toggleFavorite() {
    if (!currentNote) return

    currentNote.isFavorite = !currentNote.isFavorite

    if (currentNote.isFavorite) {
      favoriteBtn.innerHTML = '<i class="fas fa-star"></i>'
      showToast("success", "Added to Favorites", "Note has been added to favorites")
    } else {
      favoriteBtn.innerHTML = '<i class="far fa-star"></i>'
      showToast("info", "Removed from Favorites", "Note has been removed from favorites")
    }

    saveNotes()
    renderNotes()
  }

  // Create a new folder
  function createFolder(name) {
    if (!name || name.trim() === "") {
      throw new Error("Folder name cannot be empty")
    }

    // Check if folder with the same name already exists
    const existingFolder = folders.find((folder) => folder.name.toLowerCase() === name.toLowerCase())
    if (existingFolder) {
      throw new Error(`A folder named "${name}" already exists`)
    }

    const newFolder = {
      id: Date.now(),
      name: name,
    }

    folders.push(newFolder)
    saveFolders()
    renderFolders()

    return newFolder
  }

  // Delete a folder
  function deleteFolder(folderId) {
    folders = folders.filter((folder) => folder.id !== folderId)
    saveFolders()

    // Update notes that were in this folder
    notes.forEach((note) => {
      if (note.folder === folderId) {
        note.folder = null
      }
    })
    saveNotes()

    if (currentFolder === folderId) {
      currentFolder = null
      currentView = "all"
      updateCurrentViewTitle()
    }

    renderFolders()
    renderNotes()
    showToast("info", "Folder Deleted", "Folder has been deleted successfully")
  }

  // Create a new tag
  function createTag(name) {
    // Check if tag already exists
    const existingTag = tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase())
    if (existingTag) return existingTag

    const newTag = {
      id: Date.now(),
      name: name,
    }

    tags.push(newTag)
    saveTags()
    renderTags()
    showToast("success", "Tag Created", `Tag "${name}" has been created`)

    return newTag
  }

  // Delete a tag
  function deleteTag(tagId) {
    tags = tags.filter((tag) => tag.id !== tagId)
    saveTags()

    // Remove tag from notes
    notes.forEach((note) => {
      note.tags = note.tags.filter((tag) => tag !== tagId)
    })
    saveNotes()

    if (currentTag === tagId) {
      currentTag = null
      currentView = "all"
      updateCurrentViewTitle()
    }

    renderTags()
    renderNotes()
    showToast("info", "Tag Deleted", "Tag has been deleted successfully")
  }

  // Add a tag to the current note
  function addTagToNote(tagId) {
    if (!currentNote) return

    // Check if tag is already added
    if (!currentNote.tags.includes(tagId)) {
      currentNote.tags.push(tagId)
      saveNotes()
      renderNoteTags()
      showToast("success", "Tag Added", "Tag has been added to the note")
    }
  }

  // Remove a tag from the current note
  function removeTagFromNote(tagId) {
    if (!currentNote) return

    currentNote.tags = currentNote.tags.filter((tag) => tag !== tagId)
    saveNotes()
    renderNoteTags()
    showToast("info", "Tag Removed", "Tag has been removed from the note")
  }

  // Add a note to the calendar
  function addNoteToCalendar(noteId, date) {
    // Format date to YYYY-MM-DD
    const formattedDate = formatDateForCalendar(date)

    // Check if this note is already on this date
    const existingEntry = calendarNotes.find((cn) => cn.noteId === noteId && cn.date === formattedDate)
    if (existingEntry) return

    // Add new calendar note
    const calendarNote = {
      id: Date.now(),
      noteId: noteId,
      date: formattedDate,
    }

    calendarNotes.push(calendarNote)
    saveCalendarNotes()
    renderCalendar()

    const note = notes.find((n) => n.id === noteId)
    if (note) {
      showToast("success", "Added to Calendar", `Note "${note.title}" has been added to ${formatDateForDisplay(date)}`)
    }

    return calendarNote
  }

  // Remove a note from the calendar
  function removeNoteFromCalendar(calendarNoteId) {
    const calendarNote = calendarNotes.find((cn) => cn.id === calendarNoteId)
    if (!calendarNote) return

    calendarNotes = calendarNotes.filter((cn) => cn.id !== calendarNoteId)
    saveCalendarNotes()
    renderCalendar()

    const note = notes.find((n) => n.id === calendarNote.noteId)
    if (note) {
      showToast("info", "Removed from Calendar", `Note "${note.title}" has been removed from the calendar`)
    }
  }

  // Format date for calendar (YYYY-MM-DD)
  function formatDateForCalendar(date) {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  // Format date for display
  function formatDateForDisplay(date) {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // Filter notes based on current view, folder, tag, and search
  function filterNotes(searchTerm = "") {
    let filteredNotes = [...notes]

    // Filter by view
    if (currentView === "recent") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filteredNotes = filteredNotes.filter((note) => new Date(note.updatedAt) >= oneWeekAgo)
    } else if (currentView === "favorites") {
      filteredNotes = filteredNotes.filter((note) => note.isFavorite)
    } else if (currentView === "calendar" && selectedDate) {
      // Filter notes for selected date
      const formattedDate = formatDateForCalendar(selectedDate)
      const noteIds = calendarNotes.filter((cn) => cn.date === formattedDate).map((cn) => cn.noteId)
      filteredNotes = filteredNotes.filter((note) => noteIds.includes(note.id))
    }

    // Filter by folder
    if (currentFolder) {
      filteredNotes = filteredNotes.filter((note) => note.folder === currentFolder)
    }

    // Filter by tag
    if (currentTag) {
      filteredNotes = filteredNotes.filter((note) => note.tags.includes(currentTag))
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredNotes = filteredNotes.filter(
        (note) => note.title.toLowerCase().includes(term) || stripHtml(note.content).toLowerCase().includes(term),
      )
    }

    // Sort notes
    if (currentSort === "date-desc") {
      filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    } else if (currentSort === "date-asc") {
      filteredNotes.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    } else if (currentSort === "alpha-asc") {
      filteredNotes.sort((a, b) => a.title.localeCompare(b.title))
    } else if (currentSort === "alpha-desc") {
      filteredNotes.sort((a, b) => b.title.localeCompare(a.title))
    }

    return filteredNotes
  }

  // Render notes in the notes container
  function renderNotes() {
    const filteredNotes = filterNotes(searchInput.value)
    notesContainer.innerHTML = ""

    if (filteredNotes.length === 0) {
      const emptyState = document.createElement("div")
      emptyState.className = "empty-state"
      emptyState.innerHTML = `
                <i class="fas fa-sticky-note"></i>
                <h3>No notes found</h3>
                <p>${searchInput.value ? "Try a different search term" : "Create a new note to get started"}</p>
            `
      notesContainer.appendChild(emptyState)
      return
    }

    filteredNotes.forEach((note) => {
      const noteCard = document.createElement("div")
      noteCard.className = "note-card"
      if (currentNote && note.id === currentNote.id) {
        noteCard.classList.add("active")
      }
      noteCard.dataset.id = note.id

      const formattedDate = formatDate(note.updatedAt)
      const noteContent = stripHtml(note.content).substring(0, 100)

      noteCard.innerHTML = `
                <div class="note-card-header">
                    <div class="note-card-title">${note.title}</div>
                    ${note.isFavorite ? '<div class="note-card-favorite"><i class="fas fa-star"></i></div>' : ""}
                </div>
                <div class="note-card-content">${noteContent}</div>
                <div class="note-card-footer">
                    <div class="note-card-date">${formattedDate}</div>
                    <div class="note-card-tags">
                        ${note.tags
                          .slice(0, 2)
                          .map((tagId) => {
                            const tag = tags.find((t) => t.id === tagId)
                            return tag ? `<div class="note-card-tag">${tag.name}</div>` : ""
                          })
                          .join("")}
                        ${note.tags.length > 2 ? `<div class="note-card-tag">+${note.tags.length - 2}</div>` : ""}
                    </div>
                </div>
            `

      noteCard.addEventListener("click", () => {
        openNote(note.id)
      })

      notesContainer.appendChild(noteCard)
    })
  }

  // Render calendar
  function renderCalendar() {
    // Update month and year display
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    currentMonthDisplay.textContent = monthNames[currentDate.getMonth()]
    currentYearDisplay.textContent = currentDate.getFullYear()

    // Get first day of month and number of days
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Get days from previous month
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()

    // Clear calendar days
    const calendarDaysContainer = document.getElementById("calendar-days")
    calendarDaysContainer.innerHTML = ""

    // Create calendar grid
    const dayCount = 1
    let nextMonthDay = 1

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDate = daysInPrevMonth - (firstDay - i - 1)
      const dayElement = createCalendarDay(prevMonthDate, true, new Date(prevYear, prevMonth, prevMonthDate))
      calendarDaysContainer.appendChild(dayElement)
    }

    // Current month days
    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear()
      const isSelected =
        selectedDate &&
        i === selectedDate.getDate() &&
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear()
      const dayElement = createCalendarDay(i, false, new Date(year, month, i), isToday, isSelected)
      calendarDaysContainer.appendChild(dayElement)
    }

    // Next month days
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    const remainingCells = 42 - (firstDay + daysInMonth) // 42 = 6 rows * 7 days

    for (let i = 0; i < remainingCells; i++) {
      const dayElement = createCalendarDay(nextMonthDay, true, new Date(nextYear, nextMonth, nextMonthDay))
      calendarDaysContainer.appendChild(dayElement)
      nextMonthDay++
    }
  }

  // Create a calendar day element
  function createCalendarDay(day, isOtherMonth, date, isToday = false, isSelected = false) {
    const dayElement = document.createElement("div")
    dayElement.className = "calendar-day"
    if (isOtherMonth) dayElement.classList.add("other-month")
    if (isToday) dayElement.classList.add("today")
    if (isSelected) dayElement.classList.add("selected")

    const formattedDate = formatDateForCalendar(date)
    dayElement.dataset.date = formattedDate

    // Check if this day has notes
    const dayNotes = calendarNotes.filter((cn) => cn.date === formattedDate)
    if (dayNotes.length > 0) {
      dayElement.classList.add("has-notes")
    }

    // Day number
    const dayNumber = document.createElement("div")
    dayNumber.className = "calendar-day-number"
    dayNumber.textContent = day
    dayElement.appendChild(dayNumber)

    // Notes for this day
    const notesContainer = document.createElement("div")
    notesContainer.className = "calendar-day-notes"

    dayNotes.forEach((calendarNote) => {
      const note = notes.find((n) => n.id === calendarNote.noteId)
      if (note) {
        const noteElement = document.createElement("div")
        noteElement.className = "calendar-note"
        noteElement.innerHTML = `
          <span class="calendar-note-title">${note.title}</span>
          <div class="calendar-note-actions">
            <button class="calendar-note-action" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="calendar-note-action" title="Remove"><i class="fas fa-times"></i></button>
          </div>
        `
        noteElement.dataset.noteId = note.id
        noteElement.dataset.calendarNoteId = calendarNote.id

        // Click to open note
        noteElement.querySelector(".calendar-note-title").addEventListener("click", (e) => {
          e.stopPropagation()
          openNote(note.id)
        })

        // Edit note
        noteElement.querySelector('.calendar-note-action[title="Edit"]').addEventListener("click", (e) => {
          e.stopPropagation()
          openNote(note.id)
        })

        // Remove from calendar
        noteElement.querySelector('.calendar-note-action[title="Remove"]').addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()
          showConfirmModal("Remove Note", `Remove "${note.title}" from calendar?`, () => {
            removeNoteFromCalendar(calendarNote.id)
          })
        })

        notesContainer.appendChild(noteElement)
      }
    })

    dayElement.appendChild(notesContainer)

    // Add note button
    const addNoteBtn = document.createElement("button")
    addNoteBtn.className = "calendar-day-add-note"
    addNoteBtn.innerHTML = '<i class="fas fa-plus"></i>'
    addNoteBtn.title = "Add Quick Note"
    addNoteBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      showQuickNoteModal(date)
    })
    dayElement.appendChild(addNoteBtn)

    // Click to select day
    dayElement.addEventListener("click", () => {
      // Remove selected class from all days
      document.querySelectorAll(".calendar-day.selected").forEach((el) => {
        el.classList.remove("selected")
      })

      // Add selected class to this day
      dayElement.classList.add("selected")

      // Update selected date
      selectedDate = date

      // Update notes list to show notes for this date
      currentView = "calendar"
      updateCurrentViewTitle(formatDateForDisplay(date))
      renderNotes()
    })

    // Double click to add note
    dayElement.addEventListener("dblclick", () => {
      showQuickNoteModal(date)
    })

    return dayElement
  }

  // Show quick note modal
  function showQuickNoteModal(date) {
    // Set date in modal
    quickNoteDate.textContent = formatDateForDisplay(date)
    selectedDateForQuickNote = date

    // Clear previous values
    quickNoteTitle.value = ""
    quickNoteQuill.root.innerHTML = ""

    // Show modal
    quickNoteModal.classList.add("active")
    quickNoteTitle.focus()
  }

  // Show calendar note modal
  function showCalendarNoteModal(date) {
    // Set date in modal
    calendarDate.value = formatDateForCalendar(date)

    // Populate note select
    calendarNoteSelect.innerHTML = '<option value="">Create New Note</option>'
    notes.forEach((note) => {
      const option = document.createElement("option")
      option.value = note.id
      option.textContent = note.title
      calendarNoteSelect.appendChild(option)
    })

    // Show modal
    calendarNoteModal.classList.add("active")
  }

  // Render folders in the sidebar
  function renderFolders() {
    foldersList.innerHTML = ""

    folders.forEach((folder) => {
      const folderItem = document.createElement("li")
      folderItem.className = "folder-item"
      if (currentFolder === folder.id) {
        folderItem.classList.add("active")
      }

      folderItem.innerHTML = `
                <div class="folder-name">
                    <i class="fas fa-folder"></i>
                    <span>${folder.name}</span>
                </div>
                <div class="folder-actions">
                    <button class="folder-delete"><i class="fas fa-trash"></i></button>
                </div>
            `

      folderItem.querySelector(".folder-name").addEventListener("click", () => {
        currentFolder = folder.id
        currentTag = null
        currentView = "folder"
        updateCurrentViewTitle(folder.name)
        renderFolders()
        renderNotes()
      })

      folderItem.querySelector(".folder-delete").addEventListener("click", (e) => {
        e.stopPropagation()
        showConfirmModal("Delete Folder", `Are you sure you want to delete the folder "${folder.name}"?`, () => {
          deleteFolder(folder.id)
        })
      })

      foldersList.appendChild(folderItem)
    })
  }

  // Render tags in the sidebar
  function renderTags() {
    tagsContainer.innerHTML = ""

    tags.forEach((tag) => {
      const tagElement = document.createElement("div")
      tagElement.className = "tag"
      if (currentTag === tag.id) {
        tagElement.classList.add("active")
      }

      tagElement.innerHTML = `
                <span>${tag.name}</span>
                <span class="tag-remove"><i class="fas fa-times"></i></span>
            `

      tagElement.addEventListener("click", () => {
        currentTag = tag.id
        currentFolder = null
        currentView = "tag"
        updateCurrentViewTitle(tag.name)
        renderTags()
        renderNotes()
      })

      tagElement.querySelector(".tag-remove").addEventListener("click", (e) => {
        e.stopPropagation()
        deleteTag(tag.id)
      })

      tagsContainer.appendChild(tagElement)
    })
  }

  // Render tags for the current note
  function renderNoteTags() {
    if (!currentNote) return

    noteTags.innerHTML = ""

    currentNote.tags.forEach((tagId) => {
      const tag = tags.find((t) => t.id === tagId)
      if (!tag) return

      const tagElement = document.createElement("div")
      tagElement.className = "tag"

      tagElement.innerHTML = `
                <span>${tag.name}</span>
                <span class="tag-remove"><i class="fas fa-times"></i></span>
            `

      tagElement.querySelector(".tag-remove").addEventListener("click", () => {
        removeTagFromNote(tagId)
      })

      noteTags.appendChild(tagElement)
    })
  }

  // Update the current view title
  function updateCurrentViewTitle(name = "") {
    if (currentView === "all") {
      currentViewTitle.textContent = "All Notes"
    } else if (currentView === "recent") {
      currentViewTitle.textContent = "Recent Notes"
    } else if (currentView === "favorites") {
      currentViewTitle.textContent = "Favorite Notes"
    } else if (currentView === "folder") {
      currentViewTitle.textContent = name
    } else if (currentView === "tag") {
      currentViewTitle.textContent = `#${name}`
    } else if (currentView === "calendar") {
      currentViewTitle.textContent = name || "Calendar Notes"
    }
  }

  // Update the word count
  function updateWordCount() {
    if (!currentNote) return

    const text = stripHtml(quill.root.innerHTML)
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    wordCount.textContent = `${words} word${words !== 1 ? "s" : ""}`
  }

  // Update the last modified timestamp
  function updateLastModified() {
    if (!currentNote) return

    const formattedDate = formatDate(currentNote.updatedAt)
    lastModified.textContent = `Last modified: ${formattedDate}`
  }

  // Update the save status
  function updateSaveStatus(message) {
    if (!saveStatus) return

    // Add appropriate class based on message
    saveStatus.className = "" // Reset classes

    if (message === "Saving...") {
      saveStatus.classList.add("saving")
    } else if (message === "All changes saved") {
      saveStatus.classList.add("saved")
    } else if (message === "Save failed") {
      saveStatus.classList.add("error")
    }

    saveStatus.textContent = message

    // Reset after 2 seconds if it was a success or error
    if (message !== "Saving...") {
      setTimeout(() => {
        if (saveStatus.textContent === message) {
          saveStatus.className = "saved"
          saveStatus.textContent = "All changes saved"
        }
      }, 2000)
    }
  }

  // Format a date string
  function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) {
      return "Just now"
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Strip HTML tags from a string
  function stripHtml(html) {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  // Show confirm modal
  function showConfirmModal(title, message, callback) {
    confirmTitle.textContent = title
    confirmMessage.textContent = message
    confirmCallback = callback
    confirmModal.classList.add("active")
  }

  // Show toast notification
  function showToast(type, title, message) {
    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    let icon = ""
    switch (type) {
      case "success":
        icon = '<i class="fas fa-check-circle toast-icon"></i>'
        break
      case "error":
        icon = '<i class="fas fa-exclamation-circle toast-icon"></i>'
        break
      case "warning":
        icon = '<i class="fas fa-exclamation-triangle toast-icon"></i>'
        break
      case "info":
      default:
        icon = '<i class="fas fa-info-circle toast-icon"></i>'
        break
    }

    toast.innerHTML = `
      ${icon}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close"><i class="fas fa-times"></i></button>
    `

    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.style.animation = "toast-out 0.3s forwards"
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast)
        }
      }, 300)
    })

    toastContainer.appendChild(toast)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toast.style.animation = "toast-out 0.3s forwards"
        setTimeout(() => {
          if (toastContainer.contains(toast)) {
            toastContainer.removeChild(toast)
          }
        }, 300)
      }
    }, 5000)
  }

  // Switch view
  function switchView(view) {
    currentView = view

    // Update active view option
    viewOptions.forEach((option) => {
      if (option.dataset.view === view) {
        option.classList.add("active")
      } else {
        option.classList.remove("active")
      }
    })

    // Show/hide sections based on view
    if (view === "calendar") {
      calendarSection.style.display = "flex"
      notesListSection.style.display = "flex"
      noteEditorSection.style.display = "none"
      renderCalendar()
      updateCurrentViewTitle()
    } else {
      calendarSection.style.display = "none"
      notesListSection.style.display = "flex"
      noteEditorSection.style.display = "flex"
      updateCurrentViewTitle()
      renderNotes()
    }
  }

  // Test API connection
  async function testApiConnection() {
    try {
      const response = await fetch(`${apiUrl}/test`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("API connection failed")
      }

      showToast("success", "API Connection", "Successfully connected to API")
      return true
    } catch (error) {
      showToast("error", "API Connection Failed", error.message)
      return false
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Sidebar toggle
    toggleSidebarBtn.addEventListener("click", () => {
      document.body.classList.add("sidebar-collapsed")
    })

    // Show sidebar button
    showSidebarBtn.addEventListener("click", () => {
      document.body.classList.remove("sidebar-collapsed")
    })

    // New note button
    newNoteBtn.addEventListener("click", createNote)

    // New folder button
    newFolderBtn.addEventListener("click", () => {
      folderNameInput.value = ""
      folderModal.classList.add("active")
      folderNameInput.focus()
    })

    // Search input
    searchInput.addEventListener("input", () => {
      renderNotes()
    })

    // View options
    viewOptions.forEach((option) => {
      option.addEventListener("click", () => {
        switchView(option.dataset.view)
      })
    })

    // Calendar navigation
    prevMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1)
      renderCalendar()
    })

    nextMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1)
      renderCalendar()
    })

    todayBtn.addEventListener("click", () => {
      currentDate = new Date()
      renderCalendar()
    })

    prevYearBtn.addEventListener("click", () => {
      currentDate.setFullYear(currentDate.getFullYear() - 1)
      renderCalendar()
    })

    nextYearBtn.addEventListener("click", () => {
      currentDate.setFullYear(currentDate.getFullYear() + 1)
      renderCalendar()
    })

    // Import button
    importBtn.addEventListener("click", () => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".json"

      input.addEventListener("change", (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result)

            // Validate the imported data
            if (!data.notes || !Array.isArray(data.notes)) {
              throw new Error("Invalid notes data format")
            }

            // Confirm before overwriting existing data
            if (notes.length > 0) {
              showConfirmModal(
                "Import Notes",
                "This will replace your existing notes. Do you want to continue?",
                () => {
                  processImport(data)
                },
              )
            } else {
              processImport(data)
            }
          } catch (error) {
            showToast("error", "Import Error", error.message)
          }
        }

        reader.readAsText(file)
      })

      input.click()
    })

    // Process import
    function processImport(data) {
      if (data.notes) {
        notes = data.notes
        saveNotes()
      }

      if (data.folders) {
        folders = data.folders
        saveFolders()
      }

      if (data.tags) {
        tags = data.tags
        saveTags()
      }

      if (data.calendarNotes) {
        calendarNotes = data.calendarNotes
        saveCalendarNotes()
      }

      renderFolders()
      renderTags()
      renderNotes()
      renderCalendar()

      showToast("success", "Import Successful", "Your notes have been imported")
    }

    // Export button
    exportBtn.addEventListener("click", () => {
      if (notes.length === 0) {
        showToast("error", "Export Error", "No notes to export")
        return
      }

      const data = {
        notes,
        folders,
        tags,
        calendarNotes,
        version: "2.0",
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `calendar-notes-export-${new Date().toISOString().slice(0, 10)}.json`
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      showToast("success", "Export Successful", "Your notes have been exported as a JSON file")
    })

    // Settings button
    settingsBtn.addEventListener("click", () => {
      settingsModal.classList.add("active")
    })

    // Theme toggle
    themeToggle.addEventListener("click", () => {
      isDarkTheme = !isDarkTheme

      if (isDarkTheme) {
        document.body.classList.add("dark-theme")
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      } else {
        document.body.classList.remove("dark-theme")
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
      }

      saveSettings()
    })

    // Sort options
    sortOptions.addEventListener("change", () => {
      currentSort = sortOptions.value
      renderNotes()
    })

    // List view button
    listViewBtn.addEventListener("click", () => {
      currentViewMode = "list"
      notesContainer.classList.remove("grid-view")
      notesContainer.classList.add("list-view")

      listViewBtn.classList.add("active")
      gridViewBtn.classList.remove("active")

      saveSettings()
    })

    // Grid view button
    gridViewBtn.addEventListener("click", () => {
      currentViewMode = "grid"
      notesContainer.classList.add("grid-view")
      notesContainer.classList.remove("list-view")

      gridViewBtn.classList.add("active")
      listViewBtn.classList.remove("active")

      saveSettings()
    })

    // Note title input
    noteTitle.addEventListener("input", () => {
      if (!currentNote) return

      // Clear previous timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }

      updateSaveStatus("Saving...")

      // Set new timer
      autoSaveTimer = setTimeout(() => {
        updateNote()
      }, autoSaveInterval)
    })

    // Favorite button
    favoriteBtn.addEventListener("click", toggleFavorite)

    // Calendar button
    calendarBtn.addEventListener("click", () => {
      if (!currentNote) {
        showToast("error", "Error", "No note selected to add to calendar")
        return
      }

      showCalendarNoteModal(new Date())
    })

    // Save button with enhanced error handling
    saveBtn.addEventListener("click", () => {
      if (!currentNote) {
        showToast("error", "Error", "No note to save")
        return
      }

      try {
        // Attempt to save the note
        const saveResult = updateNote()

        if (saveResult) {
          // Visual feedback for successful save
          saveBtn.classList.add("save-success")
          setTimeout(() => {
            saveBtn.classList.remove("save-success")
          }, 1000)

          showToast("success", "Note Saved", "Your note has been saved successfully")
        } else {
          // Visual feedback for failed save
          saveBtn.classList.add("save-error")
          setTimeout(() => {
            saveBtn.classList.remove("save-error")
          }, 1000)
        }
      } catch (error) {
        console.error("Error saving note:", error)

        // Visual feedback for error
        saveBtn.classList.add("save-error")
        setTimeout(() => {
          saveBtn.classList.remove("save-error")
        }, 1000)

        // Show detailed error information
        showErrorModal(
          "Save Error",
          "Failed to save your note",
          "Please try again or check your browser's storage settings.",
        )
      }
    })

    // History button
    historyBtn.addEventListener("click", () => {
      if (!currentNote) return

      historyList.innerHTML = ""

      if (!currentNote.history || currentNote.history.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No history available</div>'
      } else {
        currentNote.history.forEach((historyItem, index) => {
          const historyElement = document.createElement("div")
          historyElement.className = "history-item"

          const date = new Date(historyItem.timestamp)
          const formattedDate = date.toLocaleString()

          historyElement.innerHTML = `
                <div class="history-item-date">${formattedDate}</div>
                <div class="history-item-title">${historyItem.title}</div>
                <div class="history-item-preview">${stripHtml(historyItem.content).substring(0, 50)}</div>
                <div class="history-item-actions">
                    <button class="view-version-btn">View</button>
                    <button class="restore-version-btn">Restore</button>
                </div>
            `

          // View version button
          historyElement.querySelector(".view-version-btn").addEventListener("click", () => {
            // Create a temporary div to show the content
            const previewModal = document.createElement("div")
            previewModal.className = "modal active"
            previewModal.innerHTML = `
                    <div class="modal-content history-preview-content">
                        <h3>${historyItem.title} - ${formattedDate}</h3>
                        <div class="history-preview-body">${historyItem.content}</div>
                        <div class="modal-actions">
                            <button class="secondary-button close-preview-btn">Close</button>
                            <button class="primary-button restore-from-preview-btn">Restore This Version</button>
                        </div>
                    </div>
                `

            document.body.appendChild(previewModal)

            // Close preview button
            previewModal.querySelector(".close-preview-btn").addEventListener("click", () => {
              document.body.removeChild(previewModal)
            })

            // Restore from preview button
            previewModal.querySelector(".restore-from-preview-btn").addEventListener("click", () => {
              restoreVersion(index)
              document.body.removeChild(previewModal)
              historyModal.classList.remove("active")
            })

            // Close when clicking outside
            previewModal.addEventListener("click", (e) => {
              if (e.target === previewModal) {
                document.body.removeChild(previewModal)
              }
            })
          })

          // Restore version button
          historyElement.querySelector(".restore-version-btn").addEventListener("click", () => {
            showConfirmModal(
              "Restore Version",
              "Are you sure you want to restore this version? Your current changes will be saved to history.",
              () => {
                restoreVersion(index)
                historyModal.classList.remove("active")
              },
            )
          })

          historyList.appendChild(historyElement)
        })
      }

      historyModal.classList.add("active")
    })

    // Function for restoring versions
    function restoreVersion(historyIndex) {
      if (!currentNote || !currentNote.history || historyIndex >= currentNote.history.length) return

      // Save current state to history first
      saveToHistory()

      // Get the history item
      const historyItem = currentNote.history[historyIndex]

      // Restore from history
      currentNote.title = historyItem.title
      currentNote.content = historyItem.content
      currentNote.updatedAt = new Date().toISOString()

      // Remove the restored item from history
      currentNote.history.splice(historyIndex, 1)

      saveNotes()
      openNote(currentNote.id)
      showToast("success", "Version Restored", "Previous version has been restored")
    }

    // Delete note button
    deleteNoteBtn.addEventListener("click", () => {
      if (!currentNote) return

      showConfirmModal("Delete Note", `Are you sure you want to delete "${currentNote.title}"?`, () => {
        deleteNote(currentNote.id)
      })
    })

    // Quick note modal
    cancelQuickNoteBtn.addEventListener("click", () => {
      quickNoteModal.classList.remove("active")
    })

    saveQuickNoteBtn.addEventListener("click", () => {
      if (!selectedDateForQuickNote) {
        showToast("error", "Error", "No date selected")
        return
      }

      const title = quickNoteTitle.value.trim() || "Quick Note"
      const content = quickNoteQuill.root.innerHTML

      // Create new note and add to calendar
      const newNote = createNote(selectedDateForQuickNote, title, content)

      quickNoteModal.classList.remove("active")
    })

    // Calendar note modal
    cancelCalendarNoteBtn.addEventListener("click", () => {
      calendarNoteModal.classList.remove("active")
    })

    addCalendarNoteBtn.addEventListener("click", () => {
      const date = calendarDate.value
      const noteId = calendarNoteSelect.value

      if (!date) {
        showToast("error", "Error", "Please select a date")
        return
      }

      if (noteId) {
        // Add existing note to calendar
        addNoteToCalendar(Number.parseInt(noteId), new Date(date))
      } else {
        // Create new note and add to calendar
        const newNote = createNote(new Date(date))
      }

      calendarNoteModal.classList.remove("active")
    })

    // Settings modal
    closeSettingsBtn.addEventListener("click", () => {
      settingsModal.classList.remove("active")
    })

    fontSizeSelect.addEventListener("change", () => {
      if (fontSizeSelect.value === "small") {
        editorFontSize = "14px"
      } else if (fontSizeSelect.value === "medium") {
        editorFontSize = "16px"
      } else if (fontSizeSelect.value === "large") {
        editorFontSize = "18px"
      }

      applySettings()
      saveSettings()
    })

    fontFamilySelect.addEventListener("change", () => {
      editorFontFamily = fontFamilySelect.value
      applySettings()
      saveSettings()
    })

    lineSpacingSelect.addEventListener("change", () => {
      editorLineHeight = Number.parseFloat(lineSpacingSelect.value)
      applySettings()
      saveSettings()
    })

    autoSaveInput.addEventListener("change", () => {
      const value = Number.parseInt(autoSaveInput.value)
      if (value >= 1 && value <= 60) {
        autoSaveInterval = value * 1000
        saveSettings()
      }
    })

    apiUrlInput.addEventListener("change", () => {
      apiUrl = apiUrlInput.value.trim()
      saveSettings()
    })

    apiKeyInput.addEventListener("change", () => {
      apiKey = apiKeyInput.value.trim()
      saveSettings()
    })

    testApiBtn.addEventListener("click", () => {
      if (!apiUrl || !apiKey) {
        showToast("error", "API Configuration", "Please enter API URL and API Key")
        return
      }

      testApiConnection()
    })

    clearAllDataBtn.addEventListener("click", () => {
      showConfirmModal(
        "Clear All Data",
        "Are you sure you want to clear all data? This action cannot be undone.",
        () => {
          localStorage.clear()
          location.reload()
        },
      )
    })

    // History modal
    closeHistoryBtn.addEventListener("click", () => {
      historyModal.classList.remove("active")
    })

    // Confirm modal
    cancelConfirmBtn.addEventListener("click", () => {
      confirmModal.classList.remove("active")
      confirmCallback = null
    })

    confirmActionBtn.addEventListener("click", () => {
      if (confirmCallback) {
        confirmCallback()
      }

      confirmModal.classList.remove("active")
      confirmCallback = null
    })

    // Close modals when clicking outside
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.classList.remove("active")

        if (e.target === confirmModal) {
          confirmCallback = null
        }
      }
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (currentNote) {
          updateNote()
          showToast("success", "Note Saved", "Note has been saved successfully")
        }
      }

      // Ctrl/Cmd + N to create new note
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        createNote()
      }

      // Escape to close modals
      if (e.key === "Escape") {
        const activeModal = document.querySelector(".modal.active")
        if (activeModal) {
          activeModal.classList.remove("active")
          if (activeModal === confirmModal) {
            confirmCallback = null
          }
        }
      }
    })

    // Fix the folder modal event listeners
    // Folder modal
    cancelFolderBtn.addEventListener("click", (e) => {
      e.preventDefault() // Prevent default button behavior
      e.stopPropagation() // Stop event propagation
      folderModal.classList.remove("active")
    })

    createFolderBtn.addEventListener("click", (e) => {
      e.preventDefault() // Prevent default button behavior
      e.stopPropagation() // Stop event propagation

      const folderName = folderNameInput.value.trim()

      if (folderName) {
        try {
          // Create the folder
          createFolder(folderName)

          // Clear the input and close the modal
          folderNameInput.value = ""
          folderModal.classList.remove("active")

          // Show success message
          showToast("success", "Folder Created", `Folder "${folderName}" has been created successfully`)
        } catch (error) {
          // Show error message if folder creation fails
          showToast("error", "Folder Creation Failed", error.message || "An error occurred while creating the folder")
          console.error("Folder creation error:", error)
        }
      } else {
        showToast("error", "Error", "Please enter a folder name")
      }
    })

    folderNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault() // Prevent form submission
        createFolderBtn.click() // Trigger the create button click
      }
    })

    // Add an event listener for the folder form submission
    // Folder form submission
    document.getElementById("folder-form").addEventListener("submit", (e) => {
      e.preventDefault()
      createFolderBtn.click()
    })

    // Also, add a click event listener to prevent modal closing when clicking inside the modal content
    // Prevent modal closing when clicking inside modal content
    document.querySelectorAll(".modal-content").forEach((content) => {
      content.addEventListener("click", (e) => {
        e.stopPropagation()
      })
    })
  }

  // Initialize the app
  init()
})
