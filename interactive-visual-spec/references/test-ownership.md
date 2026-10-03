# Test ownership and CI

Part of the [canonical interactive visual specification](../SKILL.md): which repository owns which test, and how CI layers. Sections 26 to 37, in the specification's own wording and numbering. Two parts are local additions, not the specification's wording: the section "Where the layers live", and the ownership-rule sentence in "Why three layers", which names the homes that section maps. Nothing else is weakened or added; where a skill disagrees, this text governs.

## Where the layers live

The three layers stay separate, but the first two now share one repository. yujieteo/visuals is a monorepo: one folder `viz/<slug>/` per public visual, replacing one repository per visual, and the technical E2E checks moved in from the archived yujieteo/technical-e2e. Read "visual/source repo" and "technical E2E repo" below as these homes:

| Layer | Home |
|---|---|
| Model and page (§27) | `viz/<slug>/tests/` in yujieteo/visuals, run by `python3 scripts/check.py <slug>` in the visual's own CI job |
| Technical browser E2E (§28, §29, §35) | `viz/<slug>/e2e/manifest.json` and `full.test.mjs`, driven by the shared harness `e2e/` of yujieteo/visuals in CI jobs of their own (one per browser project), pointed at the staged artifact with no site build; the two visuals the site keeps itself have their checks in `e2e/site/<slug>/` there |
| Website integration (§30) | yujieteo/site, its own tests and its pre-deploy and post-deploy checks |

So §28's "its own repository" is met by its own folder and its own CI jobs: no model test reads `e2e/`, and the site copies neither.

## 26. Repository Architecture

There are three different responsibilities and they MUST remain separate.

```text
visual/source repo
technical E2E repo
site repo
```

Their tests must not be conflated.

## 27. Visual / Source Repository

The visual source repository owns:

```text
visual source
generation/build scripts
shared design tokens
domain fixtures
unit tests
model tests
derivation tests
schema tests
deterministic-generation tests
static validation
artifact verification
```

It may verify properties such as:

```text
output is deterministic
required metadata exists
no forbidden external URLs exist
schemas are valid
known examples compute correctly
generated artifact matches source
```

It MUST NOT become the home of full browser-level technical E2E testing.

## 28. Technical E2E Repository

Technical browser E2E testing MUST live in its own repository.

This repository tests the visual artifacts themselves as software.

Conceptually:

```text
visual source repo
      ↓
generated HTML
      ↓
technical-e2e repo
      ↓
real browsers
```

The technical E2E repository owns tests such as:

```text
visual opens successfully
no runtime JavaScript error
no unexpected network requests
file:// execution works
iframe execution works
controls manipulate state
derived values update
URL fragments restore state
Back/Forward works
keyboard navigation works
Cmd/Ctrl+K works
touch-equivalent controls exist
localStorage persistence works
Reset works
JSON round-trip works
Markdown export works
Beam MD Switch export works
dark mode works
reduced-motion mode works
320 px viewport works
large viewport works
no horizontal overflow
no-JS fallback exists
```

It should also test canonical examples and semantic invariants.

Example:

```text
given known state S
when action A occurs
then derived state must become T
and visual representation R must agree with T
```

This repository verifies the technical behaviour of the visual independently of teoyujie.org.

It MUST be possible to point the technical test suite directly at an artifact without deploying the whole site.

## 29. Technical Browser Matrix

Technical E2E should cover, as practical:

```text
Chromium
Firefox
WebKit
```

with representative:

```text
desktop
mobile
```

configurations.

Important visual behaviours should not be tested solely through screenshots.

Prefer semantic assertions against application state and meaningful DOM state.

Screenshots may supplement these tests.

## 30. Site Repository

The teoyujie.org site repository owns site-level E2E testing only.

These tests answer:

Does the visual work correctly as a component of the actual website?

They do NOT duplicate the technical test suite.

Site-level tests cover:

