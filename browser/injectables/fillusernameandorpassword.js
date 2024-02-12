
(function () {
    let fields = getUsernameAndPasswordFields();
    if (!fields) return;
    console.log(window.location.host)
    console.log("$domain$")
    if (window.location.host === "$domain$") {  // To be sure!    
        if (fields.userNameField) {
            fields.userNameField.value = decodeURIComponent("$username$");
        }
        if (fields.passwordField) {
            fields.passwordField.value = decodeURIComponent("$password$");
        }
    }
})()