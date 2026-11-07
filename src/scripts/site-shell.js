(() => {
        const initializeSiteShell = () => {
        window.__siteShellController?.abort();
        const siteShellController = new AbortController();
        window.__siteShellController = siteShellController;

        window.__siteRevealObserver?.disconnect();

        const currentPath = window.location.pathname;
        document.querySelectorAll(".site-nav a").forEach((link) => {
          const linkPath = new URL(link.href, window.location.origin).pathname;
          const isCurrent = linkPath === "/"
            ? currentPath === "/"
            : linkPath === "/about/"
              ? currentPath.startsWith("/about/") || currentPath.startsWith("/resume/")
              : linkPath === "/radar/"
                ? currentPath.startsWith("/radar/") || currentPath.startsWith("/github-stars/")
              : currentPath.startsWith(linkPath);

          if (isCurrent) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });

        const nav = document.querySelector("[data-site-nav]");
        const navToggle = document.querySelector("[data-site-nav-toggle]");
        const navLinks = document.querySelector("[data-site-nav-links]");
        const mobileNavigation = window.matchMedia("(max-width: 767px)");

        const setNavigationOpen = (open) => {
          if (!(nav instanceof HTMLElement) || !(navToggle instanceof HTMLButtonElement) || !(navLinks instanceof HTMLElement)) {
            return;
          }

          nav.toggleAttribute("data-open", open);
          navToggle.setAttribute("aria-expanded", String(open));
          navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
          document.body.classList.toggle("site-navigation-open", open);
          navLinks.inert = mobileNavigation.matches && !open;
          for (const element of document.querySelectorAll("main, .site-page > footer")) {
            element.inert = open;
          }
        };

        const syncNavigationMode = () => {
          if (!mobileNavigation.matches) {
            setNavigationOpen(false);
            if (navLinks instanceof HTMLElement) navLinks.inert = false;
            return;
          }

          setNavigationOpen(false);
        };

        if (navToggle instanceof HTMLButtonElement && nav instanceof HTMLElement) {
          nav.setAttribute("data-nav-ready", "");
          nav.addEventListener("keydown", (event) => {
            if (event.key !== "Tab" || !nav.hasAttribute("data-open")) return;
            const links = Array.from(nav.querySelectorAll("a[href], button:not([disabled])"))
              .filter(node => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== "hidden" && !node.closest("[inert]"));
            const first = links[0];
            const last = links[links.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }, { signal: siteShellController.signal });
          navToggle.addEventListener("click", () => {
            setNavigationOpen(!nav.hasAttribute("data-open"));
          }, { signal: siteShellController.signal });
        }

        navLinks?.addEventListener("click", (event) => {
          if (event.target instanceof HTMLAnchorElement) setNavigationOpen(false);
        }, { signal: siteShellController.signal });
        mobileNavigation.addEventListener("change", syncNavigationMode, { signal: siteShellController.signal });
        syncNavigationMode();

        document.querySelectorAll("[data-reveal-group]").forEach((group) => {
          group.querySelectorAll("[data-reveal-item]").forEach((item, index) => {
            if (item instanceof HTMLElement) item.style.setProperty("--reveal-index", String(index));
          });
        });

        const hero = document.querySelector("[data-hero-motion]");
        if (hero instanceof HTMLElement) {
          window.requestAnimationFrame(() => hero.classList.add("is-visible"));
        }

        const motionMode = document.body.dataset.motion ?? "subtle";
        if (motionMode !== "static") {
          document.querySelectorAll(".site-page-header, .site-main > .site-section-divider").forEach((item) => {
            item.setAttribute("data-reveal", "");
          });
        }
        const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
        if (motionMode === "static" || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
          revealItems.forEach((item) => item.classList.add("is-visible"));
        } else {
          const revealObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" });
          revealItems.forEach((item) => revealObserver.observe(item));
          window.__siteRevealObserver = revealObserver;
        }

        const storyItems = Array.from(document.querySelectorAll("[data-motion-story]"));
        const storyMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const syncStories = () => {
          window.__siteStoryObserver?.disconnect();
          if (motionMode === "static" || storyMotion.matches || !("IntersectionObserver" in window)) {
            storyItems.forEach((item) => item.removeAttribute("data-motion-active"));
            return;
          }
          const storyObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              entry.target.toggleAttribute("data-motion-active", entry.isIntersecting);
              if (!entry.isIntersecting) continue;
              for (const stylesheet of entry.target.querySelectorAll("link[data-motion-href]")) {
                stylesheet.addEventListener("load", () => entry.target.setAttribute("data-motion-ready", ""), { once: true, signal: siteShellController.signal });
                stylesheet.setAttribute("href", stylesheet.getAttribute("data-motion-href"));
                stylesheet.removeAttribute("data-motion-href");
              }
              for (const image of entry.target.querySelectorAll("image[data-motion-src]")) {
                image.setAttribute("href", image.getAttribute("data-motion-src"));
                image.removeAttribute("data-motion-src");
              }
            }
          }, { threshold: 0.2 });
          storyItems.forEach((item) => storyObserver.observe(item));
          window.__siteStoryObserver = storyObserver;
        };
        storyMotion.addEventListener("change", syncStories, { signal: siteShellController.signal });
        syncStories();

        const isEditableTarget = (target) => {
          if (!(target instanceof HTMLElement)) {
            return false;
          }

          const tag = target.tagName;
          return (
            target.isContentEditable ||
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
          );
        };

        const secretSequence = ["arrowleft", "arrowleft", "arrowup", "b", "s"];
        let secretSequenceProgress = 0;

        const launchConfettiBurst = ({
          xRatio = 0.5,
          yRatio = 0.45,
          particleCount = 120,
        } = {}) => {
          const canvas = document.createElement("canvas");
          canvas.setAttribute("aria-hidden", "true");
          canvas.className = "site-confetti";
          document.body.appendChild(canvas);

          const context = canvas.getContext("2d");
          if (!context) {
            canvas.remove();
            return;
          }

          const dpr = Math.max(1, window.devicePixelRatio || 1);
          const width = window.innerWidth;
          const height = window.innerHeight;
          canvas.width = Math.floor(width * dpr);
          canvas.height = Math.floor(height * dpr);
          context.scale(dpr, dpr);

          const originX = width * xRatio;
          const originY = height * yRatio;
          const rootStyles = window.getComputedStyle(document.documentElement);
          const particleColors = [
            `hsl(${rootStyles.getPropertyValue("--primary")})`,
            `hsl(${rootStyles.getPropertyValue("--accent")})`,
            `hsl(${rootStyles.getPropertyValue("--foreground")})`,
          ];
          const particleLifetimeMs = 1400;
          const gravity = 0.18;
          const drag = 0.986;

          const particles = Array.from({ length: particleCount }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 8;
            return {
              x: originX,
              y: originY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - (4 + Math.random() * 3),
              size: 4 + Math.random() * 5,
              rotation: Math.random() * Math.PI * 2,
              rotationVelocity: (Math.random() - 0.5) * 0.35,
              color: particleColors[Math.floor(Math.random() * particleColors.length)],
            };
          });

          const startTime = performance.now();
          let previousTimestamp = startTime;

          const frame = (timestamp) => {
            const elapsed = timestamp - startTime;
            const normalizedDelta = Math.min(
              2,
              (timestamp - previousTimestamp) / 16.67,
            );
            previousTimestamp = timestamp;

            context.clearRect(0, 0, width, height);

            const fade = 1 - elapsed / particleLifetimeMs;
            for (const particle of particles) {
              particle.vx *= Math.pow(drag, normalizedDelta);
              particle.vy += gravity * normalizedDelta;
              particle.x += particle.vx * normalizedDelta;
              particle.y += particle.vy * normalizedDelta;
              particle.rotation += particle.rotationVelocity * normalizedDelta;

              context.save();
              context.translate(particle.x, particle.y);
              context.rotate(particle.rotation);
              context.globalAlpha = Math.max(0, fade);
              context.fillStyle = particle.color;
              context.fillRect(
                -particle.size / 2,
                -particle.size / 2,
                particle.size,
                particle.size * 0.55,
              );
              context.restore();
            }

            if (elapsed < particleLifetimeMs) {
              window.requestAnimationFrame(frame);
            } else {
              canvas.remove();
            }
          };

          window.requestAnimationFrame(frame);
        };

        const triggerConfetti = () => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
          }

          launchConfettiBurst();
          window.setTimeout(() => {
            launchConfettiBurst({ xRatio: 0.34, yRatio: 0.56, particleCount: 80 });
          }, 120);
          window.setTimeout(() => {
            launchConfettiBurst({ xRatio: 0.66, yRatio: 0.56, particleCount: 80 });
          }, 230);
        };

        document.querySelectorAll("[data-confetti-trigger]").forEach((trigger) => {
          trigger.addEventListener("click", () => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            const bounds = trigger.getBoundingClientRect();
            launchConfettiBurst({
              xRatio: (bounds.left + bounds.width / 2) / window.innerWidth,
              yRatio: (bounds.top + bounds.height / 2) / window.innerHeight,
              particleCount: 90,
            });
          }, { signal: siteShellController.signal });
        });

        const updateSecretSequence = (event) => {
          if (isEditableTarget(event.target)) {
            secretSequenceProgress = 0;
            return false;
          }

          if (event.ctrlKey || event.metaKey || event.altKey) {
            secretSequenceProgress = 0;
            return false;
          }

          const key = event.key.toLowerCase();
          if (key === secretSequence[secretSequenceProgress]) {
            secretSequenceProgress += 1;

            if (secretSequenceProgress === secretSequence.length) {
              secretSequenceProgress = 0;
              triggerConfetti();
              return true;
            }

            return false;
          }

          secretSequenceProgress = key === secretSequence[0] ? 1 : 0;
          return false;
        };

        window.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && nav instanceof HTMLElement && nav.hasAttribute("data-open")) {
            event.preventDefault();
            setNavigationOpen(false);
            navToggle?.focus();
            return;
          }

          if (nav?.hasAttribute("data-open")) return;

          if (updateSecretSequence(event)) {
            event.preventDefault();
            return;
          }

          if (!(event.metaKey || event.ctrlKey)) {
            return;
          }

          if (event.key.toLowerCase() !== "k") {
            return;
          }

          if (isEditableTarget(event.target)) {
            return;
          }

          event.preventDefault();

          window.dispatchEvent(new CustomEvent("site-command:open"));
        }, { signal: siteShellController.signal });
        };

        if (!window.__siteShellPageLoadBound) {
          document.addEventListener("astro:page-load", initializeSiteShell);
          window.__siteShellPageLoadBound = true;
        }
        initializeSiteShell();
      })();
