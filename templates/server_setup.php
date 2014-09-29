#!/bin/bash

# install dependencies
apt-get update && apt-get install -y nginx php5-mysql php5-fpm php5-curl php5-mcrypt php-pear git nodejs npm mysql-server curl sudo

# setup nodejs symlink
ln -s /usr/bin/nodejs /usr/local/bin/node

# install the dude
DUDE_PATH=/var/dude
mkdir -p $DUDE_PATH
cd $DUDE_PATH
git clone https://github.com/jaequery/dude.git .
ln -s $DUDE_PATH/dude.js /usr/local/bin/dude

# get latest packages and update to use latest node
npm update
npm install -g n
n latest

# enable php modules
/usr/sbin/php5enmod mcrypt

# start services
/etc/init.d/nginx start
/etc/init.d/php5-fpm start
/etc/init.d/mysql start
