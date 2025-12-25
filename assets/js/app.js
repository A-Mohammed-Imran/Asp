// Centralized JavaScript for Asprasys Dash
// Initializes page-specific logic based on available DOM elements.

function toggleSidebar() {
  const el = document.getElementById("sidebar");
  if (el) el.classList.toggle("active");
}

// Handle window resize for responsive behavior
function handleResponsive() {
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth > 1024) {
    if (sidebar) sidebar.classList.remove("active");
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  }
}

window.addEventListener("resize", handleResponsive);

// Add menu toggle button to navbar on mobile
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const sidebar = document.getElementById("sidebar");
  const appContainer = document.querySelector(".app-container");
  
  if (navbar && sidebar && !document.querySelector(".menu-toggle")) {
    const menuBtn = document.createElement("button");
    menuBtn.className = "menu-toggle";
    menuBtn.innerHTML = "☰";
    menuBtn.setAttribute("aria-label", "Toggle menu");
    menuBtn.addEventListener("click", toggleSidebar);
    navbar.insertBefore(menuBtn, navbar.firstChild);
  }
  
  // Add backdrop overlay for mobile
  if (sidebar && !document.querySelector(".sidebar-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    if (appContainer) {
      appContainer.appendChild(backdrop);
    }
    
    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("active");
      backdrop.classList.remove("active");
    });
  }
  
  // Close sidebar when clicking on a nav link
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (sidebar && window.innerWidth <= 1024) {
        sidebar.classList.remove("active");
        const backdrop = document.querySelector(".sidebar-backdrop");
        if (backdrop) backdrop.classList.remove("active");
      }
    });
  });
  
  // Toggle backdrop when sidebar is toggled
  const observer = new MutationObserver(() => {
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (sidebar && backdrop) {
      if (sidebar.classList.contains("active")) {
        backdrop.classList.add("active");
      } else {
        backdrop.classList.remove("active");
      }
    }
  });
  
  if (sidebar) {
    observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });
  }
});

function initLoginPage() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return; // Not on login page

  // If already logged in, skip login
  if (sessionStorage.getItem("isLoggedIn") === "true" || localStorage.getItem("isLoggedInPersistent") === "true") {
    window.location.href = "pages/auth/dashboard.html";
    return;
  }

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberCheckbox = document.getElementById("remember");
  const submitBtn = document.getElementById("submit-btn");
  const errorMessage = document.getElementById("error-message");
  const togglePwdBtn = document.getElementById("toggle-password");
  const capsWarning = document.getElementById("caps-warning");

  const MOCK_CREDENTIALS = { email: "imran@2006", password: "imran123" };

  const savedEmail = localStorage.getItem("remembered_email");
  if (savedEmail && emailInput && rememberCheckbox) {
    emailInput.value = savedEmail;
    rememberCheckbox.checked = true;
  }

  // Toggle password visibility
  if (togglePwdBtn && passwordInput) {
    togglePwdBtn.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      togglePwdBtn.textContent = isHidden ? "Hide" : "Show";
    });
  }

  // Caps Lock warning
  if (passwordInput && capsWarning) {
    passwordInput.addEventListener("keyup", (e) => {
      const on =
        typeof e.getModifierState === "function" &&
        e.getModifierState("CapsLock");
      capsWarning.style.display = on ? "block" : "none";
    });
  }

  function setInputError(el, hasError) {
    if (!el) return;
    el.classList.toggle("input-error", !!hasError);
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (errorMessage) errorMessage.style.display = "none";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Authenticating...";
    }

    const email = (emailInput?.value || "").trim();
    const password = passwordInput?.value || "";

    // Basic validation: require '@' in email and min length for password
    const emailValid = email.includes("@") && email.length >= 3;
    const passValid = password.length >= 6;
    setInputError(emailInput, !emailValid);
    setInputError(passwordInput, !passValid);
    if (!emailValid || !passValid) {
      if (errorMessage) {
        errorMessage.textContent = "Please enter a valid email and password.";
        errorMessage.style.display = "block";
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Sign In";
      }
      return;
    }

    setTimeout(() => {
      if (
        email === MOCK_CREDENTIALS.email &&
        password === MOCK_CREDENTIALS.password
      ) {
        if (rememberCheckbox?.checked) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        // Set both session and persistent login flags
        sessionStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isLoggedInPersistent", "true");
        localStorage.setItem("loggedInUser", email);
        window.location.href = "pages/auth/dashboard.html";
      } else {
        if (errorMessage) errorMessage.style.display = "block";
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Sign In";
        }
        if (passwordInput) passwordInput.value = "";
      }
    }, 800);
  });
}

