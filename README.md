# Physics Playground

An interactive physics sandbox built around one question: **"What
happens if I change this?"**

Move a slider and the numbers, graph, and visualization respond
instantly. The app is explicit about when a result is only mathematical
and no longer physically meaningful.

The app is bilingual. The **DE / EN** button at the top of the sidebar
(in the header on mobile) switches all text between German and English.
The selection is saved in the browser. If no language has been saved,
the browser language is used. A link can also specify the language, for
example `#exp=hawking&lang=en`.

## Getting Started

Online: **https://observer-0.github.io/physics-playground/**

Or open `src/index.html` directly in your browser. No server or build
step is required. The page loads the source files individually; changes
become visible after reloading.

Run `npm run build` to generate a single, self-contained HTML file at
`dist/index.html`. The built file is no longer committed to the
repository: GitHub Actions builds the online version on every push.

Every push to `main` runs ESLint and the tests, builds the app, tests it
in a browser, and publishes `dist/` to GitHub Pages
(`.github/workflows/pages.yml`).

Development requires Node.js ≥ 18. `npm install` installs ESLint only.

``` bash
npm test         # 108 tests in Node (the 11 UI tests run fully only in a browser)
npm run lint     # ESLint
npm run build    # bundles everything into dist/index.html
npm run check:ui # opens every page in both languages in headless Chrome/Edge and checks it,
                 # including the browser UI tests (choose the browser via CHROME_PATH)
npm run check    # runs everything, as in CI
```

The file loading order is defined only in `src/index.html`;
`npm run build` reads it from there.

## Contents

  -----------------------------------------------------------------------
  Area                                Experiments
  ----------------------------------- -----------------------------------
  Mechanics                           Newtonian gravitation · Kinematics
                                      · Free fall · Spring oscillator ·
                                      Circular motion · Pendulum
                                      (small-angle approximation
                                      vs. exact solution, period and
                                      exact motion θ(t)) · Projectile
                                      motion

  Relativity                          Lorentz factor (time dilation,
                                      length contraction, energy)

  Thermodynamics                      Ideal gas (`pV = N k_B T`)

  Famous Equations                    Hawking temperature ·
                                      Bekenstein--Hawking entropy ·
                                      Einstein field equations ·
                                      Schrödinger equation · Planck units
                                      (length, time, mass, temperature,
                                      and energy; including Boltzmann's
                                      constant and `k_B`)

  Foundations                         Short explanations of the theory,
                                      with an overview of cards and a
                                      separate page for each section:
                                      Dimensional analysis · Inertial
                                      principle and inertia · Relativity
                                      · Indices μν (interactive 4×4
                                      table) · Tensor construction
                                      (rotation/boost demo) ·
                                      Einstein--Hilbert action
                                      (least-action demo) · The people
                                      behind general relativity
                                      (Poincaré, Minkowski, Grossmann,
                                      Hilbert, Noether) · Quantum
                                      mechanics · Entropy (from Clausius
                                      to Wald, with a microstate demo) ·
                                      Why the two theories do not (yet)
                                      fit together

  Open Questions                      Where GR and quantum theory reach
                                      their limits, with a status per
                                      question: Why exactly 1/4? (black
                                      hole entropy prefactor η as a
                                      slider, first-law check
                                      R_η = 4η) · Why is the
                                      cosmological constant so small?
                                      (Λ as a curvature, 1/length²: a
                                      length axis coupled to a
                                      curvature axis, and the cutoff
                                      estimate of the vacuum energy
                                      ∝ E⁴ against u_Λ) · Is
                                      information lost? (evaporation in
                                      time-lapse with the Page curve,
                                      Page time from the engine). More
                                      questions in `ROADMAP.md`

  Tools                               Check your own or incorrect
                                      equations · Constants · Saved
                                      states · Browser tests
  -----------------------------------------------------------------------

