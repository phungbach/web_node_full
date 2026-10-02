import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDirectory = path.join(root, 'build');
const clientDirectory = path.join(root, 'client');
const serverDirectory = path.join(root, 'server');
const serverEnvPath = path.join(serverDirectory, '.env');
const mysqlDefaultsPath = process.env.MYSQL_DUMP_DEFAULTS_FILE || path.join(process.env.HOME || '', '.local', 'mysql', 'mysql-admin.cnf');
const mysqlDumpCommand = process.env.MYSQL_DUMP_BIN
  || (existsSync(path.join(process.env.HOME || '', '.local', 'mysql', 'bin', 'mysqldump'))
    ? path.join(process.env.HOME || '', '.local', 'mysql', 'bin', 'mysqldump')
    : 'mysqldump');

const run = (command, args, options = {}) => {
  execFileSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    ...options,
  });
};

const readEnvValue = (name) => {
  try {
    const source = readFileSync(serverEnvPath, 'utf8');
    const match = source.match(new RegExp(`^(?:export\\s+)?${name}\\s*=\\s*(.*)$`, 'm'));
    return match?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  } catch {
    return undefined;
  }
};

const zipDirectory = (sourceDirectory, outputFile, excludes = []) => {
  rmSync(outputFile, { force: true });
  const exclusionArgs = excludes.flatMap((pattern) => [`-x`, pattern]);
  run('zip', ['-qr', '-X', outputFile, path.basename(sourceDirectory), ...exclusionArgs], { cwd: path.dirname(sourceDirectory) });
};

const buildDatabaseDump = (outputFile) => {
  const database = readEnvValue('MYSQL_DATABASE');
  if (!database) throw new Error(`MYSQL_DATABASE is missing from ${serverEnvPath}.`);
  if (!mysqlDefaultsPath) throw new Error('MYSQL_DUMP_DEFAULTS_FILE is not configured.');

  const temporaryFile = `${outputFile}.tmp`;
  const dump = execFileSync(mysqlDumpCommand, [
    `--defaults-extra-file=${mysqlDefaultsPath}`,
    '--single-transaction',
    '--routines',
    '--events',
    '--triggers',
    '--hex-blob',
    '--no-create-db',
    database,
  ], { encoding: 'utf8' });
  writeFileSync(temporaryFile, `USE \`${database.replace(/`/g, '``')}\`;\n\n${dump}`, { mode: 0o600 });
  rmSync(outputFile, { force: true });
  renameSync(temporaryFile, outputFile);
};

console.log('Building frontend...');
run('npm', ['run', 'build:client']);

mkdirSync(buildDirectory, { recursive: true });
const clientArchive = path.join(buildDirectory, 'client.zip');
const serverArchive = path.join(buildDirectory, 'server.zip');
const databaseDump = path.join(buildDirectory, 'hoclaixetq-mysql.sql');

console.log('Packaging client/dist -> build/client.zip...');
zipDirectory(clientDirectory, clientArchive, ['client/dist/.DS_Store']);

console.log('Packaging server -> build/server.zip...');
zipDirectory(serverDirectory, serverArchive, [
  'server/.env',
  'server/node_modules/*',
  'server/node_modules/**',
  'server/backups/*',
  'server/backups/**',
  'server/data/cpanel-credentials.json',
  'server/**/.DS_Store',
  'server/.DS_Store',
]);

console.log('Exporting local MySQL -> build/hoclaixetq-mysql.sql...');
buildDatabaseDump(databaseDump);

console.log('Build package completed:');
console.log(`- ${clientArchive}`);
console.log(`- ${serverArchive}`);
console.log(`- ${databaseDump}`);
