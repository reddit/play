# ![:play](src/ui/assets/favicon/favicon48.png) :play <!-- #strings:title# -->

Devvit app :playground.<!-- #strings:description# -->

## Installation

```bash
npm install --save-prefix= @devvit/play
```

See the [changelog](docs/changelog.md) for release notes.

### Usage

Import play in your JavaScript bundle to define the `play-pen` element:

```ts
import '@devvit/play/pen'
```

Add a pen to your HTML markup:

```html
<play-pen>
  <script type="application/devvit">
    import {Devvit} from '@devvit/public-api'

    Devvit.addCustomPostType({
      name: 'Say Hello',
      render: () => <text>Hello!</text>
    })

    export default Devvit
  </script>
</play-pen>
```

### Artifacts

Published releases include:

- **play-.\*.html**: portable playground.
- **play-pen.js**: `play-pen` element.
- **index.js**: library utilities.

## Development

```bash
npm install
npm start
```

Visit **[http://localhost:1234](http://localhost:1234)** in your web browser.
Run `npm test` to execute tests.

See [supplemental development notes](docs/development.md).

### NPM scripts

- `install`: install play dependencies.
- `start`: run development server.
- `test`: build play and execute all tests. Anything that can be validated
  automatically before publishing runs through this command.
- `run test:unit`: run the unit tests. Pass `--update` to update all test
  snapshots.
- `run format`: apply lint fixes automatically where available.
- `run build`: compile source inputs to artifacts under `dist/`.

💡 Add `--` to pass arguments to the script command. For example,
`npm run test:unit -- --update` to update snapshots.

### Project Structure

- **docs**/: supplemental play documentation.
- **src**/: source inputs.
- **tools**/: development tools for building :play.

### Tagging

Coupling that is difficult to express with tooling is tagged as helpful. Eg,
`#strings:description#` or `#version#`. This makes it easier to see all the
places a cross-cutting concern touches with a grep. Eg, `rg '#theme#'`. See all
tags used with `rg '#[a-z0-9:-]+#'`.

### Contribution Guidelines and Design Principles

- Make it fun. play must be fun to use and fun to develop. Speed and quality are
  play's top two features.
- Avoid dependencies. Dependencies are high-cost integrations. Simply don't add
  them.
- Avoid code. Lines of code are costly. We probably can't afford your code if
  you write a lot of it.
- Open-source for everyone. This repo was started with the intention to be
  open-sourced as soon as possible.
  - All dependencies must be available publicly. Avoid closed-source Reddit
    dependencies.
  - Avoid Reddit-specific branding.
- Code should be written to be read. We value good context. This often means
  including short inline or accompanying docs.
- Keep the interface and outputs plain and simple. play is only a tool. The
  user's focus is their work.
- Every commit should be an overall improvement. If every commit is an
  improvement, the code only gets better.
- Smaller patches get better reviews.

## [License (BSD-3-Clause)](docs/license.md)
