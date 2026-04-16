// Ad-hoc sign the packaged .app so macOS doesn't reject it as "damaged".
// Uses the `-` pseudo-identity — no Apple Developer certificate required.
// Users still see a one-time "unidentified developer" prompt (right-click → Open),
// but no longer need to run `xattr -cr` after install.
const { execSync } = require('child_process');
const path = require('path');

exports.default = async function afterSign(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const appPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`
  );
  execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: 'inherit' });
};
