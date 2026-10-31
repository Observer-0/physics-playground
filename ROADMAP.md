# Roadmap: Open Questions

**Status: October 31, 2026.** Section 2 (structure), Question 1 (Why exactly 1/4?) and Question 3 (information paradox) are implemented; Questions 2 and 4 and the overview of requirements are planned.

Add a new section, **Open Questions**, exploring where general relativity (GR) and quantum theory reach their limits or leave important questions unanswered.

The goal is simple: show what we know, what we assume, and what remains open. All numerical results must come from the existing physics engine.

## 1. Rules

Existing README and CHANGELOG conventions remain in force:

* Experiments are pure data in `src/data/experiments.js`.
* All text uses `{ de, en }`. Existing language tests must pass.
* The UI never calculates physics formulas. All numerical results come from the engine.
* Clearly distinguish mathematical results, models, approximations, measurements, and assumptions.

**Scope restriction:** Use only GR, quantum mechanics, quantum field theory (including semiclassical gravity), thermodynamics, statistical mechanics, and experimental evidence.

No quantum-gravity candidates or extensions of quantum mechanics. No references to them in explanations, footnotes, or sources.

If something is unresolved, say **open**. No speculative solutions.

One separate decision remains: Foundations Section 10 already mentions string theory and loop quantum gravity. The new section will not link to that passage. Whether the existing text stays is a separate question.

## 2. Structure

### Navigation

Add `open` to `U.FIELDS`, with its own icon and color. Place it between Foundations and Tools.

Keep existing color semantics:

* Orange: main result.
* Red: warning.
* Cyan: connection.
* Green: consistent result.

### Pages

Create one overview page and one page per question.

Follow the existing Foundations layout, reusing `sectionPage`, `foldDeep`, and `charBar` from `src/ui/theory.js`. Generalize the existing pattern where practical instead of duplicating it.

Each question page follows the same structure:

1. **The question**
2. **What is established**
3. **What remains open**
4. **What would settle it**
5. **Live in the app**

Each page also gets a status: **Open**, **Partially understood**, or **Semiclassically resolved**.

Status describes the overall question; epistemic tags describe individual claims. Don't confuse the two.

### Existing connections

| Existing content       | Open question                    |
| ---------------------- | -------------------------------- |
| Hawking temperature    | Information paradox              |
| Black hole entropy     | Why 1/4?                         |
| Field equations and Λ  | Cosmological constant problem    |
| Foundations Section 8  | Measurement problem              |
| Foundations Section 10 | Requirements for quantum gravity |

## 3. Question 1: Why Exactly 1/4?

**Question:** Where does the factor of 1/4 in

$$
S_{\mathrm{BH}}=\frac{k_B A}{4l_P^2}
$$

come from, and what does this entropy count?

### Established

For a Schwarzschild black hole,

$$
T_H=\frac{\hbar c^3}{8\pi GMk_B},
\qquad
A=\frac{16\pi G^2M^2}{c^4}.
$$

Combining Hawking's temperature with the first law,

$$
dE=T_H\,dS,\qquad dE=c^2dM,
$$

fixes the coefficient at \(1/4\).

The Euclidean path-integral approach (Gibbons and Hawking, 1977) and Wald's Noether-charge derivation (1993) provide independent semiclassical results.

The factor is not arbitrary within this framework. However, the numerical identity \(8\pi=4\times2\pi\) is not, by itself, an explanation of its physical origin.

### Open

The microscopic interpretation of black hole entropy: **which states does it count?**

The coefficient is fixed by semiclassical consistency; the microscopic explanation remains open.

### Live experiment

Add a free coefficient \(\eta\):

$$
S_\eta=\eta\frac{k_B A}{l_P^2}.
$$

The engine calculates the consistency ratio

$$
R_\eta=\frac{T_H}{c^2}\frac{dS_\eta}{dM}=4\eta.
$$

Presets: \(\eta=1/4,\;1/2,\;1\).

* \(1/4\) produces a ratio of 1.
* \(1/2\) produces a ratio of 2.
* Only \(1/4\) satisfies the first law under the stated assumptions.

The formula belongs in the experiment data, not the UI.

Include Bekenstein's 1973 estimate as an additional preset only after verifying its exact value against the original paper.

**Status:** Partially understood.

