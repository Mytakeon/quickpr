const { execSync } = require("child_process");
const { exit } = require("process");

const quickpr = () => {
    if (process.argv.length !== 3) {
        console.log(`Usage: quickpr '<commit message>'`);
        exit(1);
    }

    const commitMessage = process.argv[2];

    // check if git executable exists
    if (!execSync('git --version').toString().includes('git version')) {
        exit(1);
    }

    try {
        const hasChanges = execSync('git status -s').toString();
        if (!hasChanges) {
            console.log('No files changed');
            exit(0);
        }
    } catch (error) {
        exit(1);
    }

    const branchName = `feature/${commitMessage.replace(/\s/g, "-").toLowerCase()}`;
    const remotes = execSync('git remote').toString().split('\n');
    let remoteName;
    if (remotes.length === 0) {
        console.error('No remotes found');
        exit(1);
    } else if (remotes.length > 2) {
        if (remotes.indexOf('origin') === -1) {
            console.error('More than one remote found, and origin is not one of them - exiting');
            exit(1);
        }
        remoteName = 'origin';
    } else {
        remoteName = remotes[0];
    }
    console.log(`Using remote '${remoteName}'`);

    execSync(`git checkout -b ${branchName}`);
    execSync("git add .");
    execSync(`git commit -m "${commitMessage}"`);
    execSync(`git push --set-upstream ${remoteName} ${branchName}`);

    const remoteUrl = execSync(`git remote get-url ${remoteName}`).toString().trim();
    exec(`start ${getPRUrl(remoteUrl, branchName)}`);
}

const getPRUrl = (remoteUrl, sourceBranch) => {
    if (remoteUrl.includes('github.com')) {
        // take the .git away from the remoteUrl
        return `${remoteUrl.slice(0, -4)}/compare/${sourceBranch}?expand=1`
    } else if (remoteUrl.indexOf('visualstudio.com') > -1) {
        // git get the default branch
        const targetBranch = execSync(`git rev-parse --abbrev-ref ${remoteName}/HEAD`).toString().split("/")[1].trim();
        console.log(`Using target branch '${targetBranch}'`);
        return `${remoteUrl}/pullrequestcreate?sourceRef=${sourceBranch}&targetRef=${targetBranch}`;
    } else {
        console.error('Unsupported remote');
        exit(1);
    }
}

quickpr()