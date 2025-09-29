#!/usr/bin/env node
/**
 * Siderun CLI (MVP)
 * - init: writes example config
 * - run: runs a named job from config
 * - status: prints last run status
 *
 * The module exports the Commander program instance to enable testing without executing commands.
 */
import { Command } from 'commander';
import { bold, green, yellow, red, dim } from 'colorette';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

interface SiderunConfig {
  jobs: Record<string, { steps: Array<{ name: string; command: string }> }>;
}

interface InitOptions { force?: boolean }
interface RunOptions { config: string; job: string }

const program = new Command();
program
  .name('siderun')
  .description('Lightweight, reproducible runner for local/CI jobs (MVP)')
  .version('0.1.0');

program
  .command('init')
  .description('Create an example siderun.config.json')
  .option('-f, --force', 'overwrite existing config', false)
  .action((opts: InitOptions) => {
    const configPath = resolve(process.cwd(), 'siderun.config.json');
    if (existsSync(configPath) && !opts.force) {
      console.log(yellow('A config already exists. Use --force to overwrite.'));
      process.exit(0);
    }
    const example: SiderunConfig = {
      jobs: {
        demo: {
          steps: [
            { name: 'echo hello', command: 'node -e "console.log(\'hello\')"' },
            { name: 'sleep', command: 'node -e "setTimeout(()=>console.log(\'done\'),200)"' }
          ]
        }
      }
    };
    writeFileSync(configPath, JSON.stringify(example, null, 2));
    console.log(green(`Wrote ${configPath}`));
  });

program
  .command('run')
  .description('Run a job from config')
  .option('-c, --config <path>', 'path to config', 'siderun.config.json')
  .option('-j, --job <name>', 'job name', 'demo')
  .action(async (opts: RunOptions) => {
    const cfgFile = resolve(process.cwd(), opts.config);
    if (!existsSync(cfgFile)) {
      console.error(red(`Config not found: ${cfgFile}`));
      process.exit(1);
    }
    const cfg: SiderunConfig = JSON.parse(readFileSync(cfgFile, 'utf8'));
    const job = cfg.jobs?.[opts.job];
    if (!job) {
      console.error(red(`Job not found: ${opts.job}`));
      process.exit(1);
    }
    console.log(bold(`Running job: ${opts.job}`));

    const { spawn } = await import('node:child_process');
    let failed = false;
    for (const step of job.steps) {
      console.log(dim(`→ ${step.name}`));
      const child = spawn(step.command, {
        shell: true,
        stdio: 'inherit'
      });
      const code: number = await new Promise((res) => child.on('close', res));
      if (code !== 0) {
        console.error(red(`Step failed (${code}): ${step.name}`));
        failed = true;
        break;
      }
    }

    // write simple status cache
    try {
      const cacheDir = resolve(process.cwd(), '.siderun');
      if (!existsSync(cacheDir)) mkdirSync(cacheDir);
      writeFileSync(resolve(cacheDir, 'status.json'), JSON.stringify({ job: opts.job, failed }, null, 2));
    } catch {}

    process.exit(failed ? 1 : 0);
  });

program
  .command('status')
  .description('Show last run status')
  .action(() => {
    const statusPath = resolve(process.cwd(), '.siderun/status.json');
    if (!existsSync(statusPath)) {
      console.log(yellow('No status found. Run a job first.'));
      return;
    }
    const status = readFileSync(statusPath, 'utf8');
    console.log(status);
  });

export { program };

// Execute only when run directly via Node, not when imported for tests
const runDirect = () => import('node:url').then(({ pathToFileURL }) => {
  const entry = process.argv[1];
  if (entry && import.meta.url === String(pathToFileURL(entry))) {
    program.parse();
  }
});

// Top-level await not guaranteed depending on target; use promise
void runDirect();