Features include logarithmic/linear sliders; free-form numeric input
(including `3×10^8` and `2*M_sun`); graphs with freely selectable axes,
linear/log scales, zoom, tooltips, multiple curves, and hatched model
boundaries. Boundaries include an explanation and appear only for
quantities affected by them; the default graph range is chosen so the
valid region determines the view.

Other features: A/B comparison with ratio and percentage change (series
B is faded in the graph); presets with sources; "Try it" tasks with
automatic checking; a Sources tab with original papers and DOIs;
Break-the-Physics mode; Dimensional Analysis Nightmare Mode; URL state
(including visualization settings); local saving; and light and dark
themes.

Every experiment uses the same tabs (Graph & Lab, Formula & Variables,
Dimensional Analysis, Physics & Limits, Sources) and opens on the Lab
tab. On mobile, the visualization stays pinned at the top while
scrolling through the sliders.

The Hawking temperature page shows how quantum mechanics, relativity,
gravity, and thermodynamics meet. Its limiting cases can be explored
live in Break mode.

## Architecture

All experiments---including the famous equations---are **pure data**. A
shared pipeline processes them:

``` text
Formula (text) → AST → Variables → Units → Dimensions → Evaluation → Visualization → Explanation
```

### Project Structure

``` text
physics-playground/
├── src/
│   ├── core/          Calculation engine: parser, dimensions, constants, model
│   ├── data/          Experiments, tasks, and sources as pure data
│   ├── render/        Formula rendering, graphs, visualizations (Canvas)
│   ├── ui/            Interface: state, lab, pages, foundations
│   │   └── sections/  Individual foundations sections with widgets
│   ├── styles.css
│   └── index.html     Development version; loads files individually
├── tests/             Test cases (Node and browser) plus Node runner
├── scripts/
│   ├── build.js       Bundles src/index.html into a single HTML file
│   └── check-ui.js    Browser-tests every page in headless Chrome/Edge, without dependencies
├── eslint.config.mjs
└── dist/index.html    Built app (created by npm run build; not committed)
```

