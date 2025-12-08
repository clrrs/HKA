# Accessible Carousel Feature Plan

## Project Context

This is a **kiosk application** for exploring Helen Keller Archive artifacts. The carousel feature will allow users to browse and zoom into images within artifact pages.

### Critical Constraints

| Constraint | Details |
|------------|---------|
| **Input Device** | Custom keypad mapped to **Shift+Tab** (previous), **Tab** (next), and **Enter** (activate) |
| **Screen Reader** | Apple VoiceOver available via keypad button (optional for users) |
| **Focus Model** | Focus trap within layers; Tab/Shift+Tab cycles through focusable elements |
| **Content Type** | Images only (max ~5 per carousel) |
| **Demo Page** | `3A2_JapaneseLuncheonSet1948.html` (replace existing carousel, start fresh) |

### Input Mapping

| Keypad Button | Keyboard Event | Action |
|---------------|----------------|--------|
| ◀ (Back) | Shift+Tab | Move to previous focusable element |
| ▶ (Forward) | Tab | Move to next focusable element |
| ● (Select) | Enter | Activate focused element |

### Design Philosophy

- Curated, constrained experience (not free-form web navigation)
- Respect screen reader user expectations where possible
- Every action achieved via Tab/Shift+Tab navigation + Enter activation
- Visual feedback for all focusable elements (prominent yellow border on focus)
- Clear announcements at every state change for VoiceOver users

---

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ PAGE LEVEL                                                       │
│   User can Tab to carousel, then Tab away to other elements     │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ LAYER 1: Auto-Carousel (Surface)                            ││
│  │   • Auto-transitions every 5 seconds (sighted users only)   ││
│  │   • No announcements during auto-play                       ││
│  │   • On focus: stops auto-play, shows "Enter to Explore"     ││
│  │   • Controls: [Enter → Layer 2]                             ││
│  │                              │                               ││
│  │                              ▼                               ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │ LAYER 2: Navigation Mode                                │││
│  │  │   • Focus trapped: Tab/Shift+Tab to move, Enter to act  │││
│  │  │   • Announces current image alt text                    │││
│  │  │   • Menu: [Exit] [◀ Prev] [Next ▶] [Zoom]              │││
│  │  │                              │                          │││
│  │  │                              ▼                          │││
│  │  │  ┌─────────────────────────────────────────────────────┐│││
│  │  │  │ LAYER 3: Zoom Mode (FULL SCREEN)                    ││││
│  │  │  │   • Image displayed at zoom level (-300% to +300%)  ││││
│  │  │  │   • Menu: [Exit] [Pan] [Zoom]                       ││││
│  │  │  │                    │       │                        ││││
│  │  │  │          ┌────────┘       └────────┐                ││││
│  │  │  │          ▼                         ▼                ││││
│  │  │  │  ┌────────────────┐       ┌────────────────┐        ││││
│  │  │  │  │ PAN SUB-MENU   │       │ ZOOM SUB-MENU  │        ││││
│  │  │  │  │ [Exit]         │       │ [Exit]         │        ││││
│  │  │  │  │ [Up] [Down]    │       │ [Zoom In]      │        ││││
│  │  │  │  │ [Left] [Right] │       │ [Zoom Out]     │        ││││
│  │  │  │  │ [Reset]        │       │ [Reset]        │        ││││
│  │  │  │  └────────────────┘       └────────────────┘        ││││
│  │  │  └─────────────────────────────────────────────────────┘│││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Layer Specifications

### Layer 1: Auto-Carousel (Surface Level)

**Purpose:** Attract sighted users with rotating images; provide entry point for all users.

| Aspect | Specification |
|--------|---------------|
| **Auto-transition** | Every 5 seconds, cycles through images |
| **On focus/hover** | Pauses auto-transition immediately |
| **Visual state** | Shows current image + dot indicators + "Enter to Explore" prompt |
| **Screen reader** | Announces: *"Image carousel. [X] images. Press Enter to explore."* |
| **Focusable elements** | Single focus target (the carousel container itself) |
| **Enter action** | Transitions to Layer 2 (no separate button—Enter on carousel triggers it) |
| **Exit** | User presses Tab to leave carousel and continue to next page element |

**Decisions Made:**
- ✅ Enter on carousel itself triggers Layer 2 (not a separate focusable button)
- ✅ "Enter to Explore" is a visual prompt only, not a focusable element

---

### Layer 2: Navigation Mode

