Package.describe({
    summary:"MyPackage doing amazing stuff with AWS."
});


Package.on_use(function(api){
    // add your package file to the server app
    api.add_files("my-package.js","server");
    // what we export outside of the package
    // (this is important : packages have their own scope !)
    api.export("MyPackage","server");
});