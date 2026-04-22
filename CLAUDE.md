11:55:25.126 Running build in Washington, D.C., USA (East) – iad1
11:55:25.127 Build machine configuration: 2 cores, 8 GB
11:55:25.231 Cloning github.com/Artifique/DiarraBa (Branch: main, Commit: 92351ba)
11:55:25.232 Previous build caches not available.
11:55:25.469 Cloning completed: 238.000ms
11:55:25.707 Running "vercel build"
11:55:26.377 Vercel CLI 51.6.1
11:55:26.645 Installing dependencies...
11:55:40.703 
11:55:40.704 added 477 packages in 14s
11:55:40.705 
11:55:40.705 153 packages are looking for funding
11:55:40.705   run `npm fund` for details
11:55:40.766 Detected Next.js version: 16.2.4
11:55:40.771 Running "npm run build"
11:55:40.868 
11:55:40.869 > diarraba-volailles@0.1.0 build
11:55:40.869 > next build
11:55:40.869 
11:55:41.331   Applying modifyConfig from Vercel
11:55:41.335 Attention: Next.js now collects completely anonymous telemetry regarding usage.
11:55:41.336 This information is used to shape Next.js' roadmap and prioritize features.
11:55:41.336 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
11:55:41.336 https://nextjs.org/telemetry
11:55:41.336 
11:55:41.352 ▲ Next.js 16.2.4 (Turbopack)
11:55:41.353 
11:55:41.380   Creating an optimized production build ...
11:55:49.199 ✓ Compiled successfully in 7.5s
11:55:49.205   Running TypeScript ...
11:55:54.270 Failed to type check.
11:55:54.271 
11:55:54.271 ./src/components/layout/sidebar.tsx:95:18
11:55:54.271 Type error: JSX element type 'item.icon' does not have any construct or call signatures.
11:55:54.272 
11:55:54.272   [90m93 |[0m                   <div className=[32m"absolute left-0 top-0 bottom-0 w-1 bg-orange-accent shad...[0m
11:55:54.272   [90m94 |[0m                 )}
11:55:54.272 [31m[1m>[0m [90m95 |[0m                 <item.icon className={cn(
11:55:54.272   [90m   |[0m                  [31m[1m^[0m
11:55:54.272   [90m96 |[0m                   [32m"mr-3 h-5 w-5 transition-colors duration-300"[0m,
11:55:54.272   [90m97 |[0m                   isActive ? [32m"text-orange-accent"[0m : [32m"text-foreground/40 group-hover:text-o...[0m
11:55:54.272   [90m98 |[0m                 )} />
11:55:54.302 Next.js build worker exited with code: 1 and signal: null
11:55:54.336 Error: Command "npm run build" exited with 1