**Implemented (October 31, 2026):** experiment `bh-eta` (presets 1/4, 1/2, 1 and 1/4 at M87* mass; R_η is computed from T_H and dS_η/dM, not from 4η), page `#view=offen&sec=quarter`, sources (Bekenstein 1973, Hawking 1975, Gibbons–Hawking 1977, Wald 1993, Bombelli et al. 1986, Srednicki 1993, Hawking 1971, Isi et al. 2021, GW250114 2025). Still open: the Bekenstein 1973 preset (value not yet verified against the paper).

**Tests:** Verify the expected ratios and dimensional consistency.

## 4. Question 2: Why Is the Cosmological Constant So Small?

**Question:** Why is the observed vacuum energy density so much smaller than estimates of quantum-field contributions?

### Established

The Planck 2018 ΛCDM value is approximately

$$
\Lambda\approx1.1\times10^{-52}\,\mathrm{m}^{-2}.
$$

It corresponds to

$$
\rho_\Lambda c^2=\frac{\Lambda c^4}{8\pi G}
\approx5\times10^{-10}\,\mathrm{J/m^3},
$$

with an associated energy scale of roughly \(2\,\mathrm{meV}\).

The quoted Λ value is model-dependent.

### The actual problem

The famous discrepancy of approximately 120 orders of magnitude comes from comparing the observed vacuum energy with a particular zero-point energy estimate using the Planck energy as a cutoff:

$$
\rho_{\mathrm{vac}}\sim\frac{E_c^4}{(\hbar c)^3}.
$$

It is **not a unique prediction of quantum field theory**.

Using a cutoff of \(1\,\mathrm{TeV}\) gives a discrepancy of roughly 59 orders of magnitude. The exact result depends on the cutoff and numerical conventions.

The deeper problem remains: why is the observed cosmological constant so small compared with the contributions estimated from known quantum fields?

### Live experiment

Add a logarithmic slider for \(E_c\), ranging from the meV scale to the Planck energy.

The engine calculates:

* The estimated vacuum energy density.
* The observed density derived from Λ in the constants registry.
* Their dimensionless ratio and its base-10 logarithm.

Presets: Λ energy scale, electron mass, 1 TeV, Planck energy.

Mark the cutoff as an **assumption** and the vacuum energy calculation as an **estimate**. Any numerical prefactor, such as \(1/(16\pi^2)\), must be documented.

**Status:** Open.

**Tests:** Planck-scale ratio between \(10^{120}\) and \(10^{124}\); ratio near 1 at the Λ energy scale; dimensionless output.

## 5. Question 3: The Information Paradox

**Question:** Is information lost when a black hole completely evaporates?

### Established

Hawking's semiclassical calculation predicts thermal radiation.

The paradox arises when a pure initial state, complete evaporation, no remaining information-bearing system, and the original thermal-radiation result are combined. The resulting mixed state conflicts with unitary evolution.

Under unitarity, the expected radiation entropy follows a Page curve: it rises, reaches a maximum, then falls toward zero.

Semiclassical calculations since 2019 have reproduced Page-curve behavior in specific theoretical settings. This is not an experimental observation of an astrophysical black hole's complete evaporation.

**The physical mechanism remains open.**

### Live experiment

Plot normalized time \(t/t_{\mathrm{evap}}\), using `tev` from the existing Hawking experiment. Keep its rough-estimate warning visible.

Use the simplified model:

$$
S_{\mathrm{BH}}(t)=S_0
\left(1-\frac{t}{t_{\mathrm{evap}}}\right)^{2/3},
$$

$$
S_{\mathrm{rad}}=S_0-S_{\mathrm{BH}},
$$

$$
S_{\mathrm{Page}}=\min(S_{\mathrm{rad}},S_{\mathrm{BH}}).
$$

The Page curve is illustrative, not a universal formula. Label the entropy balance as an approximation.

The engine calculates the intersection:

$$
t_{\mathrm{Page}}
=\left(1-2^{-3/2}\right)t_{\mathrm{evap}}
\approx0.6464\,t_{\mathrm{evap}}.
$$

Label each curve as a semiclassical calculation, an expectation under unitarity, or behavior reproduced in specific theoretical calculations.

**Status:** Open.

**Implemented (October 31, 2026):** experiment `bh-page` with τ = t/t_evap as a slider and "Let time run" (the hole evaporates in 10 s; t_evap is the same rough estimate as in the Hawking experiment, its note stays visible), page `#view=offen&sec=info`. Beyond the roadmap, the entropy balance has a factor β: S_rad = β (S₀ − S_BH). β = 1 is the simplified model above (t_Page ≈ 0.6464 t_evap); β ≈ 1.4847 is Page's value for photons and gravitons (2013), for which the engine's t_Page = 1 − (β/(1 + β))^{3/2} gives his 53.81 %. Sources: Hawking 1975 and 1976, Page 1993 (two papers) and 2013, Almheiri et al. 2020 (semiclassical Page curve in a two-dimensional model), Steinhauer 2016 (analogue experiment, explicitly not a test of the paradox).