**Purpose:** Allow user to browse images at their own pace with full control.

| Aspect | Specification |
|--------|---------------|
| **Focus trap** | Yes - Tab/Shift+Tab cycles through menu items only |
| **Menu layout** | Horizontal row: `[Exit]` `[◀ Prev]` `[Next ▶]` `[Zoom]` |
| **Navigation** | Shift+Tab = previous menu item, Tab = next menu item |
| **Menu wrapping** | Yes - Tab on last item → first item; Shift+Tab on first → last |
| **Image display** | Current image shown prominently |
| **Focus indicator** | Prominent yellow border (#ffd400) on focused menu item |
| **Screen reader** | On enter: *"Navigation mode. Image [X] of [Y]. [Alt text of current image]. Use left and right to navigate menu. Exit, Previous, Next, or Zoom."* |
| **On image change** | Announces: *"Image [X] of [Y]. [Alt text]"* |

**Menu Item Actions:**

| Menu Item | Enter Action |
|-----------|--------------|
| Exit | Returns to Layer 1, resumes auto-play |
| ◀ Prev | Shows previous image (wraps: 1 → last), announces new image |
| Next ▶ | Shows next image (wraps: last → 1), announces new image |
| Zoom | Transitions to Layer 3 |

**Decisions Made:**
- ✅ Horizontal menu layout
- ✅ Prev/Next wraps around (circular navigation through images)
- ✅ Yellow border focus indicator (consistent with rest of app)

---

### Layer 3: Zoom Mode

**Purpose:** Allow detailed examination of the current image with pan and zoom controls.

| Aspect | Specification |
|--------|---------------|
| **Display** | **Full screen** - takes over entire app canvas |
| **Background** | **60% black opacity overlay** over all other page elements |
| **Initial state** | Image fit to container (full screen), centered |
| **Focus trap** | Yes - Tab/Shift+Tab cycles through menu items only |
| **Menu layout** | Horizontal row: `[Exit]` `[Pan]` `[Zoom]` |
| **Screen reader** | On enter: *"Zoom mode. [Alt text]. Full screen. Exit, Pan, or Zoom."* |

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│  60% Black Overlay (covers full page)   │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │         Zoomed Image              │  │
│  │         (centered)                │  │
│  │                                   │  │
│  ├───────────────────────────────────┤  │
│  │  [Exit]   [Pan]   [Zoom]          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Menu Item Actions:**

| Menu Item | Enter Action |
|-----------|--------------|
| Exit | Returns to Layer 2 |
| Pan | Opens Pan Sub-Menu |
| Zoom | Opens Zoom Sub-Menu |

**Decisions Made:**
- ✅ Full screen display when entering zoom mode
- ✅ 60% black opacity overlay background
- ✅ Initial state is fit-to-container (not zoomed)

---

### Layer 3a: Pan Sub-Menu

**Purpose:** Move the viewport around a zoomed image.

| Aspect | Specification |
|--------|---------------|
| **Menu layout** | Horizontal: `[Exit]` `[Up]` `[Down]` `[Left]` `[Right]` `[Reset]` |
| **Screen reader** | *"Pan controls. Exit, Up, Down, Left, Right, Reset."* |
| **Pan increment** | **10% of viewport** per action |
| **Hold behavior** | **Hold to repeat** - holding Enter continues panning |
| **Boundary behavior** | At edge: button becomes **grayed out/disabled**, Enter does nothing |
| **Focus on disabled** | User must Tab/Shift+Tab to a different direction |

**Menu Item Actions:**

| Menu Item | Enter Action |
|-----------|--------------|
| Exit | Returns to Layer 3 main menu |
| Up | Pans image up, announces "Panned up" (disabled at top edge) |
| Down | Pans image down, announces "Panned down" (disabled at bottom edge) |
| Left | Pans image left, announces "Panned left" (disabled at left edge) |
| Right | Pans image right, announces "Panned right" (disabled at right edge) |
| Reset | Centers image, returns to fit-to-screen, announces "Reset. Image centered." |

**Decisions Made:**
- ✅ Hold to repeat for pan buttons
- ✅ Buttons gray out at boundaries (Enter does nothing)
- ✅ Reset option included - returns to fit-to-screen centered state

---

### Layer 3b: Zoom Sub-Menu

**Purpose:** Adjust zoom level of the image.

| Aspect | Specification |
|--------|---------------|
| **Menu layout** | Horizontal: `[Exit]` `[Zoom In]` `[Zoom Out]` `[Reset]` |
| **Screen reader** | *"Zoom controls. Exit, Zoom In, Zoom Out, Reset."* |
| **Zoom increment** | **25% per step** |
| **Zoom range** | **-300% to +300%** (see note below) |
| **Default zoom** | 0% (fit to screen) |
| **Boundary behavior** | At min/max: button becomes **grayed out/disabled**, Enter does nothing |

**Zoom Scale Explained:**

| Zoom Value | Visual Effect |
|------------|---------------|
| -300% | Image is very small, centered on screen (for users with limited field of vision) |
| -150% | Image is smaller than screen, centered |
| 0% | **Default** - Image fits to screen |
| +150% | Image is 1.5x larger than screen (requires panning) |
| +300% | Image is 3x larger than screen (requires panning) |

**Menu Item Actions:**

| Menu Item | Enter Action |
|-----------|--------------|
| Exit | Returns to Layer 3 main menu |
| Zoom In | +25% zoom, announces "Zoomed in. [X]%" (disabled at +300%) |
| Zoom Out | -25% zoom, announces "Zoomed out. [X]%" (disabled at -300%) |
| Reset | Returns to 0% (fit to screen), announces "Reset. Fit to screen." |

**Decisions Made:**
- ✅ 25% zoom increment per step
- ✅ Range: -300% (small/centered) to +300% (large/requires pan)
- ✅ Buttons gray out at limits (Enter does nothing)
- ✅ Reset option included - returns to fit-to-screen (0%)

---

## Screen Reader Announcements (Draft)

These are placeholder announcements to be refined:

| Trigger | Announcement |
|---------|--------------|
| Focus carousel (Layer 1) | "Image carousel. [X] images. Press Enter to explore." |
| Enter Layer 2 | "Navigation mode. Image [X] of [Y]. [Alt text]. Exit, Previous, Next, Zoom." |
| Change image (Layer 2) | "Image [X] of [Y]. [Alt text]." |
| Enter Layer 3 | "Zoom mode. [Alt text]. Full screen. Exit, Pan, Zoom." |
| Enter Pan sub-menu | "Pan controls. Exit, Up, Down, Left, Right, Reset." |
| Enter Zoom sub-menu | "Zoom controls. Exit, Zoom In, Zoom Out, Reset." |
| Pan action | "Panned [direction]." |
| Pan at boundary | "[Direction] limit reached." |
| Zoom action | "Zoomed [in/out]. [X] percent." |
| Zoom at boundary | "Maximum zoom." or "Minimum zoom." |
| Reset (Pan) | "Reset. Image centered." |
| Reset (Zoom) | "Reset. Fit to screen." |
| Exit any layer | "Exited [layer name]." |
| Focus on menu item | "[Menu item name]." |
| Focus on disabled item | "[Menu item name]. Disabled." |

---

## Implementation Phases

### Phase 1: Foundation ✅ → 🔲
**Goal:** Establish core carousel structure with Layer 1 functionality

- [ ] **1.1** Refactor existing carousel HTML to support layer system
- [ ] **1.2** Implement auto-transition (5-second interval)
- [ ] **1.3** Pause auto-transition on focus/hover
- [ ] **1.4** Add "Enter to Explore" visual prompt
- [ ] **1.5** Implement basic ARIA attributes for Layer 1
- [ ] **1.6** Test with screen reader (VoiceOver)

**Deliverable:** Carousel auto-plays, pauses on focus, announces entry point

---

### Phase 2: Navigation Mode (Layer 2) 🔲
**Goal:** Full image browsing experience

- [ ] **2.1** Create Layer 2 menu UI (Exit, Prev, Next, Zoom buttons)
- [ ] **2.2** Implement focus trap (Tab/Shift+Tab cycles through menu)
- [ ] **2.3** Implement menu item actions (prev/next image navigation)
- [ ] **2.4** Add image alt text announcements
- [ ] **2.5** Style focus states for menu items
- [ ] **2.6** Implement Exit action (return to Layer 1)
- [ ] **2.7** Test with screen reader

**Deliverable:** User can enter, browse images, and exit Layer 2

---

### Phase 3: Zoom Mode (Layer 3) 🔲
**Goal:** Basic zoom viewing with pan and zoom controls

- [ ] **3.1** Create Layer 3 container and menu UI
- [ ] **3.2** Implement image zoom display (CSS transform)
- [ ] **3.3** Create Pan sub-menu UI
- [ ] **3.4** Implement pan functionality
- [ ] **3.5** Create Zoom sub-menu UI
- [ ] **3.6** Implement zoom in/out functionality
- [ ] **3.7** Add boundary detection (pan limits, zoom limits)
- [ ] **3.8** Test with screen reader

**Deliverable:** Full zoom/pan functionality working

---

### Phase 4: Polish & Accessibility Audit 🔲
**Goal:** Production-ready accessibility

- [ ] **4.1** Refine all screen reader announcements
- [ ] **4.2** Ensure consistent focus management
- [ ] **4.3** Add visual transitions/animations
- [ ] **4.4** Cross-browser testing
- [ ] **4.5** Full VoiceOver walkthrough test
- [ ] **4.6** Document keyboard shortcuts for reference
- [ ] **4.7** Performance optimization (image loading)

**Deliverable:** Production-ready carousel feature

---

### Phase 5: Rollout 🔲
**Goal:** Apply to other artifact pages

- [ ] **5.1** Extract carousel as reusable component
- [ ] **5.2** Document usage for other pages
- [ ] **5.3** Apply to additional artifact pages as needed

---

## Technical Considerations

### HTML Structure (Proposed)

```html
<div class="carousel" 
     role="region" 
     aria-label="Image carousel"
     tabindex="0"
     data-layer="1">
  
  <!-- Layer 1: Surface (visible by default) -->
  <div class="carousel-layer carousel-layer-1" data-active="true">
    <div class="carousel-viewport">
      <img src="..." alt="...">
    </div>
    <div class="carousel-indicators" aria-hidden="true">
      <span class="indicator active"></span>
      <span class="indicator"></span>
    </div>
    <div class="carousel-prompt" aria-hidden="true">Press Enter to Explore</div>
  </div>
  
  <!-- Layer 2: Navigation (hidden initially) -->
  <div class="carousel-layer carousel-layer-2" data-active="false" aria-hidden="true">
    <div class="carousel-image-display">
      <img src="..." alt="...">
    </div>
    <div class="carousel-menu" role="toolbar" aria-label="Image navigation">
      <button type="button" data-action="exit">Exit</button>
      <button type="button" data-action="prev">◀ Prev</button>
      <button type="button" data-action="next">Next ▶</button>
      <button type="button" data-action="zoom">Zoom</button>
    </div>
  </div>
  
  <!-- Layer 3: Zoom Mode (hidden, becomes full screen when active) -->
  <div class="carousel-layer carousel-layer-3" data-active="false" aria-hidden="true">
    <div class="carousel-zoom-viewport">
      <img src="..." alt="..." class="zoomable-image">
    </div>
    <div class="carousel-menu" role="toolbar" aria-label="Zoom controls">
      <button type="button" data-action="exit">Exit</button>
      <button type="button" data-action="pan">Pan</button>
      <button type="button" data-action="zoom-control">Zoom</button>
    </div>
  </div>
  
  <!-- Layer 3a: Pan Sub-Menu (hidden) -->
  <div class="carousel-layer carousel-layer-3a" data-active="false" aria-hidden="true">
    <div class="carousel-zoom-viewport">
      <img src="..." alt="..." class="zoomable-image">
    </div>
    <div class="carousel-menu" role="toolbar" aria-label="Pan controls">
      <button type="button" data-action="exit">Exit</button>
      <button type="button" data-action="pan-up">Up</button>
      <button type="button" data-action="pan-down">Down</button>
      <button type="button" data-action="pan-left">Left</button>
      <button type="button" data-action="pan-right">Right</button>
      <button type="button" data-action="reset">Reset</button>
    </div>
  </div>
  
  <!-- Layer 3b: Zoom Sub-Menu (hidden) -->
  <div class="carousel-layer carousel-layer-3b" data-active="false" aria-hidden="true">
    <div class="carousel-zoom-viewport">
      <img src="..." alt="..." class="zoomable-image">
    </div>
    <div class="carousel-menu" role="toolbar" aria-label="Zoom level controls">
      <button type="button" data-action="exit">Exit</button>
      <button type="button" data-action="zoom-in">Zoom In</button>
      <button type="button" data-action="zoom-out">Zoom Out</button>
      <button type="button" data-action="reset">Reset</button>
    </div>
  </div>
  
  <!-- Live region for screen reader announcements -->
  <div class="sr-only" aria-live="polite" aria-atomic="true" id="carousel-announcer"></div>
</div>
```

### CSS Considerations

| Concern | Approach |
|---------|----------|
| Focus styles | Use existing 3px solid #ffd400 border |
| Menu buttons | Follow existing nav button styling (rounded, light bg) |
| Touch targets | Minimum 44x44px for all buttons |
| Layer 3 overlay | `position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6);` |
| Disabled buttons | Grayed out (`opacity: 0.5; cursor: not-allowed`) |
| **Layer transitions** | **600ms duration, linear easing** (simple fade in/out) |

**Transition Example:**
```css
.carousel-layer {
  opacity: 0;
  visibility: hidden;
  transition: opacity 600ms linear, visibility 600ms linear;
}

.carousel-layer[data-active="true"] {
  opacity: 1;
  visibility: visible;
}

/* Layer 3 overlay */
.carousel-layer-3,
.carousel-layer-3a,
.carousel-layer-3b {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

### JavaScript Architecture

```
CarouselController
├── state: {
│     currentLayer: '1' | '2' | '3' | '3a' | '3b',
│     currentSlide: number,
│     zoomLevel: number,        // -300 to +300
│     panPosition: { x, y },    // percentage offset
│     autoPlayTimer: number,
│   }
│
├── Layer1Controller
│     • startAutoPlay() / stopAutoPlay()
│     • onFocus() → pause auto-play
│     • onEnter() → transition to Layer 2
│
├── Layer2Controller
│     • renderMenu([Exit, Prev, Next, Zoom])
│     • onPrev() / onNext() → change slide (wrapping)
│     • onZoom() → transition to Layer 3
│     • onExit() → return to Layer 1
│
├── Layer3Controller
│     • enterFullScreen()
│     • onPan() → transition to Layer 3a
│     • onZoomControl() → transition to Layer 3b
│     • onExit() → return to Layer 2, exit full screen
│
├── PanController (Layer 3a)
│     • pan(direction) → update panPosition
│     • checkBoundaries() → disable buttons at edges
│     • reset() → center image
│     • holdToRepeat support for direction buttons
│
├── ZoomController (Layer 3b)
│     • zoomIn() / zoomOut() → ±25%
│     • checkBoundaries() → disable at ±300%
│     • reset() → return to 0%
│
├── FocusManager
│     • trapFocus(layer) → Tab/Shift+Tab cycles within menu
│     • handleKeydown(event)
│
└── Announcer
      • announce(message) → update live region
```

### State Transitions

```
Layer 1 ──[Enter]──► Layer 2 ──[Zoom]──► Layer 3 ──[Pan]──► Layer 3a
   ▲                    │                   │                  │
   │                    │                   │                  │
   └────[Exit]──────────┘                   │    [Exit]────────┘
                                            │
                        ◄────[Exit]─────────┤
                                            │
                                            └──[Zoom]──► Layer 3b
                                                            │
                                            ◄────[Exit]─────┘
```

---

## Resolved Questions

All design questions have been answered:

| Question | Decision |
|----------|----------|
| Layer 1 entry | Enter on carousel itself triggers Layer 2 (no separate button) |
| Image wrapping | Yes, Prev/Next wraps around circularly |
| Menu orientation | Horizontal layout for all menus |
| Pan increment | **10% of viewport** per action |
| Zoom range | -300% (smaller) to +300% (larger), 25% steps |
| Pan boundaries | Button grays out, Enter does nothing, must Tab away |
| Zoom boundaries | Same as pan - button grays out at limits |
| Reset options | Yes, Reset button in both Pan and Zoom sub-menus |
| Hold behavior | Pan buttons support hold-to-repeat |
| Layer transitions | **600ms, linear easing** (simple fade) |
| Full-screen overlay | **60% black opacity** (`rgba(0,0,0,0.6)`) |

---

## References

- [WAI-ARIA Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- Existing project: `style.css`, `3A2_JapaneseLuncheonSet1948.html`

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-08 | Initial plan created |
| 2025-12-08 | Updated with clarified input mapping (Shift+Tab/Tab/Enter) |
| 2025-12-08 | Added resolved questions: zoom range, pan behavior, reset buttons |
| 2025-12-08 | Added full screen requirement for Layer 3 |
| 2025-12-08 | Added hold-to-repeat for pan, boundary disable behavior |
| 2025-12-08 | Finalized: pan increment (10%), transitions (600ms linear), overlay (60% black) |
| 2025-12-08 | **All design questions resolved - ready for implementation** |


