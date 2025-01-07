# Changelog

:play is [semantically versioned](https://semver.org).

## v0.0.44

- 7d76787 Upgrade zen-fs deps (#41)

## v0.0.42

- 5133c10 Don't require more than Node 20 (#39)

## v0.0.41

- 7194c8a default play to 0.11.x (#38)

## v0.0.40

- 341b6cc upgrade devvit dependencies
- 7237b7f upgrade dependencies
- 7d2e599 upgrade CodeMirror dependencies
- cbe821a fix SVG example
- 231d8a2 Set language and timezone in Metadata (#36)
- 787a6bf update play user agent (#32)
- b34b3cb upgrade dependencies
- 0569bdb Move interdependency RemoteApp
- e5b6674 Play: some improvements towards sourcemaps. (#25)
- d68050b Adds LogStream to the "uses" list in the linker (#31)
- aff219c [DX-7170] Migrate @devvit/protos imports to paths (#30)
- baa9c0d Node v18 -> v22 (#29)

## v0.0.39

- 8882b0b upgrade dependencies
- fcbd274 Fix editor overflow: replace deprecated clip with hidden (#28)
- 47110cc Fix formatter config for polyrepo
- 029fb3a Add products to LinkedBundle.uses
- d1049f4 Upgrade dependencies and add products schema (#24)
- 1cf3949 Add speculative execution flag (#23)
- c1e6228 Update linker to provide new webviewAssets field (#22)
- 9afb695 drop npx from import dialog
- f6961c5 recommend devvit@latest for import

## v0.0.38

## v0.0.37

- b2119c0 0.0.37 (#21)
- a26564f Add asset support to :play (#19)
- 788f519 Adjusts bundler output to work with Node. (#20)
- 55a90fa Use npm.org registry for publishing

## v0.0.36

- e101845 Revert "replace bundle size test dependency (#16)"
- 6ceb08b Logging (#18)
- 87b66e5 Emulate image upload (#14)
- 26d83bb pass meta to fix remote runtime (#17)
- 2d24117 Use UI Request Flag (#15)
- 68f2eac replace bundle size test dependency (#16)
- 242e675 Add some tips on NPM linking (#13)
- 0e6af72 Updates local compute port from :7777 to :7788. (#12)
- b0b1318 [DX-6014] Add sandboxed runtime and runtime logging support (#10)
- c7c0acd Fix layout width calculations (#9)
- 3e48614 Changes generated hostname for compute-go bundles (#8)
- 474a3d2 Upgrade dependencies
- 53e0f0c Support Hello
- 10c5d76 Check uncompressed size
- cc4bbf0 [DX-5796][DX-5797] Support remote execution (#7)
- 32467fc Fix tsbuildinfo paths
- e2bdf3c Fix a couple build issues and add meta
- cf3579c Tidy tsconfig
- d3d0d95 Upgrade dependencies
- 7e1a3a7 Fix versions again
- f9bf568 Fix versions

## v0.0.35

- d01679b Upgrade dependencies
- f551c8a Simplify UI test scaffolding
- ea9fa5f Upgrade dependencies
- 5517834 Update CustomPost and UIEventHandler SerializableServiceDefinitions
- fd778e4 Upgrade dependencies
- b02f29b Remove CI config for Node.js
- 2124c76 Fix type
- 2a5b076 Fix extension issue on Node
- ee3e610 Fix untitled width
- 4aff069 Add CSS reset
- a0d5b2c Document pre-build
- bc614c8 Publish tsconfigs
- 8bddf23 Skip TS lib type-checking
- 15137db Set Node.js version and caching in CI
- f7a71ad Support play-editor tests
- f76916b Remove unused arg
- 225f7b0 Add a play-editor test
- 2ff63f9 Filter out Lit dev mode warnings from tests
- 1d52412 Type-check @web/test-runner config
- 4265da4 Add UI tests for most elements
- 340b1b7 Fix tool config type-checking
- e4d8465 Share esbuild config with UI tests
- 6fbc833 Improve HTML interpolation
- 3d473e5 Rename version global
- 46c24fc Remove extension from build tool
- 0377e4f Rename loader
- 930246b Tweak manifest
- e815577 Fix CI size test
- c3da0cc Upgrade CI workflow and add UI tests
- fbeae9c Scaffold UI testing
- 0439a13 Configure VSCode to use local TS
- 5b9bd25 Remove old # tag
- fbe3ae0 Colocate assets
- 27052a5 Move src/ui/\* up
- 8eb5377 Upgrade dependencies
- 5301fac Upgrade esbuild to v0.20.1

## v0.0.34

- 5f64e8e Upgrade dependencies

## v0.0.33

- 98d3cf5 Fix reset
- 5307109 Normalize repository URL

## v0.0.32

- 5f3fc92 Upgrade dependencies
- 3ad1e51 [DX-5712] Upgrade to Devvit 0.10.15-next-2024-02-01-b904edfe7.0
- f5e4a1f Revert "[DX-5712] Upgrade to Devvit 0.10.15-next"
- 1d7e631 [DX-5712] Upgrade to Devvit 0.10.15-next

## v0.0.31

- 298752f Upgrade dependencies

## v0.0.30

- 871e6b2 Fix type in example

## v0.0.29

- ddbd98a Upgrade dependencies
- 412a62c Move license to root for GitHub detection
- e750371 Extract vitest config
- ad0835d Fix lint
- 0e703a9 Enable Lit development mode
- a4d84ec Move typing to Bubble calls
- ad2fc40 Omit redundant globalThis usages
- e2cbb8b Format HTML tagged template literals
- 298e2db Test missing component imports
- 8b01bfe Fix event types
- f404854 Add SVG example

## v0.0.28

- 76a0e57 Upgrade dependencies

## v0.0.27

- 9e1bacb Match Devvit engine and upgrade dependencies
- 42a513a Replace @fires JSDocs with HTMLElementEventMap

## v0.0.26

- 917ef4a Upgrade dependencies

## v0.0.25

- 163e62b Export Devvit version
- 0419098 Add some missed typing
- c79aa52 Upgrade dependencies

## v0.0.24

- c231ac3 [DX-4389] Improve polls example dark mode contrast
- 85dd5e1 Upgrade dependencies
- 62bbbe9 Update description
- 58e1128 [DX-4321] Don't throttle completion UI

## v0.0.23

- 83d54aa Fix examples link

## v0.0.22

- 62cd273 Upgrade dependencies
- d554bba [DX-4154] Update manifest theme colors
- 71128f8 Updated the Toast appearance and positioning (#5)
- b863c8b Social preview asset update (#4)

## v0.0.21

- 71967c1 Upgrade dependencies
- d25c6f4 Export dialog styling (#3)
- bbb0846 Add social banner
- 8b6c4e6 Rearranged the header buttons and adjusted their icons (#2)

## v0.0.20

- 94687c7 Upgrade dependencies
- 2555125 Fix references to devvit-play
- fc07d1a Remove Drone
- 560ae62 Add GitHub Actions (#1)

## v0.0.19

83b1b4b [DX-4144] Fix dark mode cursor color

## v0.0.18

- bb907cc [DX-4144] Add primitive editor dark mode
- e19a511 [DX-4144] Add primitive dark mode for non-editor UI
- bb45d07 Upgrade dependencies
- e919627 Fix export copy button width
- 5b7ec05 Tweak CircuitBreakerError messaging further
- 2814fc8 Improve CircuitBreakerError messaging
- 60e4da4 Hide pen terminology
- 573adc9 [DX-4144] Fix preview load to use palette
- bf54fd4 [DX-4144] Extract palette
- cc8872c [DX-4144] Extract pen CSS variables
- a641dc7 [DX-4144] Extract editor state from component
- 2c62ae8 Switch to fixed dimensions for templates and height tall to polls
  (#32)
- da4534d Upgrade dependencies
- 84a1290 Fix passing template by slot
- 52bf444 Fix header button gaps

## v0.0.17

- b9a3bba Upgrade dependencies
- a4d8b43 [DX-4146] Update examples link
- 4271509 Fix type-check tips
- 0e8699f Fix line numbers
- 0259937 [DX-4077] Restore share button
- 09fdbb7 Fix property
- c6cc954 Fix attribute type
- ee901c3 [DX-4174] Add export
- 800613a Add missed super call
- af2ab4c Don't record hash changes in browsing history
- abdecc7 [DX-4186] Re-enable CodeMirror search

## v0.0.16

Fix default build product

## v0.0.15

Add package main + type

## v0.0.14

- 2517f80 Remove tags
- dfe8dee Upgrade dependencies
- d5eff08 Fix default export types

## v0.0.13

- ee4be05 Add publish prompts
- a3b1ac9 Upgrade dependencies
- 4babb48 Tidy PropertyValues type
- ca5cd8f [DX-4174] Expose PenSave and version
- 381fc3b Add missed @slot
- ed72635 Simplify defines
- b68a460 Add @slot docs
- 39b4cb6 Tweak examples

## v0.0.12

- 51aff9b Upgrade dependencies
- e4ce8bb [DX-4077] Remove share and always save to URL (#31)
- 34378ee Fix compilation target
- f68dcfc Fix type complaint
- d6dd6e1 Add nonempty default example
- 2d55459 Upgrade dependencies

## v0.0.11

Fix color scheme.

## v0.0.10 (invalid)

## v0.0.9

- Add forms and fix light mode emulation (#27)
- Update templates (#25)
- Colocate preview controls (#28)
- Reduce button sizes in header and footer

## v0.0.8

- Add example templates (#21)
- Add dropdown menus (#17)
- Report unhandled rejections
- Report compilation errors
- Link line numbers
- Clear name when applying template.
- Check component typing (#23)
- Improve dark mode editor highlight color
- Improve debuggability
- Fix strict mode

## v0.0.7

Add template select.

## v0.0.6

- Leaning into the duck branding
- Add console
- Copy to clipboard on share
- Change theme icon based on current theme
- Make title consistent
- Make the footer less prominent
- Disable editor search and enable tab indent
- Drop context library
- Bugfix: selection color
- Bugfix: Pixelated favicon on high density/retina display
- Bugfix: Title input width not constrained (#10)
- Don't publish tsconfig.\* intermediates

## v0.0.5

- Fix viewport height.
- Fix Drone registry config.

## v0.0.4

Fix play-pen styles.

## v0.0.3

Fix URL loading.

## v0.0.2

- Overhaul UI.
- Support save / load.
- Support color schemes.
- Fix type-check bugs.

## v0.0.1

Initial release.