## 6. Question 4: The Measurement Problem

**Question:** Why does a measurement produce a definite result when the Schrödinger equation evolves superpositions linearly?

### Established

The Born rule agrees with experimental results within the tested domains.

Decoherence suppresses observable interference through interactions with the environment. It explains why interference becomes inaccessible in many situations, but does not by itself explain why a particular outcome occurs.

Molecular interference has been demonstrated with molecules exceeding 25,000 atomic mass units (2019). No universal experimental boundary for quantum superpositions has been established.

### Open

What constitutes a measurement, and why does a particular outcome occur?

### Implementation

Primarily a text page with a comparison table:

* What quantum theory predicts.
* What experiments establish.
* What remains open.

An optional widget may illustrate interference visibility as environmental coupling increases. Label it as a model.

Keep existing interpretations in Foundations Section 8. Do not introduce modifications of quantum mechanics.

Link to Section 10: **What geometry does a superposition have?**

**Status:** Open.

## 7. Overview: Requirements for Quantum Gravity

This page lists requirements without evaluating or ranking candidate theories.

Each item links to relevant content already in the app.

1. **Recover GR:** Reproduce general relativity at low energies and small curvature.
2. **Recover QFT:** Reproduce quantum field theory in approximately flat spacetime.
3. **Remain predictive at the Planck scale:** The gravitational coupling \(\alpha_G\sim(E/E_P)^2\) becomes order unity.
4. **Explain black hole entropy:** Account for \(S_{\mathrm{BH}}=k_B A/(4l_P^2)\), including the factor of 1/4.
5. **Address unitarity:** Resolve the information paradox.
6. **Address singularities:** Explain the limits of the classical descriptions of the Big Bang and black hole interiors.
7. **Address the problem of time:** See Foundations Section 10.
8. **Respect experimental constraints:**

   * GRB 090510: constrain specific models of linear energy-dependent photon propagation; the bound is model-dependent and does not mean photons above the Planck energy were directly tested.
   * MICROSCOPE: tests the universality of free fall to approximately \(10^{-15}\) in terms of the Eötvös parameter.
   * GW170817: constrains the difference between gravitational-wave and light propagation speeds to approximately the \(10^{-15}\) level.
9. **Be testable:** For example, experiments investigating whether gravitational interactions can entangle two masses. This is a proposed test, not an established experimental result.

Verify numerical bounds against the original publications before implementation.

**Related open question:** Must a theory of quantum gravity explain the observed cosmological constant? This remains undecided and should not be presented as a settled requirement.

## 8. Technical Implementation

* **Pages:** Reuse and generalize components from `src/ui/theory.js`.
* **Experiments:** Keep definitions in `src/data/experiments.js`; use `aux` for helper quantities, `why` and `on` for model limitations, and `graph.view` for default ranges.
* **Formula cards:** Consider reusing the intersection block from `src/ui/crossroads.js` for formulas such as \(\rho_\Lambda=\Lambda c^2/(8\pi G)\).
* **Tests:** Add numerical tests to `tests/tests.js` and page checks to `scripts/check-ui.js`.
* **Sources:** Verify DOIs through Crossref and check numerical claims against original publications.

Initial sources: Bekenstein (1973), Hawking (1975), Gibbons and Hawking (1977), Page (1993), Wald (1993), Planck (2018), Fermi/GRB 090510, LIGO/Virgo/GW170817, the 2019 molecular-interference experiment, MICROSCOPE's final results, and relevant semiclassical Page-curve calculations.

No sources about excluded candidate theories or modifications of quantum mechanics.

## 9. Smaller UI Issues

These are separate from the new section:

- The Hawking block is too tall on mobile.
- The *Formula & Variables* and *Physics & Limitations* tabs use a text width of up to 760 px. Preserve alignment with the tab bar when adjusting the layout.
- The test page is a long, single-column list and could use better navigation.
- Smaller Changes in Design planned.
- Small fixes in Translations and wording.


---

## Guiding Principle

**A correct calculation is not automatically a complete physical explanation.**

Show what is established, expose the assumptions, label approximations, and leave unresolved questions unresolved.

No artificial certainty. No speculative answers. Just physics, numbers, and honest limits.