function initDashboardPage() {
  // Detect dashboard via sidebar + known links
  const isDashboard =
    document.querySelector(".sidebar .nav-link.active")?.textContent?.trim() ===
      "Dashboard" || location.pathname.endsWith("dashboard.html");
  if (!isDashboard) return;

  const dashboardStats = [
    { label: "Total Courses", value: "12", color: "var(--primary)" },
    { label: "Completed Projects", value: "08", color: "var(--success)" },
    { label: "Upcoming Interviews", value: "03", color: "var(--accent)" },
    { label: "Daily Goals", value: "85%", color: "var(--warning)" },
  ];

  const recentActivities = [
    { icon: "📁", action: 'Project "CloudSync" updated', time: "2 hours ago" },
    {
      icon: "🎓",
      action: "Completed Advanced CSS Module",
      time: "5 hours ago",
    },
    {
      icon: "📅",
      action: "Interview scheduled with TechFlow",
      time: "Yesterday",
    },
    {
      icon: "🏆",
      action: 'Earned "Early Bird" achievement',
      time: "2 days ago",
    },
  ];

  function renderStats() {
    const container = document.getElementById("stats-container");
    if (!container) return; // container not present in current markup
    container.innerHTML = dashboardStats
      .map(
        (stat) => `
			<div class="card">
				<span class="stat-label">${stat.label}</span>
				<span class="stat-value" style="color: ${stat.color}">${stat.value}</span>
				<div style="height: 4px; width: 100%; background: rgba(255,255,255,0.05); border-radius: 2px;">
					<div style="height: 100%; width: ${
            stat.value.includes("%") ? stat.value : "70%"
          }; background: ${stat.color}; border-radius: 2px;"></div>
				</div>
			</div>
		`
      )
      .join("");
  }

  function renderActivity() {
    const container = document.getElementById("activity-container");
    if (!container) return;
    container.innerHTML = recentActivities
      .map(
        (item) => `
			<div class="activity-item">
				<div class="activity-icon">${item.icon}</div>
				<div class="activity-info">
					<p>${item.action}</p>
					<span class="activity-time">${item.time}</span>
				</div>
			</div>
		`
      )
      .join("");
  }

  function initNavigation() {
    const links = document.querySelectorAll(".nav-link");
    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        if (this.innerText.trim().toLowerCase() === "logout") return;
        links.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
        const pageTitle = document.getElementById("page-title");
        if (pageTitle) pageTitle.innerText = this.innerText;
        if (window.innerWidth <= 1024) toggleSidebar();
      });
    });
  }

  renderStats();
  renderActivity();
  initNavigation();
}