All files extend the global `PP` namespace. The loading order is defined
in `src/index.html`.

  -----------------------------------------------------------------------
  File                                Purpose
  ----------------------------------- -----------------------------------
  `src/core/i18n.js`                  Language support:
                                      `T('Deutsch', 'English')` for text
                                      in code; `localize(obj)` turns each
                                      `{ de, en }` pair in data into a
                                      field that follows the active
                                      language; language switching and
                                      persistence; `with(lang, fn)` for
                                      tests

  `src/core/engine.js`                Lexer/parser (Unicode, implicit
                                      multiplication); dimensions as
                                      rational-exponent vectors over the
                                      7 SI base quantities; evaluation in
                                      `{sign, log₁₀}` representation
                                      (supports values beyond `10^±308`);
                                      error localization by character
                                      position; TeX output and
                                      formatting; `sqrt`, `abs`, `exp`,
                                      `ln`, `log10`, `sin`, `cos`, `tan`,
                                      `asin`, the complete elliptic
                                      integral `ellipk` (via the
                                      arithmetic--geometric mean, for the
                                      pendulum) and the Jacobi function
                                      `sn(u, k)` (two arguments, also via
                                      the AGM, for the exact pendulum
                                      motion), `min` and `max` (two
                                      quantities of the same dimension,
                                      for the Page curve). Each function
                                      declares its number of arguments

  `src/core/model.js`                 Constants registry with type (exact
                                      / measured / convention /
                                      astronomical / model-dependent) and
                                      source; experiment model;
                                      `compute()` never throws and
                                      returns warning categories; error
                                      propagation from measured constants

  `src/data/experiments.js`           Experiment definitions: variables,
                                      formulas, equations, checks,
                                      presets, graph defaults,
                                      explanations at three levels, and
                                      epistemic classification

  `src/data/tasks.js`                 "Try it" tasks for each experiment:
                                      `done(x)` checks the state using
                                      engine values; `demo` is an example
                                      solution used by tests to verify
                                      that the task is solvable

  `src/data/sources.js`               Sources for each experiment
                                      (original papers, measurements,
                                      reference values); every DOI
                                      checked via Crossref; original
                                      titles carry a `lang` attribute

  `src/data/equations.js`             Interactive equation for each
                                      experiment and the 18 core
                                      equations in Foundations (`theory`;
                                      symbol type `q` means a dimensioned
                                      quantity): formulas use markers
                                      like `\xs{key}{…}` (without
                                      markers, the text is exactly
                                      `exp.tex`); each symbol has a
                                      source (constant, input, output,
                                      symbol, function, or number),
                                      color, short label, meaning, and
                                      role in that equation. The meaning
                                      of natural constants is defined
                                      once for all equations; their
                                      values come only from
                                      `src/core/model.js`

  `tests/tests.js`                    Reference values (including CODATA
                                      2022), numerical edge cases,
                                      dimensional checks for all
                                      formulas, parser tests, and
                                      visualization tests (using a
                                      drawing context that only records
                                      text)

  `src/render/tex.js`                 Small custom formula renderer
                                      (replaces KaTeX because its web
                                      fonts do not load in a hosted
                                      single-file build)

  `src/render/plot.js`                Canvas graph in transformed
                                      coordinates

  `src/render/viz.js`                 Canvas visualizations.
                                      `PP.vizState` exposes all numbers
                                      from the engine: `o` / `lg` / `fo`
                                      for results, `at(changes)` to
                                      evaluate the same formulas with
                                      different inputs (traces, curves,
                                      scales) or for another experiment,
                                      plus warning categories and
                                      reference values (preset/initial
                                      value). Drawing functions do not
                                      recalculate formulas themselves

  `src/ui/core.js`                    State, routing, URL state, saving,
                                      navigation, and the shared
                                      animation loop for theory widgets
                                      (`U.widgetLoop`)

  `src/ui/lab.js`                     Lab: parameters, results, status,
                                      graph with hatched model boundaries
                                      (reason via `why`, affected
                                      quantities via `on` and
                                      `PP.model.affects`, default range
                                      via `graph.view`), animation (pause
                                      and oscillate a value), warnings in
                                      the visualization header,
                                      comparison (series B faded in the
                                      graph), "Try it," Sources tab, and
                                      a text description of the
                                      visualization for screen readers

  `src/ui/eqx.js`                     Interactive equation component:
                                      formula with clickable symbols,
                                      legend, and card (name, value and
                                      unit, meaning, role, optional
                                      limiting case and live controls);
                                      selection by hover, focus, click,
                                      or tap; selection remembered per
                                      equation (`S.xsel`); close with ×
                                      or Esc; numeric placeholders filled
                                      by the engine after each
                                      calculation. Used in the crossroads
                                      block on the Hawking page and at
                                      the top of every other experiment
                                      page; in Foundations it appears as
                                      a floating card over the text
                                      (`inline`, `bindFloat`)

  `src/ui/crossroads.js`              Hawking-temperature crossroads
                                      block (`exp.crossroads`):
                                      interactive equation from `eqx.js`,
                                      cards for each theory, live
                                      limiting cases in Break mode, chain
                                      κ → T, "Aha!" box, and
                                      epistemic-status line; a black-hole
                                      ↔ thermodynamics glossary
                                      (`exp.dict`) on the Hawking and
                                      entropy pages. Values come from the
                                      engine

  `src/ui/dims.js`                    Explanation levels, dimensional
                                      analysis, Nightmare Mode, and
                                      custom equations (with warnings
                                      about ambiguous symbols such as
                                      `h`, `T`, and `e`, and expressions
                                      such as `a / b c`)

  `src/ui/pages.js`                   Hall of Fame, Constants, Saved,
                                      Tests, About

  `src/ui/sections/tensor.js`         Foundations sections "Indices μν"
                                      and "Tensor construction," with
                                      interactive widgets; integrated
                                      into `src/ui/theory.js`

  `src/ui/sections/action.js`         "Einstein--Hilbert action" section
                                      (action demo with exact formula
                                      `ΔS = mπ²/(4τ)·(ε₁² + 4ε₂²)`) and
                                      "The people behind general
                                      relativity"

  `src/ui/sections/entropy.js`        "Entropy --- one word, many
                                      meanings" section with the
                                      Ehrenfest model

  `src/ui/theory.js`                  Foundations: overview with one card
                                      per section (`#view=theorie`); each
                                      section has its own page
                                      (`#view=theorie&sec=dim` /
                                      `inertia` / `rel` / `idx` /
                                      `tensor` / `action` / `history` /
                                      `qm` / `entropy` / `gap`) with
                                      readable text width, wide widgets,
                                      expandable deep dives
                                      (`<h3 class="th-h3 th-deep">`),
                                      sticky table of contents and "Next
                                      up"; subsections in the sidebar;
                                      and a "Character of the theory"
                                      comparison bar. `U.sectionPage`
                                      builds these pages and is shared
                                      with Open Questions

  `src/ui/open.js`                    Open Questions: overview
                                      (`#view=offen`) and one page per
                                      question (`#view=offen&sec=quarter`)
                                      with the five parts question /
                                      established / open / what would
                                      settle it / live in the app, a
                                      status (open, partially
                                      understood, semiclassically
                                      resolved), epistemic labels per
                                      statement and the sources of the
                                      question's experiment. Experiments
                                      with `field: 'open'` appear under
                                      their question in the sidebar
  -----------------------------------------------------------------------

