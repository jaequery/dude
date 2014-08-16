#dude - It's the cPanel killer, SRSLY!

Dude is a CLI tool for managing LEMP vhosts in Ubuntu.


###Example

To create a vhost, just do the following:
```
dude create site.com
dude start site.com
```

This creates an nginx vhost for site.com.

```
Your working app directory: ~/www/site.com
Your document root: ~/www/site.com/public
Your
```

If you want to take it down temporarily:

```
dude stop site.com
```

To take it down permanently and delete it:

```
dude delete site.com
```



====


Symlink the dude.js to /usr/local/bin/dude


```
root@1c14046357b7:~/# dude

  Usage: dude [options] [command]

  Commands:

    init [options]
       initialize dude

    create <domain>
       create a domain

    start <domain>
       start a domain

    stop <domain>
       stop a domain

    list
       list domains

    delete <domain>
       delete a domain

    backup <domain>
       backup domain


  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    
```
