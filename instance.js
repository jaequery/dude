var Q = require('q'),
exec = require('child_process').exec,
handlebars = require('handlebars'),
fs = require('fs');

var Instance = function instance(domain){

    var self = this;

    this.init = function(){
	return Q.promise( function(resolve, reject, notify){
	    get_user().then(function(user){
		self.domain = domain;
		self.cwd = require('path').dirname(require.main.filename);
		self.home_path = '/home/' + user;
		self.dude_path = self.home_path + '/.dude';
		self.project_dir = self.dude_path + '/' + domain;
		self.project_vhost = self.project_dir + '/vhost';
		self.project_app = self.home_path + '/www/'+domain;
		self.project_doc_root = self.project_app + '/public';
		self.project_logs = self.project_app + '/logs';
		self.symlink_path = '/etc/nginx/sites-enabled/' + domain;
		self.vhost_path = self.project_vhost + '/' + domain;
		self.user = user;
		return resolve();
	    })
	})
    }

    this.create = function(){
	return self.init()
	    .then(self.create_directories)
	    .then(self.generate_vhost)
            .then(self.generate_sample_index)
	    .then(self.set_perms)
	    .fail(console.log)
	    .done(console.log(domain + ' created'));
    }

    this.delete = function(){
	return self.init()
	.then(	self.stop(self.domain) )
	.then( function(){
	    var cmd = '/bin/rm -rf ' + self.project_app;
	    exec(cmd, function(err,stout,sterr){
		if(err){
		    return reject(err);
		}else{
	            console.log(self.domain + ' has been deleted');
		}
	    });
	});
    }

    this.start = function(){
	return self.init()
	.then( function(){
	    var cmd = 'sudo ln -s '+self.vhost_path + ' ' + self.symlink_path;
	    exec(cmd, function(err,stout,sterr){
		if(err){
		    console.log(self.domain + ' already started')
		}else{
		    var cmd = "sudo /etc/init.d/nginx restart";
		    exec(cmd, function(err, stout, sterr){
			if(err) {
			    console.log(err);
			}else{
			    console.log(self.domain + ' started');
			}
		    });
		}
	    })
	})

    }

    this.stop = function(){
	return self.init()
	.then( function(){
	    var cmd = 'sudo rm ' + self.symlink_path;
	    exec(cmd, function(err,stout,sterr){
		if(err){
		    console.log('err',err);
		}else{

		    // restart nginx
		    var cmd = "sudo /etc/init.d/nginx restart";
		    exec(cmd, function(err, stout, sterr){
			if(err) {
			    console.log(err);
			}else{
			    console.log(self.domain + ' stopped');
			}
		    });
		}
	    })
	})
    }

    this.create_directories = function(){
        return Q.promise(function(resolve,reject,notify){
	    //console.log('create folders');
            create_directory(self.project_dir)
                .then( function(){
                    return create_directory(self.project_vhost);
                }).then( function(){
                    return create_directory(self.project_app);
                }).then( function(){
                    return create_directory(self.project_doc_root);
		}).then( function(){
		    return create_directory(self.project_logs);
                }).fail( function(){
                    reject()
                }).done( function(){
                    resolve();
                })
        });
    }

    this.generate_sample_index = function(){
        return Q.promise( function(resolve, reject, notify){
            read_template(self.cwd+'/templates/index.php').then( function(html){
                var template = handlebars.compile(html);
                var string = template( {domain:self.domain} )

                fs.writeFile(self.project_doc_root + '/index.php', string, function(err){
                    if(err){
                        return reject(err);
                    }else{
                        //console.log('sample generated');
                        return resolve();
		    }
                });
            })
        })
    }

    this.generate_vhost = function(){
        return Q.promise( function(resolve, reject, notify){
            read_template(self.cwd+'/templates/nginx_vhost.conf').then( function(conf){
                var template = handlebars.compile(conf);
                var string = template( {domain:self.domain, doc_root_path: self.project_doc_root, log_path: self.project_logs, app_path: self.project_app} )

                fs.writeFile(self.vhost_path, string, function(err){
                    if(err){
			console.log(self.vhost_path);
                        return reject(err);
                    }else{
			return resolve();
		    }
                });
            })
        })
    }

    this.set_perms = function(){
	return Q.promise( function(resolve, reject, notify){
	    get_user().then( function(user){
		var cmd = 'sudo chown -R ' + user + ':www-data ' + self.project_app + ' && chmod -R g+w ' + self.project_app;
		exec(cmd, function(err,stout,sterr){
                    if(err){
                	console.log(err);
			return reject(err);
            	    }else{
			return resolve();
            	    }
        	});
	    })
	})
    }
}

module.exports = Instance;

function check_directory(dir_path){
    return Q.promise( function(resolve,reject,notify){
	if (fs.existsSync(dir_path)) {
            return resolve();
        }else{
	    return reject();
	}
    });
}

function create_directory(dir_path){
    return Q.Promise(function(resolve,reject,notify){
        check_directory(dir_path).then( function(){
            return resolve();
        }).fail(function(){
            var cmd = 'mkdir -p ' + dir_path;
            exec(cmd, function(err,stout,sterr){
                if(err){
                    console.log('error creating directory',err);
                    return reject();
                }else{
                    return resolve();
                }
            })
        })
    })
}

function read_template(file){
    return Q.promise( function(resolve,reject,notify){
        fs.readFile(file, function(err, data){
            if(err){ 
		console.log('error', err);
		return reject(err); 
	    }
            return resolve(data.toString());
        });
    })
}

function get_user(){
    return Q.promise( function(resolve,reject,notify){
	var cmd = '/usr/bin/whoami';
        exec(cmd, function(err,stout,sterr){
            if(err){
                console.log(err);
                return reject();
            }else{
                return resolve(stout.trim());
            }
        })
    })
}
