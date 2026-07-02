const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'web-ext-artifacts');
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'ext', 'manifest.json'), 'utf8')
);
const archiveName = `hide_promoted_jobs-${manifest.version}.zip`;

function checksum(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function build(tempRoot, name) {
  const artifactsDir = path.join(tempRoot, name);
  fs.mkdirSync(artifactsDir);
  const archivePath = path.join(artifactsDir, archiveName);
  execFileSync(
    'git',
    ['archive', '--format=zip', `--output=${archivePath}`, 'HEAD:ext'],
    { cwd: root, stdio: 'inherit' }
  );
  return archivePath;
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hide-promoted-jobs-'));

try {
  const headManifest = JSON.parse(
    execFileSync('git', ['show', 'HEAD:ext/manifest.json'], {
      cwd: root,
      encoding: 'utf8',
    })
  );
  if (headManifest.version !== manifest.version) {
    throw new Error(
      `Commit the release metadata before building: HEAD is ${headManifest.version}, working tree is ${manifest.version}`
    );
  }

  const firstArchive = build(tempRoot, 'first');
  const secondArchive = build(tempRoot, 'second');
  const firstHash = checksum(firstArchive);
  const secondHash = checksum(secondArchive);

  if (firstHash !== secondHash) {
    throw new Error(
      `Release is not reproducible: ${firstHash} does not match ${secondHash}`
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const outputArchive = path.join(outputDir, path.basename(firstArchive));
  const checksumPath = `${outputArchive}.sha256`;
  fs.copyFileSync(firstArchive, outputArchive);
  fs.writeFileSync(
    checksumPath,
    `${firstHash}  ${path.basename(outputArchive)}\n`
  );

  process.stdout.write(`Release archive: ${outputArchive}\n`);
  process.stdout.write(`SHA-256: ${firstHash}\n`);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
