#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

apt update -y && apt upgrade -y
apt --fix-broken install -y

apt install nginx curl -y

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"

nvm install --lts=jod
npm install -g pm2

npm install
npm run build

pm2 delete all
pm2 start npm --name "next-js" -- start

cp nginx.conf /etc/nginx/sites-available/default
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
