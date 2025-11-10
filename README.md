# Valorant Manager


### Run as Administrator
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 

This is a Valorant manager game to simulate the Valorant Champions Tour (VCT). It will be a website that can be played on desktop or mobile. The user will manage a organization/team in one of the 4 VCT international regions: Americas, EMEA, Pacific and China.

Each region will have its own international league to qualify for global Masters and Champions tournaments.

Each region has 12 teams. Each team has 5 players.

The positions are: Duelist, Initiator, Controller, Sentinel and Flex. A player can only have one role at a time, but they can switch roles.

International leagues start with a Kickoff tournament, then have 2 stages. In stage 1, the 12 teams are divided into 2 groups of 6 teams. Each team plays each other 1 time for a total of 5 matches. The top 4 teams of each group qualifies for playoffs. Win loss record is the first tie breaker. Then the second tie breaker is map differential. The third tie breaker is round differential. Fourth tie breaker is head to head record. Each match is a best of 3 maps. A map is a simulated game of Valorant where the object of the game is to be the first team to win 13 rounds. However, you must win by 2 rounds, so there can be overtime rounds.

Playoffs is a tournament. 4th place in each group starts in the lower bracket and is single elimination. 1st place in each group gets a first round bye to the second round of the upper bracket. 2nd and 3rd place start in the first round of the upper bracket which is double elimination because if you lose in the upper bracket, you go down to the lower bracket. The top 2 teams in the playoff tournament qualify for Masters Toronto.

Stage 2 and Champions tournament works a similar way but I will clarify that later.

Maps are simulated based on player stats. Some stats players can have are: Mechanics, IGL, Mental, Clutch, Vibes, Lurking, Entry, Support, Stamina.

Players will have salaries and contracts. User can sign free agents or trade with other teams for their players. Players can have synergy bonuses with certain players. Can also have anti-synergy with certain players. Players gravitate towards a role that boosts their stats. When slotted in an off role, their stats might be lowered.

Teams will have coaches, assistant coaches and performance coaches that can affect player stats.

The maps that games are played on are like Ascent, Split, Haven etc.. Coaches alternate with ban/veto maps and then pick which ones they want to play. Players will have their stats adjusted based on the map. Teams can scrim during the week and focus on specific maps to increase their stats for those maps. Players will get their stats adjusted based on the map. Players will also get their stats adjusted based on the agent they are playing. Teams can scrim during the week and focus on specific maps to increase their stats for those maps. Player stats for a map will go down slightly if they are rusty and haven't practiced or scrimmed on a map recently.

The scope of the game will be as long as the user wants but the average player will simulate about 10 years. Every year, new free agents will join the game at age 18. Before 18, they are prospects playing in Tier 2. An organization can have an academy team in Tier 2 to develop the talent of their prospects.


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
