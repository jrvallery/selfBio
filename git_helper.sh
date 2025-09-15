git status
git add .

read -rp "Enter commit message: " msg
if [ -z "$msg" ]; then
  echo "No commit message provided. Aborting."
  exit 1
fi

git commit -m "$msg"

git pull

git push