function initDailyGoalsPage() {
  const goalsContainer = document.getElementById("goals-list");
  const goalForm = document.getElementById("new-goal-form");
  const progressCircle = document.getElementById("progress-circle");
  const progressPercent = document.getElementById("progress-percent");
  const summaryText = document.getElementById("summary-text");
  if (
    !goalsContainer ||
    !goalForm ||
    !progressCircle ||
    !progressPercent ||
    !summaryText
  )
    return; // Not on goals page

  let goals = JSON.parse(localStorage.getItem("asprasys_goals")) || [
    {
      id: 1,
      title: "Morning Stand-up",
      desc: "Sync with the engineering team",
      completed: true,
    },
    {
      id: 2,
      title: "Code Review",
      desc: "Review PRs for the authentication module",
      completed: false,
    },
  ];

  function updateProgressUI() {
    const total = goals.length;
    const completed = goals.filter((g) => g.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const offset = 219.9 - (percent / 100) * 219.9;
    progressCircle.style.strokeDashoffset = String(offset);
    progressPercent.innerText = `${percent}%`;
    const remaining = total - completed;
    summaryText.innerText =
      remaining === 0
        ? "Excellent! All goals for today are completed."
        : `You have ${remaining} goal${
            remaining > 1 ? "s" : ""
          } remaining for today.`;
  }

  function renderGoals() {
    goalsContainer.innerHTML = "";
    if (goals.length === 0) {
      goalsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No goals added yet. Start by adding one below!</p>`;
    }
    goals.forEach((goal) => {
      const goalEl = document.createElement("div");
      goalEl.className = `goal-item ${goal.completed ? "is-completed" : ""}`;
      goalEl.innerHTML = `
				<input type="checkbox" class="goal-checkbox" ${
          goal.completed ? "checked" : ""
        } onchange="toggleGoal(${goal.id})">
				<div class="goal-content">
					<span class="goal-title">${goal.title}</span>
					<span class="goal-desc">${goal.desc || "No description provided"}</span>
				</div>
				<span class="goal-status-badge ${
          goal.completed ? "badge-completed" : "badge-pending"
        }">
					${goal.completed ? "COMPLETED" : "PENDING"}
				</span>
				<button class="delete-goal" onclick="deleteGoal(${goal.id})">🗑</button>
			`;
      goalsContainer.appendChild(goalEl);
    });
    updateProgressUI();
    localStorage.setItem("asprasys_goals", JSON.stringify(goals));
  }

  window.toggleGoal = (id) => {
    goals = goals.map((g) =>
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    renderGoals();
  };

  window.deleteGoal = (id) => {
    goals = goals.filter((g) => g.id !== id);
    renderGoals();
  };

  goalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const titleInput = document.getElementById("goal-input-title");
    const descInput = document.getElementById("goal-input-desc");
    if (!titleInput) return;
    const newGoal = {
      id: Date.now(),
      title: titleInput.value,
      desc: descInput?.value || "",
      completed: false,
    };
    goals.push(newGoal);
    titleInput.value = "";
    if (descInput) descInput.value = "";
    renderGoals();
  });

  renderGoals();
}

function initLogoutPage() {
  const confirmBtn = document.getElementById("confirmLogout");
  const cancelBtn = document.getElementById("cancelLogout");
  if (!confirmBtn && !cancelBtn) return; // Not on logout page

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      confirmBtn.innerText = "Logging out...";
      confirmBtn.style.opacity = "0.7";
      confirmBtn.disabled = true;
      setTimeout(() => {
        // Clear session and persistent login data
        try {
          sessionStorage.removeItem("isLoggedIn");
          localStorage.removeItem("isLoggedInPersistent");
          localStorage.removeItem("loggedInUser");
        } catch (e) {}
        window.location.href = "/index.html";
      }, 1200);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const sidebar = document.getElementById("sidebar");
      if (sidebar) sidebar.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Enforce auth on protected pages
  (function enforceAuth() {
    const path = location.pathname || "";
    const isAuthPage = path.includes("/pages/auth/");
    const isLogout = path.endsWith("logout.html");
    if (isAuthPage && !isLogout) {
      // Check both session and persistent login
      const isLoggedIn = 
        sessionStorage.getItem("isLoggedIn") === "true" || 
        localStorage.getItem("isLoggedInPersistent") === "true";
      
      if (!isLoggedIn) {
        window.location.href = "/index.html";
        return;
      }
      
      // Restore session if persistent login exists
      if (sessionStorage.getItem("isLoggedIn") !== "true") {
        sessionStorage.setItem("isLoggedIn", "true");
      }
    }
  })();

  initLoginPage();
  initDashboardPage();
  initDailyGoalsPage();
  initLogoutPage();
});