```text
/visuals page loads
visual appears in gallery/index
visual metadata is correct
link points to correct route
route returns successfully
canonical URL is correct
site navigation works
back-link returns correctly
iframe/embed integration works where used
site CSS does not break the visual
deployment paths are correct
404 behaviour is correct
production headers do not prevent required behaviour
visual is reachable from the published site
```

Site-level E2E tests MAY perform a small smoke interaction such as:

```text
open visual
click one primary control
confirm application responds
```

but MUST NOT duplicate the detailed behaviour already owned by the technical E2E repository.

## 31. Test Ownership Boundary

The canonical rule is:

```text
Does the mathematics/model work?
        ↓
visual/source repo tests
Does the standalone browser application work?
        ↓
technical E2E repo
Does the deployed site correctly expose and integrate it?
        ↓
site repo E2E
```

Or:

```text
MODEL
  visual repo
BROWSER PRODUCT
  technical E2E repo
WEBSITE INTEGRATION
  site repo
```

This boundary is mandatory.

## 32. No Duplicate E2E Suites

Do not copy the technical E2E suite into the site repository.

Do not copy site-navigation tests into the technical E2E repository.

A behaviour should have one authoritative test owner.

Cross-repository smoke tests are acceptable only to verify the interface between systems.

For example:

```text
technical E2E:
"Cmd+K opens search and selecting an item changes state."
site E2E:
"The deployed visual loads and its primary control responds."
```

The site test should not retest every search behaviour.

## 33. E2E Contract Between Repositories

Visuals should expose stable externally observable behaviour so tests do not depend on fragile implementation details.

Prefer:

```text
semantic roles
accessible names
stable IDs
data-* identifiers
URL state
documented state schema
```

Avoid selectors such as:

```text
div:nth-child(7) > span:nth-child(2)
```

Tests should describe user-visible semantics.

Example:

```text
button: "Reset"
input: "Prior probability"
region: "Posterior"
```

Where a technical identifier is necessary:

```text
data-testid="posterior-probability"
```

should describe a stable concept rather than layout.

## 34. CI Responsibility

The repositories should form a layered verification system.

```text
VISUAL REPO CI
    ↓
unit + model + fixtures
deterministic generation
static artifact verification
    ↓
artifact
TECHNICAL E2E CI
    ↓
browser behaviour
interaction
accessibility smoke checks
offline/file/iframe
responsive behaviour
exports
    ↓
technical acceptance
SITE REPO CI
    ↓
site generation
gallery/index
routing
deployment integration
site-level smoke E2E
    ↓
deployment
```

A failure should make it obvious which layer owns the problem.

## 35. Offline Test

Technical E2E MUST explicitly verify that unexpected network requests are zero.

Conceptually:

```text
load artifact
deny network
exercise primary workflow
assert success
```

A visual accidentally depending upon a CDN or API should fail CI.

## 36. Mathematical Fixtures

Important computations MUST have fixtures independent of DOM rendering.

For example:

```text
Bayesian update
generating-function coefficient
cohomology computation
diagram chase
queue estimate
entropy bound
Fermi estimate
Fourier transform
PDE classification
```

should have known cases.

Where exact answers exist:

```text
computed === expected
```

Where approximation is intrinsic:

```text
abs(computed - expected) < tolerance
```

The browser test should then verify that the interface faithfully represents the computed state.

## 37. Conceptual Invariants

For mathematical tools, test invariants rather than only screenshots.

Examples:

```text
probabilities remain in [0,1]
normalised distributions sum to 1
changing presentation mode does not change mathematical state
export → import preserves semantic state
Back → Forward restores selected concept
diagram and formula indicate the same selected object
changing an irrelevant parameter does not alter unrelated quantities
```

These tests are often more valuable than pixel comparisons.

## Why three layers

The important architectural addition is the three-layer ownership rule: model/source tests in the visual's own folder → standalone browser/technical E2E in its own `e2e/` folder and CI jobs → deployment/integration E2E in the site repo. That prevents the site repository from becoming responsible for the internals of every visual, while still catching failures caused by routing, deployment, gallery generation, iframe policies, or site integration.