### Adding a New Experiment

Add another `define({ … })` block to `src/data/experiments.js`. Each
text is stored as a `{ de, en }` pair next to the data. Text that is
identical in both languages can remain a simple string:

``` js
define({
  id: 'my-exp', group: MECH, field: 'mech',
  title: { de: 'Ruheenergie', en: 'Rest energy' },
  short: { de: 'Ruheenergie', en: 'Rest energy' },
  tex: 'E = m c^2',
  vars: {
    m: {
      label: 'm', tex: 'm',
      name: { de: 'Masse', en: 'Mass' },
      dim: 'M', default: 1, min: 1e-3, max: 1e3,
      scale: 'log', positive: true
    }
  },
  outputs: [{
    key: 'E', sym: 'E', tex: 'E',
    name: { de: 'Energie', en: 'Energy' },
    expr: 'm*c^2', dim: 'M L^2 T^-2', primary: true
  }],
  equations: [{
    label: { de: 'Ruheenergie', en: 'Rest energy' },
    eq: 'E = m*c^2'
  }],
  presets: [],
  graph: { x: 'm', y: 'E' },
  viz: null,
  explain: {
    intuition: { de: '…', en: '…' },
    math: [],
    physics: { de: '…', en: '…' },
    epistemics: []
  }
});
```

`field` assigns the experiment to a topic area (`mech`, `rel`, `thermo`,
`famous`). The field's name, icon, and color are defined in
`src/ui/core.js` (`U.FIELDS`) and `src/styles.css` (`[data-field]`). If
`field` is unknown, the experiment gets a neutral group using its
`group` name.

Add tasks to `src/data/tasks.js` and sources to `src/data/sources.js`.

Write messages in `checks()` as `T('…', '…')`. The test "No German
leftovers in English experiment and constant text" catches forgotten
translations.

Dimensional analysis, graphs, comparison, URL state, and automatic
dimensional checks in the tests work without additional code. To add a
custom visualization, define a function in `src/render/viz.js`:

``` js
PP.viz.name = (ctx, W, H, S) => { /* ... */ };
```

Values must always come from `S.o('key')` or
`S.at({ t: 2 }).o('key')`---never from a duplicated formula.
`vizControls` are switches or, when using `options`, a selection in the
visualization header (the value is available in `S.opts`). Add
`sweep: { key, span, period, label }` to give the visualization a
control that oscillates a value around its initial value (by a factor of
`span` in both directions). With `center`, it oscillates around that
value instead and starts without a jump from the current value (the
`bh-eta` experiment sweeps η around 1/4). While a value is oscillating
or time is running, no task counts as solved; stopping at the right
moment does.

