# Integrated Math 2

Use the repository root for dependency installation. Do not install dependencies without project approval.

## Local setup

Run these commands from `apps/integrated-math-2`.

1. Create the app-local anonymous Convex deployment.

   ```sh
   CONVEX_AGENT_MODE=anonymous npx --no-install convex dev --once --local-cloud-port 3222 --local-site-port 3223
   ```

2. Add local server credentials to `.dev.vars`. This command reads only this app's local Convex configuration. It does not print credentials. It preserves existing values.

   ```sh
   node --input-type=module <<'JS'
   import {readFileSync,writeFileSync,chmodSync} from 'node:fs';
   import {randomBytes} from 'node:crypto';
   import {parse} from 'dotenv';
   const env=parse(readFileSync('.env.local','utf8'));
   let text='';
   try { text=readFileSync('.dev.vars','utf8'); } catch {}
   const runtime=parse(text);
   if(!env.CONVEX_DEPLOYMENT?.startsWith('anonymous:'))throw Error('Expected an app-local anonymous deployment.');
   const config=JSON.parse(readFileSync('.convex/local/default/config.json','utf8'));
   if(!runtime.AUTH_JWT_SECRET)text+='\nAUTH_JWT_SECRET='+randomBytes(48).toString('base64url')+'\n';
   if(!runtime.CONVEX_DEPLOY_KEY)text+='\nCONVEX_DEPLOY_KEY='+config.adminKey+'\n';
   if(!runtime.NEXT_PUBLIC_CONVEX_URL)text+='\nNEXT_PUBLIC_CONVEX_URL='+env.NEXT_PUBLIC_CONVEX_URL+'\n';
   writeFileSync('.dev.vars',text);
   chmodSync('.dev.vars',0o600);
   JS
   ```

The Cloudflare local runtime reads `.dev.vars`. Keep server credentials out of `.env.local`, because the Convex CLI treats `CONVEX_DEPLOY_KEY` there as a remote deployment selector. Both files are ignored by Git.

3. Start the stack.

   ```sh
   npm run dev:stack
   ```

The frontend uses port 3002. Convex uses ports 3222 and 3223. The stack rejects a remote deployment selection. Startup fails if the frontend port is in use. Do not stop another app to free a port.

4. In another terminal, seed the lesson drafts.

   ```sh
   CONVEX_AGENT_MODE=anonymous npx --no-install convex run seed:seedAll '{}'
   ```

Lesson drafts use the 96 Markdown sources and `curriculum/questions.json`. Run `npm run curriculum:build` after a source edit. A build fails if `curriculum/lessons.json` is stale.

The internal `publication:publishLesson` mutation validates a selected version before publication. Publication archives an older published version. It preserves its student evidence. Content review is still required. Do not use schema validation as proof of mathematical correctness.

## Verification

```sh
npm run lint
npm run typecheck
npm run typecheck:backend
npm test
npm run build
```

## Deployment

Set `NEXT_PUBLIC_CONVEX_URL` to the intended HTTPS Convex URL before the frontend build. Set the same URL in the Cloudflare runtime. Configure `CONVEX_DEPLOY_KEY` and `AUTH_JWT_SECRET` as deployment secrets. Do not copy local credentials or localhost URLs into production.

Production deployment requires a separate target check and authorization. The correction track records open content, calendar, and knowledge graph work in `measure/tracks/im2-complete-review_20260907/fix-plan.md` at the repository root.
