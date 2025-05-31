// jQuery is already loaded via script tag in HTML
const $ = window.jQuery

$(document).ready(() => {
  // Terminal state
  const terminal = {
    currentDirectory: "~",
    fileSystem: {
      "~": {
        type: "directory",
        contents: {
          documents: { type: "directory", contents: {} },
          downloads: { type: "directory", contents: {} },
          secret: {
            type: "directory",
            contents: {
              "passwords.txt": { type: "file", content: "This file is encrypted. Use decrypt tool to view contents." },
              "targets.db": { type: "file", content: "DATABASE: Contains information about potential targets." },
            },
          },
          "readme.txt": {
            type: "file",
            content: "Welcome to HackOS. This system is designed for educational purposes only.",
          },
        },
      },
    },
    commandHistory: [],
    historyIndex: -1,
    challenges: {
      logicBomb: {
        active: false,
        timeLeft: 60,
        timer: null,
        riddle: "I'm light as a feather, but the strongest person can't hold me for more than a minute. What am I?",
        answer: "breath",
      },
      sqlInjection: {
        active: false,
        attempts: 0,
        maxAttempts: 3,
      },
      bruteForce: {
        active: false,
        targetPassword: "A1B2C3",
        attempts: 0,
        maxAttempts: 10,
        characters: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"],
      },
    },
    accessLevel: 0,
  }

  // Login screen functionality
  $("#login-button").on("click", () => {
    const username = $("#login-username").val()
    const password = $("#login-password").val()

    if (username === "admin" && password === "password123") {
      $("#login-message").html('<span class="success">Access granted. Welcome, Administrator.</span>')
      setTimeout(() => {
        $("#login-screen").fadeOut(500, () => {
          $(".terminal").fadeIn(500)
          $("#terminal-input").focus()
        })
      }, 1000)
    } else {
      $("#login-message").html('<span class="error">Access denied. Invalid credentials.</span>')
    }
  })

  // Hack button functionality
  $("#hack-button").on("click", function () {
    $(this).prop("disabled", true)
    $("#login-button").prop("disabled", true)

    $("#login-message").html('<span class="glitch">INITIATING SYSTEM OVERRIDE...</span>')

    // Add progress bar
    $("#login-message").append(
      '<div class="hack-progress"><div class="hack-progress-fill" id="hack-progress-fill"></div></div>',
    )

    let progress = 0
    const hackInterval = setInterval(() => {
      progress += Math.random() * 15
      if (progress > 100) progress = 100

      $("#hack-progress-fill").css("width", progress + "%")

      if (progress >= 100) {
        clearInterval(hackInterval)
        $("#login-message").html('<span class="success">SYSTEM COMPROMISED. ACCESS GRANTED.</span>')

        setTimeout(() => {
          $("#login-screen").fadeOut(500, () => {
            $(".terminal").fadeIn(500)
            $("#terminal-input").focus()
          })
        }, 1000)
      }
    }, 200)
  })

  // Empty sound function (audio removed)
  function playSound(sound) {
    // Audio functionality removed
  }

  // Focus input when clicking anywhere in the terminal
  $(".terminal").on("click", () => {
    $("#terminal-input").focus()
  })

  // Handle input
  $("#terminal-input").on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault()
      const command = $(this).val().trim()
      if (command) {
        processCommand(command)
        terminal.commandHistory.push(command)
        terminal.historyIndex = terminal.commandHistory.length
        $(this).val("")
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (terminal.historyIndex > 0) {
        terminal.historyIndex--
        $(this).val(terminal.commandHistory[terminal.historyIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (terminal.historyIndex < terminal.commandHistory.length - 1) {
        terminal.historyIndex++
        $(this).val(terminal.commandHistory[terminal.historyIndex])
      } else {
        terminal.historyIndex = terminal.commandHistory.length
        $(this).val("")
      }
    } else {
      playSound("keypress")
    }
  })

  // Process commands
  function processCommand(command) {
    const args = command.split(" ")
    const cmd = args[0].toLowerCase()

    // Add command to terminal output
    appendToTerminal(`<span class="prompt">hacker@terminal:${terminal.currentDirectory}$</span> ${command}`)

    // Check if we're in an active challenge
    if (terminal.challenges.logicBomb.active) {
      handleLogicBombInput(command)
      return
    }

    if (terminal.challenges.sqlInjection.active) {
      handleSqlInjectionInput(command)
      return
    }

    // Process regular commands
    switch (cmd) {
      case "help":
        showHelp()
        break
      case "clear":
        clearTerminal()
        break
      case "whoami":
        appendToTerminal("Current user: hacker (Access Level: " + terminal.accessLevel + ")")
        break
      case "ls":
        listDirectory(args[1] || terminal.currentDirectory)
        break
      case "cd":
        changeDirectory(args[1] || "~")
        break
      case "cat":
        if (args[1]) {
          catFile(args[1])
        } else {
          appendToTerminal('<span class="error">Usage: cat [filename]</span>')
        }
        break
      case "access":
        if (args[1]) {
          accessSystem(args[1])
        } else {
          appendToTerminal('<span class="error">Usage: access [system-name]</span>')
        }
        break
      case "challenge":
        if (args[1]) {
          startChallenge(args[1])
        } else {
          appendToTerminal('<span class="error">Usage: challenge [challenge-name]</span>')
          appendToTerminal("Available challenges: logic-bomb, sql-injection, brute-force")
        }
        break
      case "hack":
        if (args[1]) {
          hackSystem(args[1])
        } else {
          appendToTerminal('<span class="error">Usage: hack [target]</span>')
        }
        break
      case "scan":
        scanNetwork()
        break
      default:
        appendToTerminal(`<span class="error">Command not found: ${cmd}</span>`)
        appendToTerminal('Type <span class="command">help</span> to see available commands.')
    }
  }

  // Command functions
  function showHelp() {
    appendToTerminal(`
      <div class="help-menu">
        <p>Available commands:</p>
        <p><span class="command">help</span> - Show this help menu</p>
        <p><span class="command">clear</span> - Clear the terminal</p>
        <p><span class="command">whoami</span> - Display current user info</p>
        <p><span class="command">ls [directory]</span> - List directory contents</p>
        <p><span class="command">cd [directory]</span> - Change directory</p>
        <p><span class="command">cat [file]</span> - Display file contents</p>
        <p><span class="command">access [system]</span> - Attempt to access a system</p>
        <p><span class="command">scan</span> - Scan network for vulnerable systems</p>
        <p><span class="command">challenge [name]</span> - Start a hacking challenge</p>
        <p><span class="command">hack [target]</span> - Attempt to hack a target</p>
      </div>
    `)
  }

  function clearTerminal() {
    $("#terminal-content").html("")
  }

  function listDirectory(dir) {
    const path = resolvePath(dir)
    const directory = getDirectoryAtPath(path)

    if (!directory || directory.type !== "directory") {
      appendToTerminal(`<span class="error">ls: cannot access '${dir}': No such directory</span>`)
      return
    }

    let output = ""
    for (const item in directory.contents) {
      const isDir = directory.contents[item].type === "directory"
      output += `<div>${isDir ? '<span class="command">' + item + "/</span>" : item}</div>`
    }

    if (output === "") {
      output = "<em>Directory is empty</em>"
    }

    appendToTerminal(output)
  }

  function changeDirectory(dir) {
    const path = resolvePath(dir)
    const directory = getDirectoryAtPath(path)

    if (!directory || directory.type !== "directory") {
      appendToTerminal(`<span class="error">cd: cannot access '${dir}': No such directory</span>`)
      return
    }

    terminal.currentDirectory = path
    updatePrompt()
  }

  function catFile(filename) {
    const path = resolvePath(filename)
    const file = getFileAtPath(path)

    if (!file) {
      appendToTerminal(`<span class="error">cat: cannot access '${filename}': No such file</span>`)
      return
    }

    if (file.type !== "file") {
      appendToTerminal(`<span class="error">cat: '${filename}': Is a directory</span>`)
      return
    }

    appendToTerminal(`<div class="file-content">${file.content}</div>`)
  }

  function accessSystem(system) {
    appendToTerminal(`Attempting to access ${system}...`)

    const accessAnimation = setInterval(() => {
      appendToTerminal(".", false)
    }, 300)

    setTimeout(() => {
      clearInterval(accessAnimation)

      if (system.toLowerCase() === "mainframe" && terminal.accessLevel >= 2) {
        playSound("accessGranted")
        appendToTerminal('<br><span class="success">ACCESS GRANTED</span>')
        appendToTerminal("Welcome to the mainframe. You now have full system access.")
      } else if (system.toLowerCase() === "admin" && terminal.accessLevel >= 1) {
        playSound("accessGranted")
        appendToTerminal('<br><span class="success">ACCESS GRANTED</span>')
        appendToTerminal("Admin panel accessed. You can now modify system settings.")
      } else {
        playSound("accessDenied")
        appendToTerminal('<br><span class="error">ACCESS DENIED</span>')
        appendToTerminal("Your access level is insufficient or the system does not exist.")
        appendToTerminal("Try completing challenges to increase your access level.")
      }
    }, 2000)
  }

  function scanNetwork() {
    appendToTerminal("Initiating network scan...")

    let progress = 0
    appendToTerminal(`<div class="progress-bar"><div class="progress-bar-fill" id="scan-progress"></div></div>`)

    const scanInterval = setInterval(() => {
      progress += 5
      $("#scan-progress").css("width", progress + "%")

      if (progress >= 100) {
        clearInterval(scanInterval)
        appendToTerminal("Scan complete. Systems found:")
        appendToTerminal(`
          <div class="scan-results">
            <p>192.168.1.1 - Router [Status: <span class="warning">PROTECTED</span>]</p>
            <p>192.168.1.10 - Admin Server [Status: <span class="warning">FIREWALL ACTIVE</span>]</p>
            <p>192.168.1.25 - Database [Status: <span class="success">VULNERABLE</span>]</p>
            <p>192.168.1.50 - Mainframe [Status: <span class="error">SECURE</span>]</p>
          </div>
        `)
        appendToTerminal('Use <span class="command">hack [ip]</span> to attempt exploitation.')
      }
    }, 200)
  }

  function hackSystem(target) {
    if (target === "192.168.1.25") {
      appendToTerminal(`Attempting to hack ${target}...`)
      appendToTerminal("Vulnerability found: SQL Injection")
      appendToTerminal("Starting SQL Injection challenge...")
      startChallenge("sql-injection")
    } else {
      appendToTerminal(
        `<span class="error">Cannot hack ${target}: No known vulnerabilities or system not found.</span>`,
      )
      appendToTerminal('Try using <span class="command">scan</span> to find vulnerable systems.')
    }
  }

  // Challenge functions
  function startChallenge(challenge) {
    switch (challenge.toLowerCase()) {
      case "logic-bomb":
        startLogicBombChallenge()
        break
      case "sql-injection":
        startSqlInjectionChallenge()
        break
      case "brute-force":
        startBruteForceChallenge()
        break
      default:
        appendToTerminal(`<span class="error">Challenge not found: ${challenge}</span>`)
        appendToTerminal("Available challenges: logic-bomb, sql-injection, brute-force")
    }
  }

  function startLogicBombChallenge() {
    terminal.challenges.logicBomb.active = true
    terminal.challenges.logicBomb.timeLeft = 60

    appendToTerminal(`
      <div class="logic-bomb">
        <h3>LOGIC BOMB ACTIVATED</h3>
        <p>Solve the riddle to defuse the bomb:</p>
        <p>"${terminal.challenges.logicBomb.riddle}"</p>
        <div class="timer" id="bomb-timer">60</div>
      </div>
    `)

    playSound("alert")

    terminal.challenges.logicBomb.timer = setInterval(() => {
      terminal.challenges.logicBomb.timeLeft--
      $("#bomb-timer").text(terminal.challenges.logicBomb.timeLeft)

      if (terminal.challenges.logicBomb.timeLeft <= 0) {
        clearInterval(terminal.challenges.logicBomb.timer)
        terminal.challenges.logicBomb.active = false
        appendToTerminal('<span class="error">BOOM! The logic bomb has detonated. Challenge failed.</span>')
        playSound("accessDenied")
      }
    }, 1000)

    appendToTerminal("Type your answer to defuse the bomb:")
  }

  function handleLogicBombInput(input) {
    if (input.toLowerCase() === terminal.challenges.logicBomb.answer) {
      clearInterval(terminal.challenges.logicBomb.timer)
      terminal.challenges.logicBomb.active = false
      appendToTerminal('<span class="success">BOMB DEFUSED! Challenge completed successfully.</span>')
      increaseAccessLevel()
      playSound("accessGranted")
    } else {
      appendToTerminal('<span class="error">Incorrect answer. Try again!</span>')
      playSound("accessDenied")
    }
  }

  function startSqlInjectionChallenge() {
    terminal.challenges.sqlInjection.active = true
    terminal.challenges.sqlInjection.attempts = 0

    appendToTerminal(`
      <div class="sql-injection">
        <h3>SQL INJECTION CHALLENGE</h3>
        <p>Bypass the login system using SQL injection.</p>
        <p>Target: Admin Dashboard</p>
        <p>Hint: The query is: "SELECT * FROM users WHERE username='[input1]' AND password='[input2]'"</p>
        <div class="login-form">
          <input type="text" id="sql-username" placeholder="Username">
          <input type="password" id="sql-password" placeholder="Password">
          <button id="sql-login">Login</button>
        </div>
      </div>
    `)

    $("#sql-login").on("click", () => {
      const username = $("#sql-username").val()
      const password = $("#sql-password").val()

      handleSqlInjection(username, password)
    })
  }

  function handleSqlInjection(username, password) {
    terminal.challenges.sqlInjection.attempts++

    appendToTerminal(`Attempting login with: ${username} / ${password.replace(/./g, "*")}`)

    if (username.includes("'") && (username.includes("--") || username.includes("#"))) {
      appendToTerminal('<span class="success">SQL INJECTION SUCCESSFUL! You have bypassed the login.</span>')
      appendToTerminal(
        "Query executed: SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'",
      )
      appendToTerminal("Result: Access granted to admin dashboard")
      terminal.challenges.sqlInjection.active = false
      increaseAccessLevel()
      playSound("accessGranted")
    } else if (username === "admin" && password === "password123") {
      appendToTerminal('<span class="warning">Login successful, but you used the actual credentials.</span>')
      appendToTerminal("The challenge was to use SQL injection, not guess the password!")
      terminal.challenges.sqlInjection.active = false
    } else {
      if (terminal.challenges.sqlInjection.attempts >= terminal.challenges.sqlInjection.maxAttempts) {
        appendToTerminal('<span class="error">Too many failed attempts. Security system locked.</span>')
        appendToTerminal('Challenge failed. Type <span class="command">challenge sql-injection</span> to try again.')
        terminal.challenges.sqlInjection.active = false
        playSound("accessDenied")
      } else {
        appendToTerminal('<span class="error">Login failed. Try using SQL injection techniques.</span>')
        appendToTerminal(
          `Attempts remaining: ${terminal.challenges.sqlInjection.maxAttempts - terminal.challenges.sqlInjection.attempts}`,
        )
        playSound("accessDenied")
      }
    }
  }

  function handleSqlInjectionInput(input) {
    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      terminal.challenges.sqlInjection.active = false
      appendToTerminal("SQL Injection challenge aborted.")
      return
    }

    appendToTerminal('<span class="error">Use the login form to attempt SQL injection.</span>')
  }

  function startBruteForceChallenge() {
    terminal.challenges.bruteForce.active = true
    terminal.challenges.bruteForce.attempts = 0

    appendToTerminal(`
      <div class="brute-force">
        <h3>PASSWORD BRUTE FORCE CHALLENGE</h3>
        <p>Crack the 6-character password using the brute force method.</p>
        <p>Password format: Hexadecimal characters (0-9, A-F)</p>
        <p>Attempts remaining: ${terminal.challenges.bruteForce.maxAttempts}</p>
        <div class="password-grid" id="password-grid"></div>
        <button id="brute-force-submit">Submit Guess</button>
      </div>
    `)

    // Generate password grid
    const grid = $("#password-grid")
    const selectedCells = []

    for (let i = 0; i < 6; i++) {
      const row = $('<div class="password-row"></div>')
      for (let j = 0; j < terminal.challenges.bruteForce.characters.length; j++) {
        const char = terminal.challenges.bruteForce.characters[j]
        const cell = $(`<div class="password-cell" data-char="${char}" data-position="${i}">${char}</div>`)

        cell.on("click", function () {
          const position = $(this).data("position")
          const char = $(this).data("char")

          // Deselect all cells in this position
          $(`.password-cell[data-position="${position}"]`).removeClass("selected")

          // Select this cell
          $(this).addClass("selected")

          // Update selected cells array
          selectedCells[position] = char
        })

        row.append(cell)
      }
      grid.append(row)
    }

    $("#brute-force-submit").on("click", () => {
      const guess = selectedCells.join("")

      if (guess.length !== 6) {
        appendToTerminal('<span class="error">You must select one character for each position.</span>')
        return
      }

      terminal.challenges.bruteForce.attempts++

      appendToTerminal(`Attempting password: ${guess}`)

      if (guess === terminal.challenges.bruteForce.targetPassword) {
        appendToTerminal('<span class="success">PASSWORD CRACKED! Challenge completed successfully.</span>')
        terminal.challenges.bruteForce.active = false
        increaseAccessLevel()
        playSound("accessGranted")
      } else {
        // Give feedback on correct positions
        let feedback = ""
        for (let i = 0; i < 6; i++) {
          if (guess[i] === terminal.challenges.bruteForce.targetPassword[i]) {
            feedback += `<span class="success">${guess[i]}</span>`
          } else {
            feedback += `<span class="error">${guess[i]}</span>`
          }
        }

        appendToTerminal(`Incorrect password. Feedback: ${feedback}`)
        appendToTerminal(
          `Attempts remaining: ${terminal.challenges.bruteForce.maxAttempts - terminal.challenges.bruteForce.attempts}`,
        )

        if (terminal.challenges.bruteForce.attempts >= terminal.challenges.bruteForce.maxAttempts) {
          appendToTerminal('<span class="error">Too many failed attempts. Security system locked.</span>')
          appendToTerminal('Challenge failed. Type <span class="command">challenge brute-force</span> to try again.')
          terminal.challenges.bruteForce.active = false
          playSound("accessDenied")
        } else {
          playSound("accessDenied")
        }
      }
    })
  }

  // Helper functions
  function appendToTerminal(text, newLine = true) {
    const content = $("#terminal-content")

    if (newLine) {
      content.append(`<div>${text}</div>`)
    } else {
      const lastLine = content.children().last()
      lastLine.html(lastLine.html() + text)
    }

    // Scroll to bottom
    content.scrollTop(content[0].scrollHeight)
  }

  function updatePrompt() {
    $(".prompt").text(`hacker@terminal:${terminal.currentDirectory}$`)
  }

  function resolvePath(path) {
    if (!path) return terminal.currentDirectory

    // Absolute path
    if (path.startsWith("/")) {
      return path
    }

    // Home directory
    if (path === "~") {
      return "~"
    }

    // Parent directory
    if (path === "..") {
      const parts = terminal.currentDirectory.split("/")
      parts.pop()
      return parts.join("/") || "~"
    }

    // Current directory
    if (path === ".") {
      return terminal.currentDirectory
    }

    // Relative path
    if (terminal.currentDirectory === "~") {
      return `~/${path}`
    } else {
      return `${terminal.currentDirectory}/${path}`
    }
  }

  function getDirectoryAtPath(path) {
    if (path === "~") {
      return terminal.fileSystem["~"]
    }

    const parts = path.replace("~/", "").split("/").filter(Boolean)
    let current = terminal.fileSystem["~"]

    for (const part of parts) {
      if (!current.contents[part] || current.contents[part].type !== "directory") {
        return null
      }
      current = current.contents[part]
    }

    return current
  }

  function getFileAtPath(path) {
    const parts = path.replace("~/", "").split("/").filter(Boolean)
    const filename = parts.pop()
    let directory = terminal.fileSystem["~"]

    for (const part of parts) {
      if (!directory.contents[part] || directory.contents[part].type !== "directory") {
        return null
      }
      directory = directory.contents[part]
    }

    return directory.contents[filename]
  }

  function increaseAccessLevel() {
    terminal.accessLevel++
    appendToTerminal(`<span class="success">Access level increased to ${terminal.accessLevel}!</span>`)

    if (terminal.accessLevel === 1) {
      appendToTerminal('You now have access to the admin panel. Try <span class="command">access admin</span>')
    } else if (terminal.accessLevel >= 2) {
      appendToTerminal('You now have access to the mainframe. Try <span class="command">access mainframe</span>')
    }
  }

  // Simulate typing animation for initial boot sequence
  function typeWriterEffect() {
    $(".boot-sequence p").each(function (index) {
      const element = $(this)
      element.hide()

      setTimeout(() => {
        element.fadeIn(300)
      }, index * 500)
    })
  }

  // Initialize
  typeWriterEffect()
})
