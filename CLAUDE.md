12:02:32.562 Running build in Washington, D.C., USA (East) – iad1
12:02:32.562 Build machine configuration: 2 cores, 8 GB
12:02:32.572 Cloning github.com/Artifique/DiarraBa (Branch: main, Commit: 92351ba)
12:02:32.573 Skipping build cache, deployment was triggered without cache.
12:02:32.826 Cloning completed: 254.000ms
12:02:33.100 Running "vercel build"
12:02:33.851 Vercel CLI 51.6.1
12:02:34.124 Installing dependencies...
12:02:49.644
12:02:49.645 added 477 packages in 15s
12:02:49.645
12:02:49.645 153 packages are looking for funding
12:02:49.645 run `npm fund` for details
12:02:49.714 Detected Next.js version: 16.2.4
12:02:49.719 Running "npm run build"
12:02:49.824
12:02:49.825 > diarraba-volailles@0.1.0 build
12:02:49.825 > next build
12:02:49.825
12:02:50.455 Applying modifyConfig from Vercel
12:02:50.460 Attention: Next.js now collects completely anonymous telemetry regarding usage.
12:02:50.461 This information is used to shape Next.js' roadmap and prioritize features.
12:02:50.462 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
12:02:50.462 https://nextjs.org/telemetry
12:02:50.462
12:02:50.481 ▲ Next.js 16.2.4 (Turbopack)
12:02:50.482
12:02:50.513 Creating an optimized production build ...
12:02:59.653 ✓ Compiled successfully in 8.8s
12:02:59.655 Running TypeScript ...
12:03:05.292 Failed to type check.
12:03:05.293
12:03:05.294 ./src/components/layout/sidebar.tsx:95:18
12:03:05.294 Type error: JSX element type 'item.icon' does not have any construct or call signatures.
12:03:05.294
12:03:05.294 [90m93 |[0m <div className=[32m"absolute left-0 top-0 bottom-0 w-1 bg-orange-accent shad...[0m
12:03:05.294 [90m94 |[0m )}
12:03:05.294 [31m[1m>[0m [90m95 |[0m <item.icon className={cn(
12:03:05.294 [90m |[0m [31m[1m^[0m
12:03:05.294 [90m96 |[0m [32m"mr-3 h-5 w-5 transition-colors duration-300"[0m,
12:03:05.295 [90m97 |[0m isActive ? [32m"text-orange-accent"[0m : [32m"text-foreground/40 group-hover:text-o...[0m
12:03:05.295 [90m98 |[0m )} />
12:03:05.332 Next.js build worker exited with code: 1 and signal: null
12:03:05.370 Error: Command "npm run build" exited with 1
