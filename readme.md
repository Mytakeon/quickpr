Small git utility to quickly open a pull request against the default branch.
It pushes the local changes to a new branch and open the URL to create a new pull request.

Installation:

```bash
npm install -g quickgitpr
```

Usage:

```bash
cd mygitrepo
touch newfile.txt
quickgitpr "Added a few file" # Opens a PR against the main branch to add "newfile.txt"
```
