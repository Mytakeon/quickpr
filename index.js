const { execSync } = require("child_process");
const { exit } = require("process");

const quickGitPr = () => {
    if (process.argv.length !== 3) {
        console.log(`Usage: quickpr '<commit message>'`);
        exit(1);
    }

    const commitMessage = process.argv[2];

    try {
        const hasChanges = execSync('git status -s').toString();
        if (!hasChanges) {
            console.log('No files changed');
            exit(0);
        }
    } catch (error) {
        // Not a git repository/git executable does not exist
        exit(1);
    }

    const branchName = `feature/${commitMessage.replace(/\s/g, "-").toLowerCase()}`;
    const remotes = execSync('git remote').toString().split('\n');
    let remoteName;
    if (remotes.length === 1) {
        console.error('No remotes found');
        exit(1);
    } else if (remotes.length > 2) {
        if (remotes.indexOf('origin') === -1) {
            console.error("More than one remote found, and 'origin' is not one of them - exiting");
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
    execSync(`start ${getPRUrl(remoteUrl, branchName, remoteName)}`);
}

const getPRUrl = (remoteUrl, sourceBranch, remoteName) => {

    if (remoteUrl.includes('github.com') || remoteUrl.includes('ghe.com')) { // Github, Github Enterprise
        // take the .git away from the remoteUrl
        return `${remoteUrl.slice(0, -4)}/compare/${sourceBranch}?expand=1`;
    } else if (remoteUrl.includes('visualstudio.com')) { // Azure DevOps
        const targetBranch = execSync(`git rev-parse --abbrev-ref ${remoteName}/HEAD`).toString().split("/")[1].trim();
        console.log(`Using target branch '${targetBranch}'`);
        return `${remoteUrl}/pullrequestcreate?sourceRef=${sourceBranch}&targetRef=${targetBranch}`;
    } else {
        console.error(`Unsupported remote '${remoteUrl}'. Consider openning an issue to add it: https://github.com/Mytakeon/quickpr/issues/new`);
        exit(1);
    }
}

quickGitPr()