`animateVar` names the slider that "Let time run" advances; it moves by
one unit per second unless `animateRate` says otherwise (the Page curve
runs τ = t/t_evap from 0 to 1 at `animateRate: 0.1`, i.e. in 10 s).

An experiment with several `forms` can give a form its own `graph`
defaults (the pendulum's "Motion θ(t)" form plots θ over t). If a form
contains the experiment's `animateVar`, the visualization follows that
slider ("Let time run") instead of its free-running clock.

## Warning Categories

-   **Mathematically undefined** --- division by zero, square root of a
    negative number, γ when β ≥ 1
-   **Numerically problematic** --- values outside the floating-point
    range; calculations continue in logarithmic form and a warning is
    shown
-   **Physically unrealistic** --- altered constants, negative masses,
    `v > c`
-   **Outside the model's domain** --- the formula returns a number, but
    the model is not valid there (for example, Newtonian gravity near
    `r_s`)

Additional notes and model assumptions are provided where relevant.

## Scientific Accuracy

-   Constants: CODATA 2022, IAU 2012/2015, and Planck 2018, with sources
    shown in the app
-   Display precision is limited by the uncertainty of measured
    constants (no false precision)
-   Explanations distinguish mathematics, models, approximations,
    measurements, and assumptions
-   Visualizations that are not to scale are labeled; projections (such
    as the field equations) are marked "schematic (model)"
-   Visualizations use only engine values and inherit its warning
    categories: warnings appear in the visualization header;
    mathematically undefined results have no animation or numeric value;
    graphs hatch regions outside the model's domain
-   Original papers and measurements are listed in each experiment's
    Sources tab, with verified DOIs
-   Dimensional consistency is never presented as proof of physical
    correctness

## Dependencies & Licenses

The app uses no JavaScript libraries. Fonts are loaded through Google
Fonts (IBM Plex Sans/Mono and STIX Two Text, licensed under the SIL Open
Font License), with system fallbacks. Development installs only ESLint;
browser tests use an existing Chrome or Edge installation.

## Robustness

-   Names are looked up only as explicit entries: `constructor`,
    `toString`, and similar names are treated as unknown symbols in
    formulas; `__proto__` is rejected; unknown `#exp=` / `#view=` values
    in the URL are ignored
-   Theory widgets redraw only when something changes and only while
    visible; the "Animations" toggle (off by default when
    `prefers-reduced-motion` is set) applies immediately to all widgets
    and is linked to each animation's "Pause" button

## Known Limitations

-   The formula renderer supports the TeX subset used by the app, not
    full LaTeX
-   Tensor equations are checked dimensionally component by component,
    not structurally
-   Saved states and completed tasks are stored only in the local
    browser; share a state code to pass them to someone else

## Future Development

The **Open Questions** section explores unresolved problems in physics. The first question –
the black hole entropy coefficient – is live; the cosmological constant, the information paradox,
the measurement problem, and the requirements for quantum gravity are planned.

The core application remains theory-neutral beyond General Relativity (GR) and quantum mechanics.
Open Questions is a separate exploratory space: 
Established results, competing interpretations, and speculative proposals must be clearly distinguished. 
No alternative theory is assumed to be correct or incorporated into the application's core framework.

The section is always visible in the sidebar, between Foundations and Tools (as in `ROADMAP.md`).
It connects dimensional analysis and consistency checks with deeper questions about the limits of our current theories.

**Exception — Hawking Temperature**

The Hawking temperature is included despite extending beyond the usual domains of GR and quantum mechanics individually. 
It provides a well-established theoretical bridge between quantum field theory in curved spacetime, 
gravitational geometry, black hole thermodynamics, and imaginary-time periodicity. 
It is not a theory of quantum gravity, but an example of how established frameworks intersect without introducing additional theoretical assumptions.


See [`ROADMAP.md`] for the scope and implementation plan.
