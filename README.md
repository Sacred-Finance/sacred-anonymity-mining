# dApp Starter Boilerplate

A dApp starter kit template to quick start a dapp project with Next.js + Tailwind CSS + Ethers + wagmi + RainbowKit.

Other tools/components included: Headless UI, Heroicons, Autoprefixer, Sass, PostCSS, ESLint, Prettier.

Live preview for this repo: https://dapp-starter.aris.ac

## Getting Started

```bash
# Install Dependencies
yarn

# Run the development server
yarn dev
```

### ENV

```bash
# Copy ENV File
cp .env.example .env.local
```

### Configs

- `src/appConfig.ts`: app name, title, SEO etc.
- `src/pages/_app.tsx`: chains, providers, wallet connectors

### Scripts

**Next.js**

```bash
# Build
yarn build

# Start server with build files
yarn start
```

**Prettier**

```bash
# Use Prettier to do Format Check for files under ./src
yarn fc

# Use Prettier to do Format Fix for files under ./src
yarn ff
```

**Contract Types**

```bash
# Generate contract types from src/contracts/*.json
yarn compile-contract-types
```

### Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com/), by the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## More

Learn about components of this kit is using:

- [Next.js](https://nextjs.org/) - React Framework by Vercel
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS Framework
- [Ethers.js](https://github.com/ethers-io/ethers.js/) - Compact library for interacting with Ethereum.
- [wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [RainbowKit](https://rainbowkit.com/) - React library for wallet connections with dApp.
- [Headless UI](https://headlessui.dev/) - Unstyled, fully accessible UI components

## License

This app is open-source and licensed under the MIT license. For more details, check the [License file](LICENSE).
# sacred-community-client-nextjs

# User Acceptance Testing (UAT) Form

## 1. General Features
- [ ] Interaction with Smart Contract
- [ ] Updates and Changes to Smart Contract
- [ ] Immediate Updates to UI
- [ ] Caching Mechanism
- [ ] Loading and Blocking Animations
- [ ] Passing Visual Aesthetics
- [ ] Error and Exception Handling
- [ ] Security and Privacy
- [ ] Responsiveness on Different Devices
- [ ] Accessibility Compliance (Screen Readers, Keyboard Navigation, etc.)

## 2. Voting Features
- [ ] Voting on Posts
- [ ] Voting on Comments
- [ ] Voting Loading Animation
- [ ] Unvoting or Changing Vote

## 3. Comment Features
- [ ] Creating Comments
- [ ] Editing a Comment
- [ ] Deleting a Comment
- [ ] Comment Loading Animation
- [ ] Replying to a Comment - tbd

## 4. Post Features
- [ ] Creating Posts
- [ ] Editing a Post
- [ ] Deleting a Post
- [ ] Post Loading Animation
- [ ] Preview Post Before Submission

## 5. Community Features
- [ ] Creating a Community
- [ ] Joining a Community
- [ ] Leaving a Community - tbd
- [ ] Editing a Community
- [ ] Deleting a Community - tbd

## 9. Miscellaneous
- [ ] Photo Upload/Download
- [ ] Linking Between Pages
- [ ] URL Routing

Please check the relevant box once you have successfully tested the respective feature.

